import { mutation } from "../_generated/server";

export const removeTotalWins = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if ("totalWins" in user) {
        const userWithoutTotalWins = { ...user };
        delete userWithoutTotalWins.totalWins;
        await ctx.db.patch(user._id, userWithoutTotalWins);
      }
    }
  },
});
