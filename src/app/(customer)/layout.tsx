import { SiteHeader } from "@/components/customer/site-header";
import { ActiveOrderWidget } from "@/components/customer/active-order-widget";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
      <ActiveOrderWidget />
    </>
  );
}
