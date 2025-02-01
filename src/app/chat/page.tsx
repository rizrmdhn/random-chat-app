import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ChannelSidebar from "@/components/channel-sidebar";
import { api, HydrateClient } from "@/trpc/server";
import MessageArea from "@/components/message-area";
import { getChannelById } from "@/server/queries/channels.queries";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";

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
        <SidebarInset>
          <header className="flex shrink-0 items-center gap-2 border-b p-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </header>
          {channelId ? <MessageArea channelId={channelId} /> : null}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
