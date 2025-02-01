"use client";

import { Button } from "@/components/ui/button";
import { globalErrorToast, globalSuccessToast } from "@/lib/toast";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const utils = api.useUtils();
  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();

      globalSuccessToast("Logout success");
      router.push(`/sign-in`);
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  return (
    <Button
      variant="destructive"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      Logout
    </Button>
  );
}
