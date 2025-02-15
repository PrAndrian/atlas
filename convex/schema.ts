import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    solBalance: v.optional(v.number()),
    isAdmin: v.optional(v.boolean()),
  }).index("by_token", ["tokenIdentifier"]),
  questions: defineTable({
    text: v.string(),
    likes: v.number(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
});
