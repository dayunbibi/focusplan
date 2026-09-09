import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalCurrentUser } from "@/lib/dal/auth";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage() {
  if (await getOptionalCurrentUser()) redirect("/");
  return <AuthShell title="다시 만나서 반가워요" description="내 계획을 이어서 관리하려면 로그인해 주세요."><AuthForm mode="login" /></AuthShell>;
}
