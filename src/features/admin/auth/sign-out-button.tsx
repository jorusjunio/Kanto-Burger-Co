"use client";

import { signOut } from "next-auth/react";
import { useState, useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Default trigger styling is tuned for the dark admin sidebar. Contexts on a
// light background (e.g. the kitchen top bar) pass their own `className`.
const defaultTriggerClassName =
  "w-full justify-center border-white/15 bg-white/5 text-stone-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-white";

export function SignOutButton({
  className,
  iconOnly = false,
}: {
  className?: string;
  /** Compact round icon trigger — used in the sidebar account row. */
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await signOut({ callbackUrl: "/admin/login" });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {iconOnly ? (
          <button
            type="button"
            aria-label="Sign out"
            title="Sign out"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "group transition-all duration-300 ease-out",
              className ?? defaultTriggerClassName,
            )}
          >
            <LogOut aria-hidden="true" />
            Sign Out
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="max-w-xs rounded-2xl border-0 p-6 shadow-2xl ring-1 ring-orange-900/10"
      >
        <DialogHeader className="items-center space-y-2 text-center sm:text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-red-600/8 text-red-600">
            {isPending ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-5" aria-hidden="true" />
            )}
          </span>
          <DialogTitle className="text-base font-black text-[#25130b]">
            Sign out?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-orange-950/45">
            You&apos;ll need to log in again to get back in.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="h-10 rounded-full text-sm font-bold text-orange-950/55 transition-colors hover:bg-orange-950/5 hover:text-[#25130b] disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="h-10 rounded-full bg-red-600 text-sm font-bold text-white transition-colors duration-200 hover:bg-red-700 active:scale-[0.99] disabled:opacity-70"
          >
            {isPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
