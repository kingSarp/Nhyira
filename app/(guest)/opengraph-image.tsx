import { inviteCard, ogSize } from "@/lib/og";
import { wedding } from "@/lib/content/wedding";

// Generic card for the home page and the shared sign-up links.
export const alt = "Wedding invitation";
export const size = ogSize;
export const contentType = "image/jpeg";

export default async function Image() {
  return inviteCard({ withPhoto: wedding.previewWithPhoto });
}
