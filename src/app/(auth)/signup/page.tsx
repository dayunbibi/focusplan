import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalCurrentUser } from "@/lib/dal/auth";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getOptionalCurrentUser()) redirect("/");
  return <AuthShell title="Start your own plan" description="Create an account to keep your tasks and timetable safely in one place."><AuthForm mode="signup" /></AuthShell>;
}
