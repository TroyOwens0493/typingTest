import { mutation } from "./_generated/server"
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


        await ctx.db.insert("user", {
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
})
