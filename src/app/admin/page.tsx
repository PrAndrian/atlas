"use client";
import UserList from "@/components/user-list";

export default function AdminDashboard() {
  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <UserList />
    </div>
  );
}
