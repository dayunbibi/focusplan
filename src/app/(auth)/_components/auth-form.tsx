"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { login, signup, type AuthFormState } from "../_lib/actions";

const initialState: AuthFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs font-bold text-now-ink">{errors[0]}</p>;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initialState);
  const timezoneRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timezoneRef.current) {
      timezoneRef.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
    }
  }, []);

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-3" noValidate>
      {mode === "signup" && (
        <label className="text-[12px] font-extrabold text-muted" htmlFor="name">
          이름
          <input id="name" name="name" autoComplete="name" required maxLength={80} className="mt-1 min-h-12 w-full rounded-[14px] border-2 border-border bg-surface px-3.5 text-base text-foreground outline-none focus:border-primary" />
          <FieldError errors={state.errors?.name} />
        </label>
      )}

      <label className="text-[12px] font-extrabold text-muted" htmlFor="email">
        이메일
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} className="mt-1 min-h-12 w-full rounded-[14px] border-2 border-border bg-surface px-3.5 text-base text-foreground outline-none focus:border-primary" />
        <FieldError errors={state.errors?.email} />
      </label>

      <label className="text-[12px] font-extrabold text-muted" htmlFor="password">
        비밀번호
        <input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "signup" ? 10 : 1} maxLength={128} className="mt-1 min-h-12 w-full rounded-[14px] border-2 border-border bg-surface px-3.5 text-base text-foreground outline-none focus:border-primary" />
        {mode === "signup" && !state.errors?.password && <span className="mt-1 block text-[11px] font-semibold text-muted">영문자와 숫자를 포함해 10자 이상</span>}
        <FieldError errors={state.errors?.password} />
      </label>

      {mode === "signup" && (
        <>
          <label className="text-[12px] font-extrabold text-muted" htmlFor="passwordConfirm">
            비밀번호 확인
            <input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" required maxLength={128} className="mt-1 min-h-12 w-full rounded-[14px] border-2 border-border bg-surface px-3.5 text-base text-foreground outline-none focus:border-primary" />
            <FieldError errors={state.errors?.passwordConfirm} />
          </label>
          <input ref={timezoneRef} type="hidden" name="timezone" defaultValue="Asia/Seoul" />
        </>
      )}

      {state.message && <p role="alert" className="rounded-xl bg-now-soft px-3 py-2.5 text-sm font-bold text-now-ink">{state.message}</p>}

      <button type="submit" disabled={pending} className="mt-1 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary px-5 text-sm font-extrabold text-white shadow-[0_3px_8px_rgba(184,63,115,0.2)] disabled:cursor-wait disabled:opacity-60">
        {mode === "login" ? <LogIn size={17} aria-hidden="true" /> : <UserPlus size={17} aria-hidden="true" />}
        {pending ? "처리 중..." : mode === "login" ? "로그인" : "계정 만들기"}
      </button>

      <p className="text-center text-xs font-semibold text-muted">
        {mode === "login" ? "처음이신가요?" : "이미 계정이 있나요?"}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="inline-flex min-h-11 items-center font-extrabold text-primary-strong underline decoration-border decoration-2 underline-offset-4">
          {mode === "login" ? "회원가입" : "로그인"}
        </Link>
      </p>
    </form>
  );
}
