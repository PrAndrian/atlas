import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    email: v.string(),
    lastLoginAt: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),
  questions: defineTable({
    text: v.string(),
    likes: v.number(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
});
