import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isInstalled } from "@/lib/db/config";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";

// Must render per-request: the install/auth gate reads the db-config file and
// the session cookie at runtime. Without this, the build-time redirect to
// /setup (no config at build) gets statically baked in and cached forever.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // First-run: force the setup wizard before the dashboard is reachable.
  if (!(await isInstalled())) {
    redirect("/setup");
  }

  const { authenticated } = await getSession();
  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
