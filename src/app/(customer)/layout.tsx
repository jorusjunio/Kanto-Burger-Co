import { PageLoader } from "@/components/customer/page-loader";
import { SiteHeader } from "@/components/customer/site-header";
import { SmoothScroll } from "@/components/customer/smooth-scroll";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Storefront-only UX. Kept out of the root layout so Lenis smooth-scroll
          and the page loader never run on (and break scrolling in) the admin
          dashboard. */}
      <SmoothScroll />
      <PageLoader />
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
    </>
  );
}
