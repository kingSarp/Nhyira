import { ScreenStub } from "@/components/dev/ScreenStub";

export default function HomePage() {
  return (
    <ScreenStub
      title="Home, save the date"
      boards={["3 · Home / save the date"]}
      states={["One state: full-bleed portrait, names, date, city, 'open your personal link' line"]}
    />
  );
}
