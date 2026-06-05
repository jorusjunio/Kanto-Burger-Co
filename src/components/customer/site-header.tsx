"use client";

import { usePathname } from "next/navigation";

import { CustomerTopBar } from "@/components/customer/customer-top-bar";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="fixed right-4 top-4 z-40 sm:right-8 lg:right-12">
      <CustomerTopBar />
    </header>
  );
}
