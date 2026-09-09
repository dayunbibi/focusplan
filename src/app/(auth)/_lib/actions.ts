"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteCurrentSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export type AuthFormState = {
  message?: string;
  errors?: Partial<Record<"name" | "email" | "password" | "passwordConfirm", string[]>>;
};

const email = z.string().trim().toLowerCase().email("올바른 이메일 주소를 입력하세요.").max(254);
const password = z
  .string()
  .min(10, "비밀번호는 10자 이상이어야 해요.")
  .max(128, "비밀번호는 128자 이하여야 해요.")
  .regex(/[A-Za-z]/, "영문자를 1개 이상 포함하세요.")
  .regex(/[0-9]/, "숫자를 1개 이상 포함하세요.");

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "이름을 입력하세요.").max(80, "이름은 80자 이하여야 해요."),
    email,
    password,
    passwordConfirm: z.string(),
    timezone: z.string().trim().max(100),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않아요.",
  });

const loginSchema = z.object({ email, password: z.string().min(1, "비밀번호를 입력하세요.").max(128) });

function validTimezone(value: string) {
  try {
    Intl.DateTimeFormat("ko-KR", { timeZone: value }).format();
    return value;
  } catch {
    return "Asia/Seoul";
  }
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    timezone: formData.get("timezone") || "Asia/Seoul",
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (existing) return { message: "이미 가입된 이메일이에요. 로그인해 주세요." };

  const passwordHash = await hashPassword(parsed.data.password);
  let user: { id: string };
  try {
    user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        timezone: validTimezone(parsed.data.timezone),
      },
      select: { id: true },
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return { message: "이미 가입된 이메일이에요. 로그인해 주세요." };
    }
    throw error;
  }

  await createSession(user.id);
  redirect("/");
}

export async function login(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, passwordHash: true },
  });
  const authenticated = user?.passwordHash
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;
  if (!user || !authenticated) return { message: "이메일 또는 비밀번호가 올바르지 않아요." };

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteCurrentSession();
  redirect("/login");
}
