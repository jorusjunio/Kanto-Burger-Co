import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { PageLoader } from "@/components/customer/page-loader";
import { SiteHeader } from "@/components/customer/site-header";
import { SmoothScroll } from "@/components/customer/smooth-scroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanto Burger Co.",
  description: "Food ordering website for Kanto Burger Co.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="relative flex min-h-screen flex-col">
        <SmoothScroll />
        <PageLoader />
        <SiteHeader />
        <main className="flex-1">
          {children}
        </main>
        <Toaster
          position="top-right"
          gap={8}
          offset={80}
          toastOptions={{
            className: "kanto-toast",
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
