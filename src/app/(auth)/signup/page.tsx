import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalCurrentUser } from "@/lib/dal/auth";
import { AuthForm } from "../_components/auth-form";
import { AuthShell } from "../_components/auth-shell";

export const metadata: Metadata = { title: "회원가입" };

export default async function SignupPage() {
  if (await getOptionalCurrentUser()) redirect("/");
  return <AuthShell title="나만의 계획을 시작해요" description="계정을 만들면 할 일과 시간표가 안전하게 내 계정에 저장돼요."><AuthForm mode="signup" /></AuthShell>;
}
