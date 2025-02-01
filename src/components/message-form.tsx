"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, SendHorizontal } from "lucide-react";
import { api } from "@/trpc/react";
import { globalErrorToast, globalSuccessToast } from "@/lib/toast";
import { useSearchParams } from "next/navigation";

export default function MessageForm() {
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channelId");

  const utils = api.useUtils();
  const [message, setMessage] = useState("");

  const sentMessageMutation = api.messages.create.useMutation({
    onSuccess: async () => {
      await utils.messages.getMessages.invalidate();

      globalSuccessToast("Message sent!");
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
    onSettled: () => {
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !channelId) {
      globalErrorToast("Message or channel is missing");
      return;
    }

    console.log("Channel ID", channelId);
    console.log("Sending message", message);

    sentMessageMutation.mutate({
      channelId,
      content: message,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        className="max-h-[120px] min-h-[60px] flex-1 resize-none"
        disabled={sentMessageMutation.isPending}
      />
      <Button
        disabled={sentMessageMutation.isPending || !message.trim()}
        type="submit"
        size="icon"
        className="h-[60px] w-[60px] flex-shrink-0"
      >
        {sentMessageMutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <SendHorizontal className="h-5 w-5" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
