import { SidebarProvider } from "@/components/ui/sidebar";
import ChannelSidebar from "@/components/channel-sidebar";
import MessageArea from "@/components/message-area";

export default function ChatLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChannelSidebar />
        <MessageArea />
      </div>
    </SidebarProvider>
  );
}
