"use client";

import { Hash } from "lucide-react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NewChannelDialog } from "./new-channel-dialog";
import { ModeToggle } from "./mode-toggle";
import { api } from "@/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import LogoutButton from "./logout-button";

export default function ChannelSidebar() {
  const utils = api.useUtils();
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channelId");

  const [channels] = api.channels.getChannels.useSuspenseQuery();

  api.events.subscribe.useSubscription(
    {
      types: ["channel.created"],
    },
    {
      onData: () => {
        void utils.channels.getChannels.invalidate();
      },
    },
  );

  return (
    <Sidebar className="w-64 flex-shrink-0 border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Channels</h2>
        <SidebarTrigger className="absolute right-2 top-2 md:hidden" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel>Text Channels</SidebarGroupLabel>
            <NewChannelDialog />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {channels.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No channels available. Create one to get started.
                </div>
              ) : (
                channels.map((channel) => (
                  <SidebarMenuItem key={channel.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        if (channelId !== channel.id) {
                          router.push(`?channelId=${channel.id}`);
                        } else {
                          router.push("chat");
                        }
                      }}
                    >
                      <Hash className="mr-2 inline h-4 w-4" />
                      {channel.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
