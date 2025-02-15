"use client";
import UserList from "@/components/user-list";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const isAdmin = useQuery(api.users.isAdmin);

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin, router]);

  if (isAdmin === undefined) return <div>Loading...</div>;
  if (isAdmin === false) return null;

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <UserList />
    </div>
  );
}
