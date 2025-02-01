import getCurrentSession from "@/server/auth/sessions";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const { user } = await getCurrentSession();

  if (!user) redirect("/sign-in");

  redirect("/chat");
}
