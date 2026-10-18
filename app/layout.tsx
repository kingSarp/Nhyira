import type { Metadata, Viewport } from "next";
import { AuthLinkHandler } from "@/components/organiser/AuthLinkHandler";
import { fontVariables } from "@/lib/fonts";
import { wedding } from "@/lib/content/wedding";
import { getWedding } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { coupleNames } = await getWedding();
  return {
    // Absolute URLs for the WhatsApp preview image.
    metadataBase: new URL(siteUrl()),
    title: { default: coupleNames, template: `%s · ${coupleNames}` },
    description: wedding.tagline,
  };
}

export const viewport: Viewport = {
  themeColor: "#FBF7F0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GH" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh">
        {children}
        <AuthLinkHandler />
      </body>
    </html>
  );
}
