import { v } from "convex/values";

import { mutation } from "./_generated/server";

const MATCH_CODE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const MATCH_CODE_LENGTH = 6;

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
        });

        return {
            matchId,
            code,
        };
    },
});
