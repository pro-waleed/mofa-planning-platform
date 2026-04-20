import type { Metadata } from "next";
import { Cairo } from "next/font/google";

import { siteConfig } from "@/config/site";
import "@/app/globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`
  },
  description: siteConfig.description
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

