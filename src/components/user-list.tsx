"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export default function UserList() {
  const users = useQuery(api.users.list) || [];
  const setUserAdmin = useMutation(api.admin_actions.setUserAdmin);
  const deleteUser = useMutation(api.admin_actions.deleteUser);

  // Helper function to check if a user has admin role
  const hasAdminRole = (
    user: Doc<"users"> & {
      privateMetadata?: {
        role?: string;
        [key: string]: unknown;
      };
    }
  ) => {
    // Check Clerk metadata for admin role
    return user.privateMetadata?.role === "admin";
  };

  const handleToggleAdmin = async (
    userId: Id<"users">,
    isCurrentlyAdmin: boolean
  ) => {
    // Get the Clerk user ID and role information
    const result = await setUserAdmin({
      userId,
      isAdmin: !isCurrentlyAdmin,
    });

    // If we got the expected action, call our API endpoint
    if (result.action === "update_clerk_role" && result.userId) {
      const response = await fetch("/api/admin/set-user-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: result.userId,
          role: result.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(
          `Error updating user role: ${errorData.error || "Unknown error"}`
        );
      }
    }
  };

  const handleDeleteUser = async (userId: Id<"users">) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser({ userId });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
              Admin Status
            </th>
            <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => {
            const isAdmin = hasAdminRole(user);

            return (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isAdmin ? "Admin" : "User"}
                </td>
                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleAdmin(user._id, isAdmin)}
                    className="px-3 py-1 text-white bg-blue-500 rounded"
                  >
                    Toggle Admin
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="px-3 py-1 text-white bg-red-500 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
