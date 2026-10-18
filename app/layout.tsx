import type { Metadata, Viewport } from "next";
import { AuthLinkHandler } from "@/components/organiser/AuthLinkHandler";
import { fontVariables } from "@/lib/fonts";
import { wedding } from "@/lib/content/wedding";
import { getWedding } from "@/lib/data";
import { previewImages } from "@/lib/og";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const w = await getWedding();
  const card = previewImages(w);
  return {
    // Absolute URLs for the WhatsApp preview image.
    metadataBase: new URL(siteUrl()),
    title: { default: w.coupleNames, template: `%s · ${w.coupleNames}` },
    description: wedding.tagline,
    openGraph: { type: "website", title: w.coupleNames, description: wedding.tagline, images: card.og },
    twitter: { card: "summary_large_image", title: w.coupleNames, description: wedding.tagline, images: card.twitter },
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
