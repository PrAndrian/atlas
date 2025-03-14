import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx, mutation } from "./_generated/server";

async function requireAdmin(ctx: MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  // Check admin status from Clerk metadata
  const role = (identity.privateMetadata as { role?: string })?.role;
  if (role !== "admin") throw new Error("Not authorized");

  // Find the user in the database
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

export const setUserAdmin = mutation({
  args: { userId: v.id("users"), isAdmin: v.boolean() },
  handler: async (
    ctx: MutationCtx,
    { userId, isAdmin }: { userId: Id<"users">; isAdmin: boolean }
  ) => {
    // Verify the current user is an admin
    await requireAdmin(ctx);

    // Get the user's Clerk ID from Convex database
    const userToUpdate = await ctx.db.get(userId);
    if (!userToUpdate) {
      throw new Error("User not found");
    }

    // Extract the Clerk user ID from the tokenIdentifier
    // The format is typically "clerk:user_id"
    const clerkUserId = userToUpdate.tokenIdentifier.split(":")[1];
    if (!clerkUserId) {
      throw new Error("Invalid user token identifier");
    }

    // Since we can't directly call our API route from Convex,
    // we'll need to inform the client of the need to update the role
    // The client should then call the API route with the clerk user ID

    return {
      success: false,
      message: "Role management is now handled through Clerk",
      action: "update_clerk_role",
      userId: clerkUserId,
      role: isAdmin ? "admin" : "user",
    };
  },
});

// A new action to properly reflect that we're now delegating to Clerk
export const updateUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, { userId, role }: { userId: string; role: string }) => {
    // Verify the current user is an admin
    await requireAdmin(ctx);

    // This function should be called client-side, which will then
    // make a request to our /api/admin/set-user-role endpoint
    // We're just returning info to be used by the client

    return {
      success: true,
      message: "Please call the set-user-role API endpoint with this data",
      userId,
      role,
    };
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx: MutationCtx, { userId }: { userId: Id<"users"> }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(userId);
  },
});
