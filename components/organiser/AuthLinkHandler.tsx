"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect } from "react";

/**
 * Picks up Supabase links that carry the session after "#" (sent from the
 * Supabase dashboard, or when a link falls back to the Site URL). The server
 * never sees that part, so it's read here, stored as the session cookie, and
 * the organiser is sent on. /auth/confirm handles the "?code=" and
 * "?token_hash=" links our own reset emails use.
 */
export function AuthLinkHandler() {
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) return;

    // Take the tokens out of the address bar and history straight away.
    history.replaceState(null, "", window.location.pathname + window.location.search);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { detectSessionInUrl: false } },
    );
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      // /login/new-password and /admin re-check ADMIN_EMAILS on the server.
      if (error) window.location.replace("/login?error=link");
      else window.location.replace(hash.get("type") === "recovery" ? "/login/new-password" : "/admin");
    });
  }, []);

  return null;
}
