import { auth } from "@clerk/nextjs/server";

/**
 * Check if the current user is an admin
 * This runs server-side in a Server Component
 */
export async function checkIfUserIsAdmin() {
  try {
    const authResult = await auth();
    const { userId, sessionClaims } = authResult;

    if (!userId) {
      return false;
    }

    // Check admin status directly from Clerk's metadata
    const metadata = (sessionClaims?.metadata as { role?: string }) || {};
    return metadata.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get user role from Clerk
 * This runs server-side in a Server Component
 */
export async function getUserRole() {
  try {
    const authResult = await auth();
    const { userId, sessionClaims } = authResult;

    if (!userId) {
      return null;
    }

    // Return the role from session claims
    const metadata = (sessionClaims?.metadata as { role?: string }) || {};
    return metadata.role;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}
