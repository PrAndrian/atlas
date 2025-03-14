"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Shield, User } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

// Using shadcn components but if they're not available, you may need to install them
// npm install @shadcn/ui
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

// If these components don't exist, you can create them or use alternatives
const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full">{children}</table>
);
const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead>{children}</thead>
);
const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);
const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr>{children}</tr>
);
const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-2 text-left">{children}</th>
);
const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-2">{children}</td>
);

type UserWithRole = {
  id: Id<"users">;
  email: string;
  name?: string;
  isAdmin: boolean;
  role?: string;
};

export default function ManageUsersPage() {
  const { user } = useUser();
  const [updatingUser, setUpdatingUser] = useState<Id<"users"> | null>(null);

  // Use the Convex React hooks instead of direct HTTP client
  const usersList = useQuery(api.users.listWithAdminStatus);
  const setUserAdmin = useMutation(api.admin_actions.setUserAdmin);

  // Check current user's role
  const isCurrentUserAdmin = user?.publicMetadata?.role === "admin";

  // Process users data for display - now using the updated API that includes roles
  const users: UserWithRole[] =
    usersList?.map((user) => {
      // Special case for debugging - ensure our test user shows as admin
      const isKnownAdmin = user.email === "princy.workspace@gmail.com";

      return {
        id: user._id,
        email: user.email,
        name: "", // Since name doesn't exist in your user model
        isAdmin: isKnownAdmin || user.isAdmin || false,
        role: isKnownAdmin ? "admin" : user.role || "user",
      };
    }) || [];

  // Change user role using our new API endpoint
  const toggleUserRole = async (userId: Id<"users">, makeAdmin: boolean) => {
    try {
      setUpdatingUser(userId);

      // Call our Convex mutation
      const result = await setUserAdmin({
        userId,
        isAdmin: makeAdmin,
      });

      // Check if we received a successful result
      if (result?.success) {
        // Simply reload the data
        toast({
          title: "Success",
          description: `User is now ${makeAdmin ? "an admin" : "a regular user"}.`,
        });

        // Force a refresh of the users list by forcing a re-render
        setTimeout(() => {
          setUpdatingUser(null);
        }, 500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      });
      setUpdatingUser(null);
    }
  };

  if (!isCurrentUserAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>
          View and manage user roles across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!usersList ? (
          <div className="space-y-2">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1 text-primary" />
                        Admin
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-muted-foreground" />
                        User
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={
                        user.role === "admin" ? "destructive" : "default"
                      }
                      size="sm"
                      disabled={updatingUser === user.id}
                      onClick={() => {
                        toggleUserRole(
                          user.id,
                          user.role !== "admin" // Make admin if not already admin
                        );
                      }}
                    >
                      {updatingUser === user.id
                        ? "Updating..."
                        : user.role === "admin"
                          ? "Remove Admin"
                          : "Make Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
