import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth";
import { createSupabase } from "@/lib/supabase/server";

// Where the password-reset email's link lands. Two link shapes are accepted:
//   ?token_hash=…&type=recovery  from our email template; works in any browser
//   ?code=…&next=password        Supabase's default template; same browser only
// Either way the organiser is signed in, then sent to choose a new password.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = (params.get("type") ?? "recovery") as EmailOtpType;
  const code = params.get("code");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const supabase = await createSupabase();
  const { data, error } = tokenHash
    ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : { data: null, error: new Error("No token in link") };

  const email = data?.user?.email;
  if (error || !isAdminEmail(email)) {
    if (!error) await supabase.auth.signOut();
    return to(`/login?error=link${email ? `&email=${encodeURIComponent(email)}` : ""}`);
  }
  return to(type === "recovery" || params.get("next") === "password" ? "/login/new-password" : "/admin");
}
