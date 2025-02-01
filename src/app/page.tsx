import { SidebarProvider } from "@/components/ui/sidebar";
import ChannelSidebar from "@/components/channel-sidebar";
import { api, HydrateClient } from "@/trpc/server";
import MessageArea from "@/components/message-area";
import { getChannelById } from "@/server/queries/channels.queries";
import { redirect } from "next/navigation";

interface ChatPage {
  searchParams: Promise<{
    channelId: string | undefined;
  }>;
}

export default async function ChatPage({ searchParams }: ChatPage) {
  const { channelId } = await searchParams;

  void api.channels.getChannels.prefetch();

  if (channelId) {
    const channel = await getChannelById(channelId);

    if (!channel) {
      redirect("/");
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <HydrateClient>
          <ChannelSidebar />
        </HydrateClient>
        {channelId ? <MessageArea /> : null}
      </div>
    </SidebarProvider>
  );
}
