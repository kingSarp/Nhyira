"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { checkInGuest, searchGuests, undoGuest } from "@/app/(organiser)/checkin/actions";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { clockTime, type CheckInView, type GuestHit } from "@/lib/checkin";

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type Decode = (video: HTMLVideoElement) => Promise<string | null>;

/** The phone's built-in QR reader where there is one (Android Chrome), else jsQR (iPhone Safari). */
async function makeDecoder(): Promise<Decode> {
  const BD = (globalThis as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
  if (BD) {
    const detector = new BD({ formats: ["qr_code"] });
    return async (video) => (await detector.detect(video))[0]?.rawValue ?? null;
  }
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  return async (video) => {
    const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    if (!canvas.width) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" })?.data ?? null;
  };
}

function Result({ view, onUndo, busy }: { view: CheckInView; onUndo: (token: string) => void; busy: boolean }) {
  if (view.status === "unknown" || view.status === "invalid") {
    return (
      <div role="alert" className="flex items-start gap-3 bg-error-tint p-5 text-error">
        <Icon name="alert" size={28} />
        <div>
          <p className="m-0 text-[22px] font-semibold">{view.status === "unknown" ? "Not on the guest list" : "Not a valid pass"}</p>
          <p className="m-0 mt-1 text-[15px] text-ink">Search their name or phone below, or ask an organiser.</p>
        </div>
      </div>
    );
  }
  const fresh = view.status === "checked-in";
  return (
    <div role="status" className={cn("flex flex-col gap-3 p-5", fresh ? "bg-success-tint" : "bg-error-tint")}>
      <div className={cn("flex items-start gap-3", fresh ? "text-success" : "text-error")}>
        <Icon name={fresh ? "check" : "alert"} size={28} />
        <div>
          <p className="m-0 text-[22px] font-semibold">{fresh ? "Checked in" : `Already checked in at ${clockTime(view.at)}`}</p>
          <p className="m-0 mt-1 text-[20px] text-ink">{view.name}</p>
          <p className="m-0 mt-0.5 text-[15px] text-ink-2">
            Admits {view.people}
            {!fresh && view.by ? ` · by ${view.by}` : ""}
          </p>
          {view.declined && <p className="m-0 mt-1 text-[15px] text-ink">Note: they replied that they can&apos;t come.</p>}
        </div>
      </div>
      {fresh && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onUndo(view.token)}
          className="flex min-h-11 cursor-pointer items-center self-start border-0 bg-transparent p-0 text-[15px] text-ink underline underline-offset-[3px]"
        >
          Undo
        </button>
      )}
    </div>
  );
}

/** Scan passes with the camera, or find guests by name or phone. */
export function CheckInDesk() {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [view, setView] = useState<CheckInView | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hits, setHits] = useState<GuestHit[] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const last = useRef<{ code: string; at: number } | null>(null);

  const submit = (code: string) =>
    startTransition(async () => {
      const result = await checkInGuest(code);
      setView(result);
      if (result.status === "checked-in") navigator.vibrate?.(80);
      router.refresh();
    });

  useEffect(() => {
    if (!scanning) return;
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        const decode = await makeDecoder();
        const tick = async () => {
          if (stopped) return;
          const code = video.readyState >= 2 ? await decode(video).catch(() => null) : null;
          const now = Date.now();
          // The same pass stays in front of the camera for a moment; act on it once.
          if (code && !(last.current?.code === code && now - last.current.at < 4000)) {
            last.current = { code, at: now };
            submit(code);
          }
          timer = setTimeout(tick, 250);
        };
        tick();
      } catch {
        setCameraError("The camera didn't start. Allow camera access for this site, or search by name below.");
        setScanning(false);
      }
    })();
    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // `submit` is stable enough: it only closes over setters and the router.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Scan a pass" className="flex flex-col gap-4">
        <div className="relative aspect-square w-full max-w-[480px] overflow-hidden bg-ink">
          <video ref={videoRef} playsInline muted className={cn("size-full object-cover", !scanning && "hidden")} />
          {scanning ? (
            <div aria-hidden className="pointer-events-none absolute inset-[18%] border-2 border-white/80" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
              <p className="m-0 text-[17px]">Point the camera at the guest&apos;s QR code.</p>
              <Button type="button" onClick={() => (setCameraError(null), setScanning(true))}>
                Start scanning
              </Button>
            </div>
          )}
        </div>
        {scanning && (
          <div>
            <Button type="button" variant="secondary" className="!h-11 px-5" onClick={() => setScanning(false)}>
              Stop camera
            </Button>
          </div>
        )}
        {cameraError && <p className="m-0 text-[15px] text-error">{cameraError}</p>}
        <div aria-live="polite" className="max-w-[480px]">
          {view && (
            <Result
              view={view}
              busy={busy}
              onUndo={(token) =>
                startTransition(async () => {
                  await undoGuest(token);
                  setView(null);
                  last.current = null;
                  router.refresh();
                })
              }
            />
          )}
        </div>
      </section>

      <section aria-labelledby="find-title" className="flex max-w-[480px] flex-col gap-3 border-t border-line pt-5">
        <h2 id="find-title" className="m-0 text-[20px] font-normal">
          No QR code?
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = String(new FormData(e.currentTarget).get("q") ?? "");
            startTransition(async () => setHits(await searchGuests(q)));
          }}
          className="flex gap-2"
          role="search"
        >
          <label htmlFor="q" className="sr-only">
            Name or phone number
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="Name or phone number"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-input border border-border bg-field px-3 text-[17px] text-ink focus:border-2 focus:border-accent focus:px-[11px] focus:outline-none"
          />
          <Button type="submit" variant="secondary" className="!h-11 px-5" disabled={busy}>
            Find
          </Button>
        </form>
        {hits && hits.length === 0 && <p className="m-0 text-[15px] text-ink-2">No one found. Try part of their name or the last digits of their phone.</p>}
        {hits && hits.length > 0 && (
          <ul className="m-0 flex list-none flex-col p-0">
            {hits.map((h) => (
              <li key={h.token} className="flex min-h-14 items-center justify-between gap-3 border-b border-line py-2">
                <div className="min-w-0">
                  <p className="m-0 truncate text-[16px]">{h.name}</p>
                  <p className="m-0 text-[14px] text-ink-2">
                    Admits {h.people}
                    {h.phoneEnd ? ` · phone …${h.phoneEnd}` : ""}
                    {h.declined ? " · replied no" : ""}
                  </p>
                </div>
                {h.checkedInAt ? (
                  <span className="whitespace-nowrap text-[14px] text-success">Arrived {clockTime(h.checkedInAt)}</span>
                ) : (
                  <Button
                    type="button"
                    className="!h-11 px-5"
                    disabled={busy}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await checkInGuest(h.token);
                        setView(result);
                        setHits((list) => list?.map((x) => (x.token === h.token && "at" in result ? { ...x, checkedInAt: result.at } : x)) ?? null);
                        router.refresh();
                      })
                    }
                  >
                    Check in
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
