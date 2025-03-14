"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminNav } from "./components/AdminNav";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  // Check if user has admin role
  const isAdmin = user?.publicMetadata?.role === "admin";

  useEffect(() => {
    if (isAuthLoaded && isUserLoaded) {
      // Not authenticated
      if (!isSignedIn) {
        router.push("/");
      }
      // Not admin
      else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, isAdmin, router]);

  // Show nothing while loading or if not admin
  if (!isAuthLoaded || !isUserLoaded || !isSignedIn) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  // User is authenticated and is an admin
  return (
    <div className="admin-layout container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Manage your application settings and users
      </p>

      <AdminNav />

      <div className="admin-content">{children}</div>
    </div>
  );
}
