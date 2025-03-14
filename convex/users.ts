import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", userIdentity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      return user._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: userIdentity.tokenIdentifier,
      email: userIdentity.email!,
      lastLoginAt: new Date().toISOString(),
    });
  },
});

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Check admin status directly from Clerk metadata instead of the database
    const role = (identity.privateMetadata as { role?: string })?.role;
    return role === "admin";
  },
});

// Admin-only functions
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check admin status from Clerk metadata
    const role = (identity.privateMetadata as { role?: string })?.role;
    if (role !== "admin") throw new Error("Not authorized");

    return await ctx.db.query("users").collect();
  },
});

export const getCurrentUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user?._id;
  },
});
