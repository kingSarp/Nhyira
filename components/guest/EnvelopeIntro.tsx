"use client";

import { useEffect, useRef, useState } from "react";
import { Roses } from "./Roses";

/** Fired when the envelope is opened; the music player starts on it (same tap, so phones allow sound). */
export const OPEN_EVENT = "nhyira:open";

/** Removes the pause on the page's load animations (see `[data-sealed]` in globals.css). */
function unseal() {
  document.querySelector("[data-sealed]")?.removeAttribute("data-sealed");
}

/** A wax seal's wavy rim: 16 scallops around a circle in a 100×100 box. */
const SEAL_RIM = Array.from({ length: 128 }, (_, i) => {
  const a = (i / 128) * Math.PI * 2;
  const r = 45 + 2.5 * Math.cos(16 * a);
  return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

/** When the envelope fades and when it's removed, in ms after the tap (the flap and card timings are in the classes). */
const T = { fade: 1500, gone: 2100 };

/**
 * A sealed envelope over the page until the guest taps it: the seal lifts,
 * the flap opens on a kente lining, the card rises, and it fades away. Once
 * per browser session per `storageKey`. Server-rendered so it covers the page
 * from the first paint; `GuestPage sealed` hides it (and unpauses the page)
 * when JavaScript is off.
 */
export function EnvelopeIntro({
  to,
  partners,
  date,
  storageKey,
}: {
  /** Under the envelope, e.g. "For Ama". */
  to: string;
  partners: readonly [string, string];
  /** "26 · 12 · 2026" */
  date: string;
  storageKey: string;
}) {
  const [stage, setStage] = useState<"closed" | "opening" | "fading" | "gone">("closed");
  const button = useRef<HTMLButtonElement>(null);
  const [a, b] = partners;

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(storageKey) === "1";
    } catch {}
    if (seen) {
      unseal();
      // Already opened this session: skip it.
      const id = requestAnimationFrame(() => setStage("gone"));
      return () => cancelAnimationFrame(id);
    }
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    // Keyboard users land on it; no focus ring drawn until they actually use the keyboard.
    button.current?.focus({ focusVisible: false } as FocusOptions);
    return () => {
      root.style.overflow = overflow;
    };
  }, [storageKey]);

  useEffect(() => {
    if (stage === "gone") document.documentElement.style.overflow = "";
  }, [stage]);

  function open() {
    if (stage !== "closed") return;
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {}
    window.dispatchEvent(new Event(OPEN_EVENT));
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStage("opening");
    setTimeout(
      () => {
        unseal();
        setStage("fading");
        setTimeout(
          () => {
            setStage("gone");
            document.querySelector("main")?.focus({ preventScroll: true });
          },
          quick ? 0 : T.gone - T.fade,
        );
      },
      quick ? 0 : T.fade,
    );
  }

  if (stage === "gone") return null;
  const isOpen = stage !== "closed";

  return (
    <div
      data-open={isOpen}
      data-fading={stage === "fading"}
      className="envelope-intro group fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,var(--paper)_35%,var(--panel)_100%)] px-6 transition-opacity duration-[600ms] data-[fading=true]:opacity-0"
    >
      <Roses size="md" className="pointer-events-none absolute -right-6 -bottom-8 opacity-90" />
      <Roses size="sm" className="pointer-events-none absolute -top-6 -left-6 rotate-180 opacity-80" />

      {/* Names above the envelope */}
      <div aria-hidden className="relative flex flex-col items-center gap-2 text-center transition-opacity duration-300 group-data-[open=true]:opacity-0">
        <p className="m-0 font-display text-[38px] leading-none font-light italic">
          {a} <span className="font-script text-[30px] text-accent not-italic">&amp;</span> {b}
        </p>
        <p className="type-dateline m-0 text-[12px] text-ink-2">{date}</p>
      </div>

      <button
        ref={button}
        type="button"
        onClick={open}
        aria-label={`Open your invitation. ${to}`}
        className="motion-bob relative block aspect-[10/7] w-[min(88vw,380px)] cursor-pointer border-0 bg-transparent p-0 [perspective:1000px] group-data-[open=true]:animate-none"
      >
        {/* Back of the envelope, with the kente lining that shows once the flap is open */}
        <span aria-hidden className="absolute inset-0 z-0 border border-line bg-panel shadow-overlay" />
        <span
          aria-hidden
          className="absolute inset-x-[3%] top-[3%] z-[1] h-[52%] bg-[url(/images/kente.svg)] bg-[length:28px_28px] opacity-90 [clip-path:polygon(0_0,100%_0,50%_100%)]"
        />

        {/* The card inside, which rises out */}
        <span
          aria-hidden
          className="absolute inset-x-[7%] top-[6%] bottom-[5%] z-[3] flex flex-col items-center justify-center gap-1.5 border border-line bg-paper px-3 text-center transition-transform delay-[650ms] duration-700 ease-out group-data-[open=true]:-translate-y-[80%] group-data-[open=true]:scale-105"
        >
          <span className="block h-px w-8 bg-gold" />
          <span className="font-display text-[20px] leading-tight italic">
            {a} <span className="font-script text-accent not-italic">&amp;</span> {b}
          </span>
          <span className="font-display text-[14px] text-ink-2 italic">invite you</span>
          <span className="type-dateline text-[10px] text-ink-2">{date}</span>
          <span className="block h-px w-8 bg-gold" />
        </span>

        {/* Front pocket: side flaps and bottom flap, with fold lines */}
        <svg aria-hidden viewBox="0 0 100 70" preserveAspectRatio="none" className="absolute inset-0 z-[4] size-full">
          <polygon points="0,0 50,40 0,70" className="fill-panel stroke-line" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
          <polygon points="100,0 50,40 100,70" className="fill-panel stroke-line" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
          <polygon points="0,70 50,33 100,70" className="fill-quiet-tint stroke-line" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
        </svg>
        <span aria-hidden className="absolute inset-0 z-[4] border border-t-0 border-line" />

        {/* Flap: paper outside, kente lining inside; drops behind the card once open */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 z-[5] h-[58%] origin-top transition-[transform,z-index] delay-150 duration-[600ms] ease-in-out [transform-style:preserve-3d] group-data-[open=true]:z-[2] group-data-[open=true]:[transform:rotateX(180deg)]"
        >
          <span className="absolute inset-0 bg-quiet-tint [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]">
            <svg viewBox="0 0 100 58" preserveAspectRatio="none" className="absolute inset-0 size-full">
              <polyline points="0,0 50,58 100,0" className="fill-none stroke-line" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
          <span className="absolute inset-0 bg-[url(/images/kente.svg)] bg-[length:28px_28px] [backface-visibility:hidden] [clip-path:polygon(0_100%,100%_100%,50%_0)] [transform:rotateX(180deg)]" />
        </span>

        {/* Wax seal */}
        <span
          aria-hidden
          className="absolute top-[58%] left-1/2 z-[6] block size-[76px] -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-300 group-data-[open=true]:-translate-y-[70%] group-data-[open=true]:scale-125 group-data-[open=true]:opacity-0"
        >
          <svg viewBox="0 0 100 100" className="size-full drop-shadow-[0_3px_4px_rgb(var(--scrim)_/_0.35)]">
            <defs>
              <radialGradient id="seal-wax" cx="38%" cy="32%" r="75%">
                <stop offset="0%" style={{ stopColor: "var(--gold)" }} />
                <stop offset="100%" style={{ stopColor: "var(--gold-deep)" }} />
              </radialGradient>
            </defs>
            <polygon points={SEAL_RIM} fill="url(#seal-wax)" />
            <circle cx="50" cy="50" r="33" fill="none" className="stroke-paper" strokeOpacity="0.55" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="29" fill="none" className="stroke-gold-deep" strokeOpacity="0.6" strokeWidth="1" />
            <text x="50" y="58" textAnchor="middle" className="fill-paper font-display" fontSize="24" fontStyle="italic">
              {a.charAt(0)}
              <tspan className="font-script" fontStyle="normal" fontSize="20">
                {" & "}
              </tspan>
              {b.charAt(0)}
            </text>
          </svg>
        </span>
      </button>

      <div aria-hidden className="relative flex flex-col items-center gap-2 text-center transition-opacity duration-300 group-data-[open=true]:opacity-0">
        <p className="type-greeting m-0 text-[36px]">{to}</p>
        <p className="type-eyebrow m-0">Tap the seal to open</p>
      </div>
    </div>
  );
}
