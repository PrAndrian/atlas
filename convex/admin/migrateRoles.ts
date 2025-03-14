import { MutationCtx, mutation } from "../_generated/server";

/**
 * Migration script to transfer admin roles from Convex database to Clerk
 * Run this from the Convex dashboard or via CLI:
 *
 * npx convex run admin/migrateRoles:migrateAdminRolesToClerk
 *
 * You need to set CLERK_SECRET_KEY and BASE_URL in your environment variables.
 */

/**
 * Helper function to extract Clerk user ID from tokenIdentifier
 */
function extractClerkUserId(tokenIdentifier: string): string {
  const parts = tokenIdentifier.split(":");
  if (parts.length < 2) {
    throw new Error(`Invalid token identifier format: ${tokenIdentifier}`);
  }
  return parts[1];
}

/**
 * Migration mutation to transfer admin roles from Convex to Clerk
 */
export const migrateAdminRolesToClerk = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    // 1. First verify the current user is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check admin status from Clerk metadata
    const role = (identity.privateMetadata as { role?: string })?.role;
    if (role !== "admin") throw new Error("Only admins can run this migration");

    console.log("Starting admin role migration from Convex to Clerk...");

    // 2. Get all users from the database
    const users = await ctx.db.query("users").collect();

    // Custom filtering for admin users
    const adminUsers = [];
    for (const user of users) {
      try {
        // Use dynamic access to avoid TypeScript errors
        const userObj = user as Record<string, unknown>;

        if (userObj["isAdmin"] === true) {
          adminUsers.push(user);
        }
      } catch (e) {
        // If accessing the field throws an error due to schema validation, skip this user
        console.error(`Error checking admin status for user ${user.email}:`, e);
      }
    }

    console.log(`Found ${adminUsers.length} admin users to migrate.`);

    // 3. Track migration results
    const results = {
      success: true,
      total: adminUsers.length,
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // 4. Nothing to migrate, return early
    if (adminUsers.length === 0) {
      console.log("No admin users found. Nothing to migrate.");
      return results;
    }

    // 5. For each admin user, prepare data for Clerk API call
    const updates = adminUsers.map((user) => ({
      userId: extractClerkUserId(user.tokenIdentifier),
      email: user.email,
      role: "admin",
    }));

    // 6. Return the list of users to be updated (actual update will be done client-side)
    return {
      ...results,
      adminUsersToUpdate: updates,
      message: "Please call your set-user-role API for each of these users",
    };
  },
});
