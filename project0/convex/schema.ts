import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        emailVerified: v.optional(v.boolean()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_email", ["email"]),
});

