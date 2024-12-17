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
import { Home, MessageCircleQuestion, Settings } from "lucide-react";
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
];

const footerItems = [
  {
    title: "Settings",
    url: "#settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const auth = useAuth();

  if (!auth) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-fit">
            <SidebarMenuButton asChild>
              <button className="py-2 px-1 overflow-visible">
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
                  <Skeleton className="h-8 w-8 my-2 rounded-full" />
                )}
                {/* <span className="text-sm truncate">
                  {auth.isLoaded ? (
                    auth.userId
                  ) : (
                    <Skeleton className="h-4 w-32" />
                  )}
                </span> */}
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
              {items.map((item) => (
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
