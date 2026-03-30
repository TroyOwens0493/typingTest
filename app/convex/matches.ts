import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

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

        return {
            ...match,
            playerCount: match.players.length,
            playerWords: playerGameState?.words,
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

        await ctx.db.patch(args.matchId, {
            eliminatedPlayers: [
                ...match.eliminatedPlayers,
                {
                    userId: args.userId,
                    wpm: args.wpm,
                    accuracy: args.accuracy,
                    timeInSeconds: args.timeInSeconds,
                    eliminatedAt: Date.now(),
                },
            ],
        });

        return { success: true };
    },
});
