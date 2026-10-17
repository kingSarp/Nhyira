import Link from "next/link";

/**
 * Placeholder for a route whose screen hasn't been built yet. Shows which
 * design boards it must match and which states it covers. Delete once built.
 */
export function ScreenStub({
  title,
  boards,
  states,
  data,
}: {
  title: string;
  boards: string[];
  states: string[];
  data?: Record<string, string | number | null>;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[680px] flex-col gap-6 px-5 py-14">
      <p className="type-eyebrow m-0">Screen not built yet</p>
      <h1 className="m-0 type-title">{title}</h1>
      <section className="flex flex-col gap-2">
        <h2 className="type-label m-0 text-ink-2">Design boards</h2>
        <ul className="m-0 list-disc pl-5">
          {boards.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="type-label m-0 text-ink-2">States to build</h2>
        <ul className="m-0 list-disc pl-5">
          {states.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      {data && (
        <section className="flex flex-col gap-2">
          <h2 className="type-label m-0 text-ink-2">Mock data this route receives</h2>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 bg-panel p-4 text-[15px]">
            {Object.entries(data).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink-2">{k}</dt>
                <dd className="m-0">{v ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <p className="m-0 text-[15px] text-ink-2">
        Components and tokens: <Link href="/styleguide">/styleguide</Link>
      </p>
    </main>
  );
}
