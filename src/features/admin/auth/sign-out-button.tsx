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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SignOutButton() {
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="group w-full justify-center border-white/15 bg-white/5 text-stone-200 transition-all duration-300 ease-out hover:border-red-500/40 hover:bg-red-500/10 hover:text-white"
        >
          <LogOut
            aria-hidden="true"
            className="admin-icon-pop transition-transform duration-300 group-hover:translate-x-0.5"
          />
          Sign Out
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm overflow-hidden rounded-2xl border border-orange-900/10 p-0 shadow-2xl">
        {/* Signing-out wash — a slow warm sheen drifts across the modal */}
        {isPending ? (
          <span
            aria-hidden="true"
            className="animate-gradient-xy pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-red-500/12 via-amber-400/5 to-red-500/12"
            style={{ animationDuration: "3s" }}
          />
        ) : null}

        <DialogHeader className="space-y-4 border-b border-orange-900/8 bg-gradient-to-br from-red-50/60 to-white px-6 py-6 text-left">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-2xl bg-red-600 text-white transition-shadow duration-300",
              isPending && "animate-pulse shadow-red-600/50",
            )}
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-5" aria-hidden="true" />
            )}
          </div>
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#25130b]">
            Sign out?
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-orange-950/55">
            You&apos;ll need to log in again to get back into the admin
            workspace. Make sure you&apos;re done before leaving.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="relative z-20 gap-3 px-6 pb-7 pt-6 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="h-12 flex-1 rounded-xl border-2 border-orange-900/10 font-black text-[#25130b] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-orange-900/20 hover:bg-orange-50 hover:shadow-md active:translate-y-0 active:scale-[0.97] disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              "group h-12 flex-1 rounded-xl font-black text-white transition-all duration-300 ease-out active:translate-y-0 active:scale-[0.97]",
              isPending
                ? "bg-red-600/80"
                : "bg-red-600 hover:bg-red-700",
            )}
            style={isPending ? { animationDuration: "1.6s" } : undefined}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Signing out…
              </>
            ) : (
              <>
                <LogOut
                  className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                Sign Out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
