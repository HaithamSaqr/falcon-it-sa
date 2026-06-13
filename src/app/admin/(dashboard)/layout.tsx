import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isInstalled } from "@/lib/db/config";
import AdminShell from "@/components/admin/admin-shell";

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

  return <AdminShell>{children}</AdminShell>;
}
