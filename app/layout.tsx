import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { wedding } from "@/lib/content/wedding";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: wedding.coupleNames, template: `%s · ${wedding.coupleNames}` },
  description: wedding.tagline,
};

export const viewport: Viewport = {
  themeColor: "#FBF7F0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GH" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
