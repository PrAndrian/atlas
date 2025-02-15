"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Home, MessageCircleQuestion, Settings, Shield } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "./ui/skeleton";

const items = [
  {
    title: "Landing Page",
    url: "/",
    icon: Home,
  },
  {
    title: "Ask Dumb Question",
    url: "/dashboard/ask",
    icon: MessageCircleQuestion,
  },
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: Shield,
    adminOnly: true,
  },
];

const footerItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const auth = useAuth();
  const isAdmin = useQuery(api.users.isAdmin);

  if (!auth) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-fit">
            <SidebarMenuButton asChild>
              <button className="px-1 py-2 overflow-visible">
                {auth.isLoaded ? (
                  <UserButton
                    showName
                    appearance={{
                      elements: {
                        userButtonBox: {
                          flexDirection: "row-reverse",
                        },
                        userButtonTrigger__open: {
                          border: "none",
                        },
                      },
                    }}
                  />
                ) : (
                  <Skeleton className="w-8 h-8 my-2 rounded-full" />
                )}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>Dashbord</SidebarGroupLabel>
            <SidebarMenu>
              {items
                .filter((item) => !item.adminOnly || isAdmin)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  {item.title}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
