import type { Metadata } from "next";
import { ScreenStub } from "@/components/dev/ScreenStub";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <ScreenStub
      title="Guest list sign in"
      boards={["4a · Sign in", "4b · Link sent", "4c · Link expired"]}
      states={["Enter email", "Link sent (?sent=1)", "Link expired (?error=link)"]}
    />
  );
}
