import { Hash } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { NewChannelDialog } from "./new-channel-dialog"

const channels = [
  { id: 1, name: "general" },
  { id: 2, name: "random" },
  { id: 3, name: "support" },
]

export default function ChannelSidebar() {
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
              {channels.map((channel) => (
                <SidebarMenuItem key={channel.id}>
                  <SidebarMenuButton asChild>
                    <button className="w-full text-left">
                      <Hash className="mr-2 h-4 w-4 inline" />
                      {channel.name}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

