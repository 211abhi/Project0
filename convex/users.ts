import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = internalMutation({
    args: {
        id: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        emailVerified: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        const now = Date.now();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                image: args.image,
                emailVerified: args.emailVerified,
                updatedAt: now,
            });
            return existingUser._id;
        } else {
            return await ctx.db.insert("users", {
                email: args.email,
                name: args.name,
                image: args.image,
                emailVerified: args.emailVerified ?? false,
                createdAt: now,
                updatedAt: now,
            });
        }
    },
});

export const getUserByEmail = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

export const getUserById = query({
    args: {
        id: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

