"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { sanitizeAdminCallbackUrl } from "./routing";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.21 7.21 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeAdminCallbackUrl(searchParams.get("callbackUrl"));
  // NextAuth redirects back here with ?error=... when an OAuth sign-in is
  // rejected (e.g. a Google account that isn't a registered staff member).
  const oauthError = searchParams.get("error")
    ? "That Google account isn't authorized for admin access."
    : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(oauthError);
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();

  function handleGoogleSignIn() {
    setError("");
    // OAuth needs the full redirect round-trip; the result is decided after
    // the callback, so let NextAuth drive the navigation.
    startGoogleTransition(() => {
      void signIn("google", { callbackUrl });
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (!result?.ok) {
        setError("Invalid email or password.");
        return;
      }

      window.location.assign(result.url ?? callbackUrl);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl border border-white/20 bg-white/80 backdrop-blur-md p-8 shadow-2xl"
    >
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-red-700">
          Staff access
        </p>
        <h1 className="mt-2 text-3xl font-black text-zinc-950">
          Admin Login
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Sign in to manage orders, payments, inventory, and reports.
        </p>
      </div>

      {error ? (
        <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 animate-fade-in">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            className="rounded-xl transition-all duration-300 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="rounded-xl transition-all duration-300 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className={`h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-black text-base group ${
            googleEnabled ? "flex-1" : "w-full"
          }`}
        >
          {isPending ? "Signing in..." : "Sign In"}
        </Button>

        {googleEnabled ? (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGooglePending}
            aria-label="Continue with Google"
            title="Continue with Google"
            className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-black text-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="transition-transform duration-300 group-hover:scale-110">
              <GoogleGlyph />
            </span>
            <span>{isGooglePending ? "Connecting…" : "Google"}</span>
          </button>
        ) : null}
      </div>
    </form>
  );
}
