import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth — middleware already gates, but never render the panel unauthed.
  if (!(await isAuthed())) redirect("/admin/login");

  return (
      <div className="flex min-h-screen bg-muted/40">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
  );
}
