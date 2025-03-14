import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Create a Convex HTTP client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Check if the current user is an admin
 * This runs server-side in a Server Component
 */
export async function checkIfUserIsAdmin() {
  try {
    const { userId } = auth();

    if (!userId) {
      return false;
    }

    // Query Convex directly using the isAdmin function
    // Convex will verify using the auth session
    const isAdmin = await convex.query(api.users.isAdmin);
    return isAdmin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
