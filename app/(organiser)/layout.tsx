import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OrganiserLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-surface="organiser" className="min-h-dvh">
      {children}
    </div>
  );
}
