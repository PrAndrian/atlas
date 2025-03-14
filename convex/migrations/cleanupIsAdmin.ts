import { internalMutation } from "../_generated/server";

/**
 * Migration script to remove the isAdmin field from all user records
 * Run with: npx convex run migrations/cleanupIsAdmin:removeIsAdminField
 *
 * Note: This is using internalMutation to bypass authentication for migration purposes.
 * This should only be used during the migration process and then should be removed.
 */
export const removeIsAdminField = internalMutation({
  args: {},
  handler: async (ctx) => {
    // For schema migrations, we don't need authentication checks
    console.log("Starting cleanup of isAdmin field from user records...");

    // 1. Get all users from the database
    const users = await ctx.db.query("users").collect();
    console.log(`Found ${users.length} user records to check.`);

    // 2. Track the migration results
    const results = {
      total: users.length,
      cleaned: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // 3. Process each user
    for (const user of users) {
      try {
        // Check if the user has an isAdmin field using dynamic access
        const userObj = user as Record<string, unknown>;

        if ("isAdmin" in userObj) {
          // Instead of trying to set isAdmin to undefined, we'll replace the document
          // with a new one that doesn't have the isAdmin field
          const { _id, tokenIdentifier, email, lastLoginAt } = user;

          // Create a new document with only the fields we want
          const cleanUserData = {
            tokenIdentifier,
            email,
            lastLoginAt,
          };

          // Use replace instead of patch to avoid type errors
          await ctx.db.replace(_id, cleanUserData);

          console.log(`Removed isAdmin field from user ${email}`);
          results.cleaned++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        const errorMessage = `Error processing user ${user.email}: ${
          error instanceof Error ? error.message : String(error)
        }`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }

    console.log(`
    Migration completed:
    - Total users processed: ${results.total}
    - Users cleaned: ${results.cleaned}
    - Users skipped (no isAdmin field): ${results.skipped}
    - Errors: ${results.errors.length}
    `);

    return results;
  },
});
