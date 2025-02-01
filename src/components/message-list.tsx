"use client";

import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function MessageList() {
  const utils = api.useUtils();
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channelId");

  const [messages] = api.messages.getMessages.useSuspenseQuery({
    channelId: channelId ?? "",
  });

  const [me] = api.auth.me.useSuspenseQuery();

  api.events.subscribe.useSubscription(
    {
      types: ["message.sent"],
    },
    {
      onData: () => {
        void utils.messages.getMessages.invalidate({
          channelId: channelId ?? "",
        });
      },
    },
  );

  return (
    <div className="flex min-h-[400px] flex-col space-y-2 p-4">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.userId === me.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-2 ${
                message.userId === me.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-accent text-accent-foreground"
              } shadow-sm`}
            >
              {message.userId !== me.id && (
                <p className="mb-1 text-sm font-semibold text-primary">
                  {message.user.username}
                </p>
              )}
              {message.userId === me.id && (
                <p className="mb-1 text-sm font-semibold text-primary">You</p>
              )}
              <p className="text-sm">{message.message}</p>
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {format(new Date(message.createdAt), "HH:mm", { locale: id })}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
