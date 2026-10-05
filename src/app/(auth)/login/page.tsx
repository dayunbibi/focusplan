import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalCurrentUser } from "@/lib/dal/auth";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getOptionalCurrentUser()) redirect("/");
  return <AuthShell title="Welcome back" description="Log in to pick up where you left off."><AuthForm mode="login" /></AuthShell>;
}
