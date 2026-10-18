/* eslint-disable @next/next/no-img-element -- the card renderer (Satori) needs plain <img> */
import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { wedding } from "@/lib/content/wedding";
import { getWedding } from "@/lib/data";
import { dotDate } from "@/lib/format";

// The WhatsApp / link preview card (design boards "6 · WhatsApp preview").
// The image renderer can't read CSS variables, so the guest-surface values
// from docs/design/tokens.json are repeated here on purpose.
const C = {
  paper: "#FBF7F0",
  ink: "#2B2321",
  ink2: "#5A4E48",
  accent: "#6E1423",
  gold: "#D4AF37",
};

export const ogSize = { width: 1200, height: 630 };

const root = process.cwd();
const asset = (p: string) => readFile(join(/* turbopackIgnore: true */ root, p)); // files listed in next.config outputFileTracingIncludes

// Read once per server process.
const loaded = Promise.all([
  asset("assets/og/cormorant-garamond-latin-300-italic.woff"),
  asset("assets/og/cormorant-garamond-latin-400-italic.woff"),
  asset("assets/og/great-vibes-latin-400-normal.woff"),
  asset("assets/og/source-serif-4-latin-400-normal.woff"),
  asset(join("public", wedding.images.roses.src)),
  asset(join("public", wedding.images.couple.src)).catch(() => null),
]).then(([corLight, corItalic, vibes, serif, roses, hero]) => ({
  fonts: [
    { name: "Cormorant", data: corLight, weight: 300 as const, style: "italic" as const },
    { name: "Cormorant", data: corItalic, weight: 400 as const, style: "italic" as const },
    { name: "Vibes", data: vibes, weight: 400 as const, style: "normal" as const },
    { name: "Serif", data: serif, weight: 400 as const, style: "normal" as const },
  ],
  roses: `data:image/png;base64,${roses.toString("base64")}`,
  hero: hero ? `data:image/jpeg;base64,${hero.toString("base64")}` : null,
}));

function Names({ partners: [a, b], size }: { partners: readonly [string, string]; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 300, fontSize: size, lineHeight: 1, color: C.accent }}>
      <span>{a}</span>
      <span style={{ fontFamily: "Vibes", fontStyle: "normal", fontSize: size * 0.8, margin: `0 ${size * 0.18}px` }}>&amp;</span>
      <span>{b}</span>
    </div>
  );
}

/**
 * `who` is the household's name ("Kwame & Ama Boateng"); leave it out for the
 * generic card on the home page.
 */
export async function inviteCard({ who, withPhoto = true }: { who?: string; withPhoto?: boolean }) {
  const [{ fonts, roses, hero }, w] = await Promise.all([loaded, getWedding()]);
  const photo = withPhoto ? hero : null;
  const lead = who ? [`${who},`, "you're invited to the wedding of"] : ["You're invited to the wedding of"];

  const png = new ImageResponse(
    photo ? (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: C.paper, fontFamily: "Serif", color: C.ink }}>
        <img src={photo} alt="" width={500} height={630} style={{ width: 500, height: 630, objectFit: "cover", objectPosition: wedding.images.couple.focus }} />
        <img src={roses} alt="" width={220} height={253} style={{ position: "absolute", right: -10, bottom: -30, width: 220, height: 253 }} />
        <div style={{ position: "absolute", left: 540, top: 40, width: 600, height: 550, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ display: "flex", fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 400, fontSize: who && who.length > 30 ? 26 : 30, lineHeight: 1.3, color: C.ink2, maxWidth: 580, textAlign: "center", flexDirection: "column", alignItems: "center" }}>
            {lead.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 18 }}>
            <Names partners={w.partners} size={110} />
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 22, letterSpacing: 6.6 }}>{dotDate(w.date)}</div>
        </div>
      </div>
    ) : (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: C.paper, fontFamily: "Serif", color: C.ink }}>
        <div style={{ position: "absolute", left: 28, top: 28, width: 1144, height: 574, border: `1px solid ${C.gold}`, display: "flex" }} />
        <img src={roses} alt="" width={250} height={288} style={{ position: "absolute", right: -10, bottom: -30, width: 250, height: 288 }} />
        <img src={roses} alt="" width={250} height={288} style={{ position: "absolute", left: -10, bottom: -30, width: 250, height: 288, transform: "scaleX(-1)" }} />
        <div style={{ position: "absolute", left: 150, top: 75, width: 900, height: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ display: "flex", fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 400, fontSize: 32, color: C.ink2, textAlign: "center", flexDirection: "column", alignItems: "center" }}>
            {lead.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 16 }}>
            <Names partners={w.partners} size={124} />
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 22, letterSpacing: 6.6 }}>{dotDate(w.date)}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
  // WhatsApp skips preview images much over ~300 KB, and a photo card as PNG is
  // ~600 KB. A JPEG of the same card is a fraction of that.
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
