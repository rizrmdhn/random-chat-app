"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { globalErrorToast, globalSuccessToast } from "@/lib/toast";

export function NewChannelDialog() {
  const utils = api.useUtils();
  const [channelName, setChannelName] = useState("");

  const createChannelMutation = api.channels.create.useMutation({
    onSuccess: async () => {
      await utils.channels.getChannels.invalidate();

      globalSuccessToast("Channel created successfully");
      setChannelName("");
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createChannelMutation.mutate({ name: channelName });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <span className="sr-only">New Channel</span>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
          <DialogDescription>
            Enter a name for your new channel. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel-name" className="text-right">
                Name
              </Label>
              <Input
                disabled={createChannelMutation.isPending}
                id="channel-name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={createChannelMutation.isPending || !channelName}
            >
              {createChannelMutation.isPending && (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              )}
              Create Channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
