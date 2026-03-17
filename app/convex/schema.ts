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
        ownerId: v.id("user"),
        code: v.string(),
        gamemode: v.string(),
        maxPlayers: v.number(),
        difficulty: v.string(),
        visibility: v.string(),
        words: v.array(
            v.object({
                text: v.string(),
                state: v.union(v.literal("pending"), v.literal("active")),
                status: v.optional(
                    v.union(v.literal("correct"), v.literal("incorrect")),
                ),
                typed: v.optional(v.string()),
            }),
        ),
    }).index("by_code", ["code"]),
    sessions: defineTable({
        userId: v.id("user"),
        tokenHash: v.string(),
        createdAt: v.number(),
        expiresAt: v.number(),
        userAgent: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
    })
        .index("by_user", ["userId"])
        .index("by_token_hash", ["tokenHash"])
        .index("by_expires_at", ["expiresAt"]),
});
