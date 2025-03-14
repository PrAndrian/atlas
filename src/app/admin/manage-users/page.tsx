"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

// Using shadcn components but if they're not available, you may need to install them
// npm install @shadcn/ui
import { Button } from "@/components/ui/button";
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

// Simple toast function if the component is not available
const toast = ({
  title,
  description,
  variant,
}: {
  title: string;
  description: string;
  variant?: string;
}) => {
  // Log with different styles based on variant
  if (variant === "destructive") {
    console.error(`${title}: ${description}`);
  } else {
    console.log(`${title}: ${description}`);
  }
  // You could replace this with a real toast implementation
};

// Create a Convex HTTP client for getting the list of users
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type UserWithRole = {
  id: Id<"users">;
  email: string;
  name?: string;
  isAdmin: boolean;
  role?: string;
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Check current user's role
  const isCurrentUserAdmin = user?.publicMetadata?.role === "admin";

  // Get list of users from Convex
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Call Convex API to get users
      const usersList = await convex.query(api.users.list);

      setUsers(
        usersList.map((user) => {
          // Get the role from Clerk metadata if available
          const role = "user"; // Default
          const isAdmin = false; // Default

          return {
            id: user._id,
            email: user.email,
            name: "", // Since name doesn't exist in your user model
            isAdmin,
            role,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Define the response type from the setUserAdmin mutation
  interface SetUserAdminResponse {
    success: boolean;
    message: string;
    action?: string;
    userId?: string;
    role?: string;
  }

  // Change user role using our new API endpoint
  const toggleUserRole = async (userId: Id<"users">, makeAdmin: boolean) => {
    try {
      // First, call our Convex mutation to get the Clerk userId
      const result: SetUserAdminResponse = await convex.mutation(
        api.admin_actions.setUserAdmin,
        {
          userId,
          isAdmin: makeAdmin,
        }
      );

      // Check if we received the expected action for role update
      if (result?.action === "update_clerk_role" && result.userId) {
        // Now call our API endpoint with the Clerk userId
        const response = await fetch("/api/admin/set-user-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: result.userId, // This is the Clerk user ID
            role: result.role,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update user role");
        }

        // Update local state
        setUsers(
          users.map((user) =>
            // Compare as strings to handle different types
            user.id.toString() === userId.toString()
              ? {
                  ...user,
                  isAdmin: makeAdmin,
                  role: makeAdmin ? "admin" : "user",
                }
              : user
          )
        );

        toast({
          title: "Success",
          description: `User is now ${makeAdmin ? "an admin" : "a regular user"}.`,
        });
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
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <p>Loading users...</p>
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
                      onClick={() => {
                        // Convert string ID to Convex ID if needed
                        const convexId =
                          typeof user.id === "string"
                            ? (user.id as unknown as Id<"users">)
                            : user.id;
                        toggleUserRole(convexId, user.role !== "admin");
                      }}
                    >
                      {user.role === "admin" ? "Remove Admin" : "Make Admin"}
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
