"use client";

import { useEffect, useRef, useState } from "react";
import { OPEN_EVENT } from "./EnvelopeIntro";

/**
 * The background song and its play/pause button. Never starts by itself:
 * it plays when the envelope is opened (that tap counts, so phones allow
 * sound) or when the guest taps the button.
 */
export function MusicPlayer({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Called inside the envelope's click, so the browser treats it as the guest's choice.
    const start = () => void audio.current?.play().catch(() => {});
    window.addEventListener(OPEN_EVENT, start);
    return () => window.removeEventListener(OPEN_EVENT, start);
  }, []);

  return (
    <>
      <audio ref={audio} src={src} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button
        type="button"
        aria-label="Background music"
        aria-pressed={playing}
        onClick={() => (playing ? audio.current?.pause() : void audio.current?.play().catch(() => {}))}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex size-12 cursor-pointer items-center justify-center rounded-full border border-line bg-paper text-accent shadow-float"
      >
        <svg aria-hidden viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          {playing ? (
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          ) : (
            <path d="M9 17.5V6.2l10-2.2v11.3a2.8 2.8 0 1 1-1.6-2.5V7.6L10.6 9v8.6A2.8 2.8 0 1 1 9 17.5z" />
          )}
        </svg>
      </button>
    </>
  );
}
