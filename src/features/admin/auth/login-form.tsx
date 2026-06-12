"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { sanitizeAdminCallbackUrl } from "./routing";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeAdminCallbackUrl(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

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
        <div className="mt-5 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
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
            className="transition-all duration-300 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10"
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
            className="transition-all duration-300 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-6 h-12 w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-black text-base group"
      >
        {isPending ? "Signing in..." : (
          <>
            Sign In
            <ArrowRight aria-hidden="true" className="ml-2 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  );
}
