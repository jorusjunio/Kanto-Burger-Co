"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";
import { AlertCircle, LogIn } from "lucide-react";

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
      className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
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
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-6 h-10 w-full bg-zinc-950 text-white hover:bg-zinc-800"
      >
        <LogIn aria-hidden="true" />
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
