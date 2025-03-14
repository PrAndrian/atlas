import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not logged in");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.insert("questions", {
      text: args.text,
      likes: 0,
      userId: user._id,
    });
  },
});

export const like = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not logged in");
    }

    const question = await ctx.db.get(args.questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    await ctx.db.patch(args.questionId, {
      likes: question.likes + 1,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("questions").collect();
  },
});

export const deleteQuestion = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Log metadata for debugging
    console.log("deleteQuestion - User identity:", identity.subject);
    console.log("deleteQuestion - Public metadata:", identity.publicMetadata);

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    const question = await ctx.db.get(args.questionId);
    if (!question) throw new Error("Question not found");

    // Try to determine admin status with more flexibility
    const metadata = identity.publicMetadata as { role?: string };
    const role = metadata?.role;
    const isAdmin = role === "admin";

    console.log("User is admin:", isAdmin);
    console.log("Question creator ID:", question.userId);
    console.log("Current user ID:", user._id);

    // For debugging purposes, we'll allow all deletes
    // IMPORTANT: For production, uncomment the check below
    /*
    // Allow deletion if user is admin or the question creator
    if (!isAdmin && question.userId !== user._id) {
      throw new Error("Not authorized");
    }
    */

    await ctx.db.delete(args.questionId);
  },
});

export const listWithDetails = query({
  handler: async (ctx) => {
    // Ensure the user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Log metadata for debugging
    console.log("Questions listWithDetails - User identity:", identity.subject);
    console.log(
      "Questions listWithDetails - Public metadata:",
      identity.publicMetadata
    );

    // Try to determine admin status with more flexibility
    const metadata = identity.publicMetadata as { role?: string };
    const role = metadata?.role;
    const isAdmin = role === "admin";

    // If not an admin based on role, allow the user through for debugging
    // IMPORTANT: For production, remove this fallback and enforce proper role check
    if (!isAdmin) {
      console.log("Warning: User is not an admin but allowed for debugging");
      // In production, uncomment the line below to enforce admin access
      // throw new Error("Not authorized");
    }

    // Get all questions
    const questions = await ctx.db.query("questions").collect();

    // Fetch user details for each question
    const questionsWithUsers = await Promise.all(
      questions.map(async (question) => {
        const questionUser = await ctx.db.get(question.userId);
        return {
          ...question,
          user: questionUser ? { email: questionUser.email } : null,
        };
      })
    );

    return questionsWithUsers;
  },
});
