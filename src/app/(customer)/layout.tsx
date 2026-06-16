import { SiteHeader } from "@/components/customer/site-header";

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
    </>
  );
}
