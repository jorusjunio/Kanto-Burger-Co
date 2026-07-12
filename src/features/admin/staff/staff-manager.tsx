"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  ChefHat,
  Shield,
  Trash2,
  UserPlus,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  addStaffMember,
  removeStaffMember,
  setStaffRole,
  type StaffActionState,
} from "./actions";

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

const fieldClassName =
  "h-10 rounded-lg border-0 bg-white px-3.5 text-sm shadow-none ring-1 ring-orange-900/10 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-red-500/30";

function initials(name: string, email: string) {
  return (name || email || "?").charAt(0).toUpperCase();
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 rounded-full bg-red-600 px-5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
    >
      <UserPlus className="size-4" aria-hidden="true" />
      {pending ? "Adding…" : "Add member"}
    </Button>
  );
}

function AddStaffForm() {
  const initialState: StaffActionState = { ok: false, message: "" };
  const [state, formAction] = useActionState(addStaffMember, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the inputs after a successful add so the next one starts fresh.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl bg-white p-5 ring-1 ring-orange-900/10"
    >
      <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
        Add a team member
      </h2>
      <p className="mt-1 text-xs text-orange-950/45">
        Enter their Google account email — they sign in with Google, no password
        needed.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-orange-950/55">
            Google email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="crew@gmail.com"
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-bold text-orange-950/55">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Juan Dela Cruz"
            className={fieldClassName}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Role radio pills — most new accounts are crew, so STAFF leads. */}
          <div className="flex h-10 items-center rounded-full bg-orange-950/[0.05] p-1">
            {[
              ["STAFF", "Crew"],
              ["ADMIN", "Manager"],
            ].map(([value, label], index) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={value}
                  defaultChecked={index === 0}
                  className="peer sr-only"
                />
                <span className="flex items-center rounded-full px-3 py-1.5 text-xs font-bold text-orange-950/50 transition-colors peer-checked:bg-white peer-checked:text-[#25130b] peer-checked:shadow-sm">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {state.message ? (
          <p
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-bold",
              state.ok ? "text-emerald-700" : "text-red-700",
            )}
          >
            {state.ok ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : (
              <XCircle className="size-4" aria-hidden="true" />
            )}
            {state.message}
          </p>
        ) : (
          <span />
        )}
        <AddButton />
      </div>
    </form>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        isAdmin
          ? "bg-red-700/8 text-red-700"
          : "bg-amber-600/10 text-amber-700",
      )}
    >
      {isAdmin ? (
        <Shield className="size-3" aria-hidden="true" />
      ) : (
        <ChefHat className="size-3" aria-hidden="true" />
      )}
      {isAdmin ? "Manager" : "Crew"}
    </span>
  );
}

function RemoveDialog({ member }: { member: StaffRow }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Remove ${member.name}`}
          className="flex size-8 items-center justify-center rounded-full text-orange-950/40 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-xs rounded-2xl border-0 p-6 shadow-2xl ring-1 ring-orange-900/10"
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base font-black text-[#25130b]">
            Remove {member.name}?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-orange-950/45">
            They&apos;ll immediately lose access. You can re-add them anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-full text-sm font-bold text-orange-950/55 hover:bg-orange-950/5 hover:text-[#25130b]"
            >
              Cancel
            </Button>
          </DialogClose>
          <form action={removeStaffMember} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="userId" value={member.id} />
            <Button
              type="submit"
              className="h-10 w-full rounded-full bg-red-600 text-sm font-bold text-white hover:bg-red-700"
            >
              Remove
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StaffManager({
  members,
  currentUserId,
}: {
  members: StaffRow[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-5">
      <AddStaffForm />

      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-orange-900/10">
        <div className="flex items-center justify-between border-b border-orange-900/8 px-5 py-3.5">
          <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
            Team
          </h2>
          <span className="text-xs font-bold text-orange-950/40 tabular-nums">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>

        <ul className="divide-y divide-orange-900/6">
          {members.map((member) => {
            const isSelf = member.id === currentUserId;
            return (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-950/[0.06] text-sm font-black text-orange-950/60">
                  {initials(member.name, member.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-[#25130b]">
                      {member.name}
                    </p>
                    {isSelf ? (
                      <span className="rounded-full bg-orange-950/[0.06] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-950/45">
                        You
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-orange-950/45">
                    {member.email}
                  </p>
                </div>

                {isSelf ? (
                  /* No self-service on your own account — avoids lockout. */
                  <RoleBadge role={member.role} />
                ) : (
                  <div className="flex items-center gap-2">
                    <form action={setStaffRole}>
                      <input type="hidden" name="userId" value={member.id} />
                      <input
                        type="hidden"
                        name="role"
                        value={member.role === "ADMIN" ? "STAFF" : "ADMIN"}
                      />
                      {/* Clicking the badge flips the role. */}
                      <button
                        type="submit"
                        title={
                          member.role === "ADMIN"
                            ? "Make crew"
                            : "Make manager"
                        }
                        className="transition-transform hover:scale-105 active:scale-95"
                      >
                        <RoleBadge role={member.role} />
                      </button>
                    </form>
                    <RemoveDialog member={member} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
