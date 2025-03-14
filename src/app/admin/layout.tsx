import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import { AdminLayoutClient } from "./admin-layout-client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for Dumb Questions application",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminLayoutClient>{children}</AdminLayoutClient>
      <Toaster />
    </>
  );
}
