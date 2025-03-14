"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";

// A client component layout for admin section with proper admin checks
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const isAdmin = useQuery(api.users.isAdmin);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated
      if (!isAuthenticated) {
        router.push("/");
      }
      // Not admin
      else if (isAdmin === false) {
        router.push("/");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Show nothing while loading or if not admin
  if (isLoading || !isAuthenticated || isAdmin === undefined) {
    return <div>Loading...</div>;
  }

  if (isAdmin === false) {
    return null; // Will redirect via useEffect
  }

  // User is authenticated and is an admin
  return <div className="admin-layout">{children}</div>;
}
