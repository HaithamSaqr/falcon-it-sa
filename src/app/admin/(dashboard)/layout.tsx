import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
