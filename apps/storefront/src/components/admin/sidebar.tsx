"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LayoutTemplate, Navigation, Megaphone, Rocket, ScanSearch, ShoppingBag, Receipt, Tag, TicketPercent, FolderTree, UserRound, Users, Settings, LogOut, ExternalLink, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils/utils";
// import { cn } from "@ecom/ui";

const items = [
  { href: "/admin-portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin-portal/orders", label: "Orders", icon: Receipt, exact: false },
  { href: "/admin-portal/products", label: "Products", icon: ShoppingBag, exact: false },
  { href: "/admin-portal/categories", label: "Categories", icon: FolderTree, exact: false },
  { href: "/admin-portal/discounts", label: "Discounts", icon: Tag, exact: false },
  { href: "/admin-portal/price-lists", label: "Sales", icon: TicketPercent, exact: false },
  { href: "/admin-portal/customers", label: "Customers", icon: UserRound, exact: false },
  { href: "/admin-portal/pages", label: "Pages", icon: LayoutTemplate, exact: false },
  { href: "/admin-portal/navigation", label: "Navigation", icon: Navigation, exact: false },
  { href: "/admin-portal/popups", label: "Popups", icon: Megaphone, exact: false },
  { href: "/admin-portal/campaigns", label: "Campaigns", icon: Rocket, exact: false },
  { href: "/admin-portal/persona", label: "Persona", icon: ClipboardList, exact: false },
  { href: "/admin-portal/site", label: "Storefront", icon: LayoutTemplate, exact: false },
  { href: "/admin-portal/visual-search", label: "Visual Search", icon: ScanSearch, exact: false },
  { href: "/admin-portal/leads", label: "Guest Leads", icon: Users, exact: false },
  { href: "/admin-portal/settings", label: "Settings", icon: Settings, exact: false }
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin-portal/login");
    router.refresh();
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <span className="font-display text-xl font-medium">Maison</span>
        <span className="ml-2 text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">Admin</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" />
          View store
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
