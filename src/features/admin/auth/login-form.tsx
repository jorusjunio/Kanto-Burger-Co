"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { sanitizeAdminCallbackUrl } from "./routing";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
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

const inputClassName =
  "h-11 rounded-xl border-0 bg-white ring-1 ring-orange-900/10 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-red-500/40";

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(oauthError);
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  // Stay in the loading state after a successful sign-in until the browser
  // actually navigates — otherwise the button flickers back to "Sign In".
  const [isRedirecting, setIsRedirecting] = useState(false);

  const busy = isPending || isGoogleLoading || isRedirecting;

  function handleGoogleSignIn() {
    setError("");
    // OAuth does a full-page redirect to Google, so keep the button in its
    // loading state until the browser navigates away — a transition would end
    // the moment this handler returns and make the spinner flicker.
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl }).catch(() => {
      setError("Could not start Google sign-in. Please try again.");
      setIsGoogleLoading(false);
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

      setIsRedirecting(true);
      window.location.assign(result.url ?? callbackUrl);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      {/* Heading */}
      <p className="text-xs font-black uppercase tracking-wide text-red-700">
        Staff access
      </p>
      <h1 className="mt-1 text-3xl font-black text-[#25130b]">Sign in</h1>
      <p className="mt-1.5 text-sm text-orange-950/45">
        Use your staff account to open the workspace.
      </p>

      {error ? (
        <div className="mt-6 flex gap-2.5 rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-800 ring-1 ring-red-200 animate-fade-in">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      {/* Fields */}
      <div className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wide text-orange-950/50"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            required
            placeholder="you@kantoburger.co"
            className={inputClassName}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-wide text-orange-950/50"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className={`${inputClassName} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-orange-950/35 transition-colors duration-200 hover:bg-orange-950/5 hover:text-[#25130b]"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <Button
        type="submit"
        disabled={busy}
        className="mt-6 h-11 w-full rounded-full bg-red-600 text-sm font-bold text-white transition-colors duration-200 hover:bg-red-700 active:scale-[0.99]"
      >
        {isRedirecting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Opening workspace…
          </>
        ) : isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      {googleEnabled ? (
        <>
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-orange-900/10" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-950/35">
              or
            </span>
            <span className="h-px flex-1 bg-orange-900/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
            aria-busy={isGoogleLoading}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-white text-sm font-bold text-[#25130b] ring-1 ring-orange-900/10 transition-all duration-200 hover:ring-orange-900/25 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <Loader2
                className="size-4 animate-spin text-red-600"
                aria-hidden="true"
              />
            ) : (
              <GoogleGlyph />
            )}
            {isGoogleLoading ? "Connecting…" : "Continue with Google"}
          </button>
        </>
      ) : null}
    </form>
  );
}
