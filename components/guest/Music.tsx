import { getWedding } from "@/lib/data";
import { MusicPlayer } from "./MusicPlayer";

/** The music button, when organisers have uploaded a song. */
export async function Music() {
  const { music } = await getWedding();
  return music ? <MusicPlayer src={music} /> : null;
}
