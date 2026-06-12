"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="group"
    >
      <LogOut 
        aria-hidden="true" 
        className="transition-transform duration-300 group-hover:translate-x-0.5" 
      />
      Sign Out
    </Button>
  );
}
