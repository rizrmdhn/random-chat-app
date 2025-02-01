"use client";

import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";

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
    <div className="flex min-h-[400px] flex-col space-y-4 p-4">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.userId === me.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {!message.userId && (
                <p className="mb-1 text-sm font-semibold">
                  {message.user.username}
                </p>
              )}
              <p>{message.message}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
