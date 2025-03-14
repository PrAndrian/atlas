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

    // Get admin status from Clerk metadata
    const isAdmin =
      (userIdentity.privateMetadata as { isAdmin?: boolean })?.isAdmin === true;

    return await ctx.db.insert("users", {
      tokenIdentifier: userIdentity.tokenIdentifier,
      email: userIdentity.email!,
      lastLoginAt: new Date().toISOString(),
      isAdmin,
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

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user?.isAdmin ?? false;
  },
});

// Admin-only functions
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user?.isAdmin) throw new Error("Not authorized");

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
