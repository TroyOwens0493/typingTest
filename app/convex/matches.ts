import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const MATCH_CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MATCH_CODE_LENGTH = 6;

const typingWordValidator = v.object({
    text: v.string(),
    state: v.union(v.literal("pending"), v.literal("active")),
    status: v.optional(v.union(v.literal("correct"), v.literal("incorrect"))),
    typed: v.optional(v.string()),
});

/** Creates a fresh per-player word-state copy from the match seed words. */
function cloneWords(words: Array<{
    text: string;
    state: "pending" | "active";
    status?: "correct" | "incorrect";
    typed?: string;
}>) {
    return words.map((word) => ({ ...word }));
}

/** Builds live stats for a player's in-progress run from their current words. */
function getLivePlayerStats(
    words: Array<{
        text: string;
        status?: "correct" | "incorrect";
    }>,
    timeInSeconds: number,
) {
    const evaluatedWords = words.filter((word) => word.status !== undefined);
    const correctCharacters = evaluatedWords.reduce((total, word) => {
        if (word.status === "correct") {
            return total + word.text.length;
        }

        return total;
    }, 0);
    const totalCharacters = evaluatedWords.reduce((total, word) => total + word.text.length, 0);
    const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 0;
    const wpm = timeInSeconds > 0 ? Math.round(correctCharacters / 5 / (timeInSeconds / 60)) : 0;

    return {
        wpm,
        accuracy,
        timeInSeconds,
    };
}

/** Orders opponents for the live stats panel based on the current match mode. */
function sortOpponentStates(
    opponentStates: Array<{
        userId: string;
        username: string;
        stats: {
            wpm: number;
            accuracy: number;
            timeInSeconds: number;
        };
    }>,
    gamemode: string,
) {
    return [...opponentStates].sort((left, right) => {
        if (gamemode === "instant-fail") {
            if (right.stats.timeInSeconds !== left.stats.timeInSeconds) {
                return right.stats.timeInSeconds - left.stats.timeInSeconds;
            }

            if (right.stats.wpm !== left.stats.wpm) {
                return right.stats.wpm - left.stats.wpm;
            }

            return left.username.localeCompare(right.username);
        }

        if (right.stats.wpm !== left.stats.wpm) {
            return right.stats.wpm - left.stats.wpm;
        }

        if (right.stats.accuracy !== left.stats.accuracy) {
            return right.stats.accuracy - left.stats.accuracy;
        }

        if (left.stats.timeInSeconds !== right.stats.timeInSeconds) {
            return left.stats.timeInSeconds - right.stats.timeInSeconds;
        }

        return left.username.localeCompare(right.username);
    });
}

/** Resolves the surviving winner in instant-fail mode once one player remains. */
function getInstantFailWinner(
    players: Id<"user">[],
    eliminatedPlayers: Array<{
        userId: Id<"user">;
    }>,
) {
    const eliminatedIds = new Set(eliminatedPlayers.map((player) => player.userId));

    return players.find((playerId) => !eliminatedIds.has(playerId));
}

/** Fetches a match by its ID. */
export const getMatch = query({
    args: { matchId: v.id("match") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.matchId);
    },
});

/** Generates a random uppercase alphanumeric code for a match. */
function generateMatchCode() {
    return Array.from({ length: MATCH_CODE_LENGTH }, () => {
        const randomIndex = Math.floor(Math.random() * MATCH_CODE_CHARACTERS.length);
        return MATCH_CODE_CHARACTERS[randomIndex];
    }).join("");
}

/** Creates a match with a unique share code and the provided configuration. */
export const createMatch = mutation({
    args: {
        ownerId: v.id("user"),
        gamemode: v.string(),
        maxPlayers: v.number(),
        difficulty: v.string(),
        visibility: v.string(),
        words: v.array(typingWordValidator),
    },

    handler: async (ctx, args) => {
        let code = generateMatchCode();
        let existingMatch = await ctx.db
            .query("match")
            .withIndex("by_code", (q) => q.eq("code", code))
            .unique();

        while (existingMatch) {
            code = generateMatchCode();
            existingMatch = await ctx.db
                .query("match")
                .withIndex("by_code", (q) => q.eq("code", code))
                .unique();
        }

        const matchId = await ctx.db.insert("match", {
            ownerId: args.ownerId,
            code,
            gamemode: args.gamemode,
            maxPlayers: args.maxPlayers,
            difficulty: args.difficulty,
            visibility: args.visibility,
            status: "waiting",
            players: [args.ownerId],
            eliminatedPlayers: [],
            words: args.words,
        });

        await ctx.db.insert("playerGameState", {
            matchId,
            userId: args.ownerId,
            words: cloneWords(args.words),
            updatedAt: Date.now(),
        });

        return {
            matchId,
            code,
        };
    },
});

/** Starts a match, changing its status from waiting to playing. */
export const startMatch = mutation({
    args: {
        matchId: v.id("match"),
        userId: v.id("user"),
    },

    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);

        if (!match) {
            throw new Error("Match not found");
        }

        if (match.ownerId !== args.userId) {
            throw new Error("Only the match owner can start the match");
        }

        if (match.status !== "waiting") {
            throw new Error("Match has already started or finished");
        }

        await ctx.db.patch(args.matchId, {
            status: "playing",
            startedAt: Date.now(),
            winnerId: undefined,
            finishedAt: undefined,
        });

        return { success: true };
    },
});

/** Gets a match with player count and owner details. */
export const getMatchWithPlayers = query({
    args: {
        matchId: v.id("match"),
        userId: v.id("user"),
    },

    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);

        if (!match) {
            return null;
        }

        const playerGameState = await ctx.db
            .query("playerGameState")
            .withIndex("by_match_user", (q) =>
                q.eq("matchId", args.matchId).eq("userId", args.userId),
            )
            .unique();

        const elapsedSeconds = match.startedAt
            ? Math.max(0, Math.floor((Date.now() - match.startedAt) / 1000))
            : 0;
        const opponentIds = match.players.filter((playerId) => playerId !== args.userId);
        const opponentStates = await Promise.all(
            opponentIds.map(async (playerId) => {
                const [player, playerGameStateEntry] = await Promise.all([
                    ctx.db.get(playerId),
                    ctx.db
                        .query("playerGameState")
                        .withIndex("by_match_user", (q) =>
                            q.eq("matchId", args.matchId).eq("userId", playerId),
                        )
                        .unique(),
                ]);

                if (!player || !playerGameStateEntry) {
                    return null;
                }

                const eliminatedPlayer = match.eliminatedPlayers.find(
                    (eliminatedEntry) => eliminatedEntry.userId === playerId,
                );

                return {
                    userId: playerId,
                    username: player.username,
                    stats: eliminatedPlayer
                        ? {
                              wpm: eliminatedPlayer.wpm,
                              accuracy: eliminatedPlayer.accuracy,
                              timeInSeconds: eliminatedPlayer.timeInSeconds,
                          }
                        : getLivePlayerStats(playerGameStateEntry.words, elapsedSeconds),
                };
            }),
        );

        const rankedOpponentStates = sortOpponentStates(
            opponentStates.filter((opponentState) => opponentState !== null),
            match.gamemode,
        ).slice(0, 3);

        const playerEntries = await Promise.all(
            match.players.map(async (playerId) => {
                const player = await ctx.db.get(playerId);

                if (!player) {
                    return null;
                }

                return {
                    userId: playerId,
                    username: player.username,
                };
            }),
        );

        return {
            ...match,
            playerCount: match.players.length,
            playerWords: playerGameState?.words,
            opponentStates: rankedOpponentStates,
            playerEntries: playerEntries.filter((playerEntry) => playerEntry !== null),
        };
    },
});

/** Looks up a match by its 6-character share code. */
export const getMatchByCode = query({
    args: { code: v.string() },

    handler: async (ctx, args) => {
        return await ctx.db
            .query("match")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .unique();
    },
});

/** Fetches all public matches that are waiting and have room for more players. */
export const getPublicWaitingMatches = query({
    args: {},

    handler: async (ctx) => {
        const allMatches = await ctx.db.query("match").collect();

        return allMatches.filter(
            (match) =>
                match.visibility === "public" &&
                match.status === "waiting" &&
                match.players.length < match.maxPlayers,
        );
    },
});

/** Adds a user to a match's player list after validating eligibility. */
export const joinMatch = mutation({
    args: {
        matchId: v.id("match"),
        userId: v.id("user"),
    },

    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);

        if (!match) {
            throw new Error("Match not found");
        }

        if (match.status !== "waiting") {
            throw new Error("Match has already started");
        }

        if (match.players.includes(args.userId)) {
            throw new Error("You have already joined this match");
        }

        if (match.players.length >= match.maxPlayers) {
            throw new Error("Match is full");
        }

        await ctx.db.patch(args.matchId, {
            players: [...match.players, args.userId],
        });

        await ctx.db.insert("playerGameState", {
            matchId: args.matchId,
            userId: args.userId,
            words: cloneWords(match.words),
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

/** Persists the latest word-state snapshot for a player in an active match. */
export const updatePlayerGameState = mutation({
    args: {
        matchId: v.id("match"),
        userId: v.id("user"),
        words: v.array(typingWordValidator),
    },

    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);

        if (!match) {
            throw new Error("Match not found");
        }

        if (!match.players.includes(args.userId)) {
            throw new Error("Player is not in this match");
        }

        const playerGameState = await ctx.db
            .query("playerGameState")
            .withIndex("by_match_user", (q) =>
                q.eq("matchId", args.matchId).eq("userId", args.userId),
            )
            .unique();

        if (!playerGameState) {
            throw new Error("Player game state not found");
        }

        await ctx.db.patch(playerGameState._id, {
            words: cloneWords(args.words),
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

/** Records a player elimination with their final stats for instant-fail mode. */
export const eliminatePlayer = mutation({
    args: {
        matchId: v.id("match"),
        userId: v.id("user"),
        wpm: v.number(),
        accuracy: v.number(),
        timeInSeconds: v.number(),
    },

    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);

        if (!match) {
            throw new Error("Match not found");
        }

        if (match.gamemode !== "instant-fail") {
            throw new Error("Eliminations are only supported in instant-fail mode");
        }

        if (match.status !== "playing") {
            throw new Error("Match is not currently in progress");
        }

        if (!match.players.includes(args.userId)) {
            throw new Error("Player is not in this match");
        }

        if (match.eliminatedPlayers.some((player) => player.userId === args.userId)) {
            return { success: true };
        }

        const eliminatedPlayers = [
            ...match.eliminatedPlayers,
            {
                userId: args.userId,
                wpm: args.wpm,
                accuracy: args.accuracy,
                timeInSeconds: args.timeInSeconds,
                eliminatedAt: Date.now(),
            },
        ];
        const survivingPlayerCount = match.players.length - eliminatedPlayers.length;
        const winnerId =
            survivingPlayerCount === 1
                ? getInstantFailWinner(match.players, eliminatedPlayers)
                : undefined;

        await ctx.db.patch(args.matchId, {
            eliminatedPlayers,
            status: winnerId ? "finished" : match.status,
            winnerId,
            finishedAt: winnerId ? Date.now() : undefined,
        });

        return { success: true };
    },
});

/** Resets a finished match so the owner can start a fresh round. */
export const restartMatch = mutation({
    args: {
        matchId: v.id("match"),
        userId: v.id("user"),
    },

    handler: async (ctx, args) => {
        const match = await ctx.db.get(args.matchId);

        if (!match) {
            throw new Error("Match not found");
        }

        if (match.ownerId !== args.userId) {
            throw new Error("Only the match owner can restart the match");
        }

        const playerStates = await ctx.db
            .query("playerGameState")
            .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
            .collect();

        await Promise.all(
            playerStates.map((playerState) =>
                ctx.db.patch(playerState._id, {
                    words: cloneWords(match.words),
                    updatedAt: Date.now(),
                }),
            ),
        );

        await ctx.db.patch(args.matchId, {
            status: "waiting",
            eliminatedPlayers: [],
            startedAt: undefined,
            winnerId: undefined,
            finishedAt: undefined,
        });

        return { success: true };
    },
});
