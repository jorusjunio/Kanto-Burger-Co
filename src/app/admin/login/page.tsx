import Image from "next/image";
import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { LoginForm } from "@/features/admin/auth/login-form";
import { isGoogleAuthEnabled } from "@/server/auth/config";
import { getCurrentSession } from "@/server/auth/session";

export default async function AdminLoginPage() {
  const session = await getCurrentSession();

  if (session?.user) {
    // Managers land on the dashboard; kitchen crew go straight to the board.
    redirect(session.user.role === UserRole.ADMIN ? "/admin" : "/kitchen");
  }

  return (
    <main className="flex min-h-screen">
      {/* ── Brand panel (desktop) — same dark surface as the admin sidebar ── */}
      <aside className="relative hidden w-[42%] flex-col justify-between bg-stone-950 p-10 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm">
            <Image
              src="/assets/brand/J logo without bg.png"
              alt=""
              width={18}
              height={18}
              className="object-contain"
              priority
            />
          </span>
          <p className="text-sm font-black uppercase tracking-tight text-white">
            Kanto Admin
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
            Staff workspace
          </p>
          <h2 className="mt-3 max-w-sm text-4xl font-black leading-tight text-white">
            Run the counter.
            <br />
            Watch the numbers.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
            Orders, kitchen board, menu, and sales — everything the crew and
            managers need, in one place.
          </p>
        </div>

        <p className="text-[11px] font-medium text-stone-600">
          © {new Date().getFullYear()} Kanto Burger Co.
        </p>
      </aside>

      {/* ── Form panel ── */}
      <section className="flex flex-1 flex-col bg-[#f7f3ea]">
        {/* Compact brand row (mobile only) */}
        <div className="flex items-center gap-2.5 px-6 pt-8 lg:hidden">
          <span className="flex size-8 items-center justify-center rounded-full bg-stone-950">
            <Image
              src="/assets/brand/J logo without bg.png"
              alt=""
              width={16}
              height={16}
              className="object-contain brightness-0 invert"
              priority
            />
          </span>
          <p className="text-sm font-black uppercase tracking-tight text-[#25130b]">
            Kanto Admin
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <LoginForm googleEnabled={isGoogleAuthEnabled} />
        </div>
      </section>
    </main>
  );
}
