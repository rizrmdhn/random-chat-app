import MessageList from "./message-list";
import MessageForm from "./message-form";
import { api, HydrateClient } from "@/trpc/server";

interface MessageAreaProps {
  channelId: string;
}

export default function MessageArea({ channelId }: MessageAreaProps) {
  void api.messages.getMessages.prefetch({ channelId });
  void api.auth.me.prefetch();

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <HydrateClient>
          <MessageList />
        </HydrateClient>
      </div>
      <div className="sticky bottom-0 border-t bg-accent p-4">
        <MessageForm />
      </div>
    </main>
  );
}
