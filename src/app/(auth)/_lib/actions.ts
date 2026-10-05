"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteCurrentSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { DEMO_EMAIL } from "@/lib/demo";

export type AuthFormState = {
  message?: string;
  errors?: Partial<Record<"name" | "email" | "password" | "passwordConfirm", string[]>>;
};

const email = z.string().trim().toLowerCase().email("Please enter a valid email address.").max(254);
const password = z
  .string()
  .min(10, "Password must be at least 10 characters.")
  .max(128, "Password must be 128 characters or fewer.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name.").max(80, "Name must be 80 characters or fewer."),
    email,
    password,
    passwordConfirm: z.string(),
    timezone: z.string().trim().max(100),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords don't match.",
  });

const loginSchema = z.object({ email, password: z.string().min(1, "Please enter your password.").max(128) });

function validTimezone(value: string) {
  try {
    Intl.DateTimeFormat("en-CA", { timeZone: value }).format();
    return value;
  } catch {
    return "America/Toronto";
  }
}

export async function signup(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    timezone: formData.get("timezone") || "America/Toronto",
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (existing) return { message: "This email is already registered. Please log in." };

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
      return { message: "This email is already registered. Please log in." };
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
  if (!user || !authenticated) return { message: "Incorrect email or password." };

  await createSession(user.id);
  redirect("/");
}

// One-click sign-in for the public demo account created by prisma/seed.ts
export async function loginDemo(): Promise<AuthFormState> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL }, select: { id: true } });
  if (!user) return { message: "The demo account isn't set up yet. Run npm run db:seed first." };

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteCurrentSession();
  redirect("/login");
}
