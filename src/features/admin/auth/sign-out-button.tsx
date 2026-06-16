"use client";

import { signOut } from "next-auth/react";
import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";

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
          className="group w-full justify-center border-white/15 bg-white/5 text-zinc-200 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-white"
        >
          <LogOut
            aria-hidden="true"
            className="admin-icon-pop transition-transform duration-300 group-hover:translate-x-0.5"
          />
          Sign Out
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm overflow-hidden rounded-2xl border border-orange-900/10 p-0 shadow-2xl">
        <DialogHeader className="space-y-3 border-b border-orange-900/8 bg-gradient-to-br from-red-50/60 to-white px-6 py-5 text-left">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30">
            <LogOut className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#25130b]">
            Sign out?
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-orange-950/55">
            You&apos;ll need to log in again to get back into the admin
            workspace. Make sure you&apos;re done before leaving.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 px-6 py-5 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="h-11 flex-1 rounded-xl border-2 border-orange-900/10 font-black text-[#25130b] transition-all duration-300 hover:bg-orange-50 active:scale-[0.97]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="h-11 flex-1 rounded-xl bg-gradient-to-br from-red-600 to-red-700 font-black text-white shadow-lg shadow-red-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {isPending ? "Signing out…" : "Sign Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
