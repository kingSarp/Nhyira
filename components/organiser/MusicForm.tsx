"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Notice } from "@/components/ui";
import { MAX_MUSIC_BYTES, MUSIC_TYPES } from "@/lib/wedding-form";

const EXT: Record<string, string> = { "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac" };

/**
 * The background song. The browser uploads the file straight to Supabase
 * Storage with the organiser's session (songs are bigger than a server action
 * accepts), then `save` records it. Needs JavaScript; removing doesn't.
 */
export function MusicForm({
  song,
  save,
  remove,
}: {
  song: { src: string; name: string } | null;
  save: (path: string, name: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  remove: () => Promise<void>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function upload(file: File) {
    setError(null);
    setSaved(false);
    const type = file.type || (file.name.toLowerCase().endsWith(".m4a") ? "audio/mp4" : "audio/mpeg");
    if (!MUSIC_TYPES.includes(type)) return setError("Choose an MP3 or M4A file.");
    if (file.size > MAX_MUSIC_BYTES) return setError("That file is over 10 MB. Choose a shorter or smaller one.");

    setBusy(true);
    try {
      // Loaded only here, so other pages don't download Supabase.
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
      const bucket = supabase.storage.from("wedding-music");
      const path = `music/${crypto.randomUUID()}.${EXT[type]}`;
      const { error: uploadError } = await bucket.upload(path, file, { contentType: type, cacheControl: "31536000", upsert: false });
      if (uploadError) throw new Error(uploadError.message);

      const result = await save(path, file.name);
      if (!result.ok) {
        await bucket.remove([path]);
        setError(result.message);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      console.error("Song upload failed", err);
      setError("The song didn't upload. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-[560px] flex-col gap-5">
      {saved && (
        <Notice tone="success" icon="check" title="Saved">
          Guests hear it after they open their invitation.
        </Notice>
      )}
      {error && (
        <div id="music-error">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {song ? (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[15px]">
            Now playing: <span className="font-semibold">{song.name}</span>
          </p>
          <audio controls preload="none" src={song.src} className="w-full">
            Your browser can&apos;t play this preview.
          </audio>
        </div>
      ) : (
        <p className="m-0 text-[15px] text-ink-2">No song yet. Invitations open without music.</p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="music_file" className="type-label text-ink-2">
          {song ? "Replace the song" : "Choose a song"}
        </label>
        <input
          id="music_file"
          type="file"
          accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a,audio/aac"
          disabled={busy}
          aria-describedby={error ? "music-hint music-error" : "music-hint"}
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            e.currentTarget.value = "";
            if (f) void upload(f);
          }}
          className="min-h-11 text-[15px] file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border file:border-ink file:bg-transparent file:px-4 file:text-ink"
        />
        <p id="music-hint" className="m-0 text-[14px] text-ink-2">
          {busy ? "Uploading…" : "MP3 or M4A, up to 10 MB. Use a song you have the right to share. It uploads as soon as you choose it."}
        </p>
        <noscript>
          <p className="m-0 text-[14px] text-error">Uploading a song needs JavaScript turned on.</p>
        </noscript>
      </div>

      {song && (
        <form action={remove}>
          <Button type="submit" variant="secondary" disabled={busy}>
            Remove the song
          </Button>
        </form>
      )}
    </div>
  );
}
