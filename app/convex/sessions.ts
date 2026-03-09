import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
    args: {
        userId: v.id("user"),
        tokenHash: v.string(),
        createdAt: v.number(),
        expiresAt: v.number(),
        userAgent: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        return await ctx.db.insert("sessions", {
            userId: args.userId,
            tokenHash: args.tokenHash,
            createdAt: args.createdAt,
            expiresAt: args.expiresAt,
            userAgent: args.userAgent,
            ipAddress: args.ipAddress,
        });
    },
});

export const getSessionByTokenHash = query({
    args: {
        tokenHash: v.string(),
    },

    handler: async (ctx, args) => {
        return await ctx.db
            .query("sessions")
            .withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash))
            .unique();
    },
});

export const deleteSessionByTokenHash = mutation({
    args: {
        tokenHash: v.string(),
    },

    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash))
            .unique();

        if (!session) {
            return null;
        }

        await ctx.db.delete(session._id);
        return session._id;
    },
});

export const deleteSessionsByUser = mutation({
    args: {
        userId: v.id("user"),
    },

    handler: async (ctx, args) => {
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }

        return sessions.length;
    },
});
