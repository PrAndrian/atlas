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
    const role = (identity.publicMetadata as { role?: string })?.role;
    return role === "admin";
  },
});

// Admin-only functions
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Log metadata for debugging
    console.log("User identity:", identity.subject);
    console.log("Auth metadata:", identity.authMetadata);
    console.log("Public metadata:", identity.publicMetadata);

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

// Add a debug function to test the user identity
export const debugIdentity = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return { status: "unauthenticated", message: "No user is logged in" };
    }

    // Log all available information from the identity
    console.log("========== DEBUG USER IDENTITY ==========");
    console.log("Full identity object:", JSON.stringify(identity, null, 2));
    console.log("Subject:", identity.subject);
    console.log("Token identifier:", identity.tokenIdentifier);
    console.log("Public metadata:", identity.publicMetadata);
    console.log("Email:", identity.email);
    console.log("=========================================");

    return {
      status: "authenticated",
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      publicMetadata: identity.publicMetadata,
    };
  },
});

// Function to get users with their admin status
export const listWithAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Log metadata for debugging
    console.log("listWithAdminStatus - User identity:", identity.subject);
    console.log(
      "listWithAdminStatus - Public metadata:",
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

    // Get all users
    const users = await ctx.db.query("users").collect();

    // Get roles by checking identity.tokenIdentifier for each user
    return await Promise.all(
      users.map(async (user) => {
        // Check if this user has a Clerk role "admin" by looking up their public metadata
        // Since we can't access Clerk's API directly from Convex, we'll use a heuristic:
        // For now just return the isAdmin status if we know the user email
        // matches an admin email (hardcoded for testing purposes)
        const knownAdminEmails = ["princy.workspace@gmail.com"]; // Add admin emails here
        const isUserAdmin = knownAdminEmails.includes(user.email);

        return {
          ...user,
          isAdmin: isUserAdmin,
          role: isUserAdmin ? "admin" : "user",
        };
      })
    );
  },
});
