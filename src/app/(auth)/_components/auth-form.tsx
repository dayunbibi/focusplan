"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { LogIn, Sparkles, UserPlus } from "lucide-react";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";
import { login, loginDemo, signup, type AuthFormState } from "../_lib/actions";

const initialState: AuthFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs font-bold text-now-ink">{errors[0]}</p>;
}

function DemoLogin() {
  const [state, formAction, pending] = useActionState(loginDemo, initialState);

  return (
    <form action={formAction} className="mt-4 border-t-2 border-dashed border-border pt-4">
      <button type="submit" disabled={pending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-primary bg-surface px-5 text-sm font-extrabold text-primary-strong disabled:cursor-wait disabled:opacity-60">
        <Sparkles size={17} aria-hidden="true" />
        {pending ? "Signing in..." : "Try demo account"}
      </button>
      <p className="mt-2 text-center text-[11px] font-semibold leading-5 text-muted">
        Explore with sample data, no sign-up needed
        <br />
        {DEMO_EMAIL} / {DEMO_PASSWORD}
      </p>
      {state.message && <p role="alert" className="mt-2 rounded-xl bg-now-soft px-3 py-2.5 text-sm font-bold text-now-ink">{state.message}</p>}
    </form>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);
  const timezoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timezoneRef.current) {
      timezoneRef.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Toronto";
    }
  }, []);

  return (
    <>
      <form action={formAction} className="mt-5 flex flex-col gap-3" noValidate>
        {mode === "signup" && (
          <label className="text-[12px] font-extrabold text-muted" htmlFor="name">
            Name
            <input id="name" name="name" autoComplete="name" required maxLength={80} className="mt-1 min-h-12 w-full rounded-[14px] border-2 border-border bg-surface px-3.5 text-base text-foreground outline-none focus:border-primary" />
            <FieldError errors={state.errors?.name} />
          </label>
        )}

        <label className="text-[12px] font-extrabold text-muted" htmlFor="email">
          Email
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} className="mt-1 min-h-12 w-full rounded-[14px] border-2 border-border bg-surface px-3.5 text-base text-foreground outline-none focus:border-primary" />
          <FieldError errors={state.errors?.email} />
        </label>

        <label className="text-[12px] font-extrabold text-muted" htmlFor="password">
          Password
          <input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 10 : 1} maxLength={128} className="mt-1 min-h-12 w-full rounded-[14px] border-2 border-border bg-surface px-3.5 text-base text-foreground outline-none focus:border-primary" />
          {mode === "signup" && !state.errors?.password && <span className="mt-1 block text-[11px] font-semibold text-muted">At least 10 characters with a letter and a number</span>}
          <FieldError errors={state.errors?.password} />
        </label>

        {mode === "signup" && (
          <>
            <label className="text-[12px] font-extrabold text-muted" htmlFor="passwordConfirm">
              Confirm password
              <input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required maxLength={128} className="mt-1 min-h-12 w-full rounded-[14px] border-2 border-border bg-surface px-3.5 text-base text-foreground outline-none focus:border-primary" />
              <FieldError errors={state.errors?.passwordConfirm} />
            </label>
            <input ref={timezoneRef} type="hidden" name="timezone" defaultValue="America/Toronto" />
          </>
        )}

        {state.message && <p role="alert" className="rounded-xl bg-now-soft px-3 py-2.5 text-sm font-bold text-now-ink">{state.message}</p>}

        <button type="submit" disabled={pending} className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary px-5 text-sm font-extrabold text-white shadow-[0_3px_8px_rgba(184,63,115,0.2)] disabled:cursor-wait disabled:opacity-60">
          {mode === "login" ? <LogIn size={17} aria-hidden="true" /> : <UserPlus size={17} aria-hidden="true" />}
          {pending ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>

        <p className="text-center text-xs font-semibold text-muted">
          {mode === "login" ? "New to FocusPlan?" : "Already have an account?"}{" "}
          <Link href={mode === "login" ? "/signup" : "/login"} className="inline-flex min-h-11 items-center font-extrabold text-primary-strong underline decoration-border decoration-2 underline-offset-4">
            {mode === "login" ? "Sign up" : "Log in"}
          </Link>
        </p>
      </form>
      {mode === "login" && <DemoLogin />}
    </>
  );
}
