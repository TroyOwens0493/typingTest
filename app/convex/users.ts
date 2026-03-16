import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createUser = mutation({
    args: {
        username: v.string(),
        email: v.string(),
        password: v.string(),
    },

    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("user")
            .filter((q) => q.eq(q.field("email"), args.email))
            .unique()

        if (existing) {
            throw new Error("Email already exists")
        }

        return await ctx.db.insert("user", {
            username: args.username,
            email: args.email,
            password: args.password,
            rank: "Bronze",
            level: 1,
            gamesPlayed: 0,
            gamesWon: 0,
            averageWPM: 0,
            peakWPM: 0,
            totalTime: 0,
            averageAccuracy: 0,
            recentSessions: {
                time: "",
                wpm: 0,
                accuracy: 0,
                result: "",
                place: 0,
            },
        })
    },
});

export const getUser = query({
    args: {
        id: v.id("user"),
    },

    handler: async (ctx, args) => {
        const accInfo = await ctx.db.get(args.id)

        if (!accInfo) {
            throw new Error("User doesn't exist");
        }

        return accInfo;
    },
});

export const getUserByEmail = query({
    args: {
        email: v.string(),
    },

    handler: async (ctx, args) => {
        const accInfo = await ctx.db
            .query("user")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!accInfo) {
            throw new Error("User doesn't exist");
        }

        return accInfo;
    },
});

export const getUserByUsername = query({
    args: {
        username: v.string(),
    },

    handler: async (ctx, args) => {
        return await ctx.db
            .query("user")
            .filter((q) => q.eq(q.field("username"), args.username))
            .unique();
    },
});

export const updateUsername = mutation({
    args: {
        id: v.id("user"),
        username: v.string(),
    },

    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);

        if (!user) {
            throw new Error("User doesn't exist");
        }

        await ctx.db.patch(args.id, {
            username: args.username,
        });
    },
});

export const updatePassword = mutation({
    args: {
        id: v.id("user"),
        password: v.string(),
    },

    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);

        if (!user) {
            throw new Error("User doesn't exist");
        }

        await ctx.db.patch(args.id, {
            password: args.password,
        });
    },
});
