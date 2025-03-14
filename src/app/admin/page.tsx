"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Activity, FileCheck, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import DebugAuth from "./debug-auth";

// Simple debug component to show admin role information
function RoleDebugInfo() {
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues by only rendering on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fix the role type checking - ensure we get a string or undefined
  const metadata = user?.publicMetadata as Record<string, string> | undefined;
  const userRole = metadata?.role || null;
  const isAdmin = userRole === "admin";
  const metadataString = user?.publicMetadata
    ? JSON.stringify(user.publicMetadata)
    : "{}";

  // Don't render anything during SSR
  if (!isClient) {
    return (
      <Card className="mb-8 bg-slate-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">User Role Debug Info</CardTitle>
          <CardDescription>Loading user information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-16 flex items-center justify-center">
            <p>Loading user information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-slate-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-700">User Role Debug Info</CardTitle>
        <CardDescription>
          Information to debug admin permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <p>
            <strong>User Email:</strong>{" "}
            {user?.emailAddresses[0]?.emailAddress || "Not loaded"}
          </p>
          <p>
            <strong>Role from publicMetadata:</strong>{" "}
            {userRole || "No role set"}
          </p>
          <p>
            <strong>Is Admin:</strong> {isAdmin ? "Yes" : "No"}
          </p>
          <p>
            <strong>Public Metadata:</strong> {metadataString}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <div>
      {/* Add the debug component */}
      <RoleDebugInfo />

      {/* Add the Clerk JWT debug component */}
      <DebugAuth />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+120</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 new admin this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+25% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>View and configure user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/admin/manage-users"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Go to User Management
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Questions</CardTitle>
            <CardDescription>View and delete user questions</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/admin/manage-questions"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Go to Question Management
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>View Analytics</CardTitle>
            <CardDescription>See platform activity and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/admin/analytics"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Go to Analytics
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure application preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/admin/settings"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Go to Settings
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
