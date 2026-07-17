import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/medusa/admin-auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { connection } from "next/server";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
    await connection() // wait for an actual request
  // Defense in depth — middleware already gates, but never render the panel unauthed.
  if (!(await isAuthed())) redirect("/admin/login");

  return (
      <div className="flex min-h-screen bg-muted/40">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
  );
}
