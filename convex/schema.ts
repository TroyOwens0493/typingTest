import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    user: defineTable({
        username: v.string(),
        password: v.string(),
        email: v.string(),
        rank: v.string(),
        level: v.number(),
        gamesPlayed: v.number(),
        gamesWon: v.number(),
        averageWPM: v.number(),
        peakWPM: v.number(),
        totalTime: v.number(),
        averageAccuracy: v.number(),
        recentSessions: v.object({
            time: v.string(),
            wpm: v.number(),
            accuracy: v.number(),
            result: v.string(),
            place: v.number(),
        }),
    }).index("by_email", ["email"]),
    match: defineTable({
        code: v.string(),
        gamemode: v.string(),
        maxPlayers: v.number(),
        difficulty: v.string(),
        visibility: v.string(),
    }),
});
