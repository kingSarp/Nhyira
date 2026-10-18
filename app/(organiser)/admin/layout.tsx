import { redirect } from "next/navigation";
import { AdminTabs } from "@/components/organiser/AdminTabs";
import { wedding } from "@/lib/content/wedding";
import { getOrganiser, listJoinRequests } from "@/lib/data";
import { signOut } from "../login/actions";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const organiser = await getOrganiser();
  if (!organiser) redirect("/login");
  const pending = (await listJoinRequests("pending")).length;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 pt-6 pb-12 lg:gap-8 lg:px-6 lg:pt-10 lg:pb-16">
      <header className="flex flex-col gap-1 lg:flex-row-reverse lg:items-end lg:justify-between lg:gap-6">
        <div className="flex items-center justify-between gap-4 text-[14px] text-ink-2 lg:text-[15px]">
          <span>{organiser.email}</span>
          <form action={signOut}>
            <button type="submit" className="flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-accent underline underline-offset-[3px]">
              Sign out
            </button>
          </form>
        </div>
        <p className="m-0 font-script text-[44px] font-normal leading-tight lg:text-[56px]">{wedding.coupleNames}</p>
      </header>
      <AdminTabs pending={pending} />
      {children}
    </div>
  );
}
