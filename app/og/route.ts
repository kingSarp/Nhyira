import { wedding } from "@/lib/content/wedding";
import { inviteCard } from "@/lib/og";

// The generic preview card: home page and the shared sign-up links.
export async function GET() {
  return inviteCard({ withPhoto: wedding.previewWithPhoto });
}
