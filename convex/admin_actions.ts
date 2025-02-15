import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { MutationCtx, mutation } from "./_generated/server";

async function requireAdmin(ctx: MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();

  if (!user?.isAdmin) throw new Error("Not authorized");
  return user;
}

export const setUserAdmin = mutation({
  args: { userId: v.id("users"), isAdmin: v.boolean() },
  handler: async (
    ctx: MutationCtx,
    { userId, isAdmin }: { userId: Id<"users">; isAdmin: boolean }
  ) => {
    await requireAdmin(ctx);
    await ctx.db.patch(userId, { isAdmin });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx: MutationCtx, { userId }: { userId: Id<"users"> }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(userId);
  },
});
