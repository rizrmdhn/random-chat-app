"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/schema/auth.schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { globalErrorToast, globalSuccessToast } from "@/lib/toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [type, setType] = useState<"text" | "password">("password");

  const router = useRouter();

  const { mutate, status } = api.auth.register.useMutation({
    onSuccess: () => {
      globalSuccessToast("Register success");

      router.push(`/sign-in`);
    },
    onError: (error) => {
      globalErrorToast(error.message);
    },
  });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function handleSubmit(data: z.infer<typeof registerSchema>) {
    mutate(data);
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          Enter your details to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="ml-1 font-bold">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="ml-1 font-bold">Password</FormLabel>
                  <FormControl className="relative">
                    <div>
                      <Input
                        placeholder="Enter your password"
                        type={type}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant={"ghost"}
                        className="absolute right-2 top-0 p-0 hover:bg-transparent"
                        onClick={() => {
                          setType((prev) =>
                            prev === "password" ? "text" : "password",
                          );
                        }}
                      >
                        {type === "password" ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={status === "pending"}
            >
              {status === "pending" ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign Up
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="hover:underline">
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
