export default function GuestLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-surface="guest" className="min-h-dvh">
      {children}
    </div>
  );
}
