// components/admin-bar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Pencil, Shield } from "lucide-react";
import { isSlugEditable } from "@/lib/config";

interface AdminBarProps {
  isAuthenticated: boolean;
  onLogout?: () => Promise<void>;
  adminName?: string;
}

export function AdminBar({
  isAuthenticated,
  onLogout,
  adminName = "Admin",
}: AdminBarProps) {
  const pathname = usePathname();
  const [isEditable, setIsEditable] = useState(false);
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    if (!pathname) {
      setIsEditable(false);
      setEditUrl("");
      return;
    }

    const cleanPath = pathname.replace(/\/+$/, "");

    setIsEditable(isSlugEditable(pathname));
    setEditUrl(`${cleanPath}/edit`);
  }, [pathname]);

  if (!isAuthenticated) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-11 items-center gap-2.5 px-4">
        {/* Admin indicator */}
        <div className="flex items-center gap-1.5 text-primary">
          <Shield className="h-3.5 w-3.5" />
          <Badge
            variant="secondary"
            className="h-5 gap-1 rounded-sm px-1.5 font-mono text-[10px] font-normal"
          >
            ادمین
          </Badge>
        </div>

        <Separator orientation="vertical" className="h-4" />

        {/* Current path */}
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="shrink-0 font-medium">در حال ویرایش:</span>
          <code className="truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
            {pathname === "/" ? "خانه" : pathname}
          </code>
          {!isEditable && (
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-destructive">
              <AlertCircle className="h-3 w-3" />
              غیر قابل ویرایش
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {isEditable && (
            <Button asChild size="sm" className="h-7 gap-1.5 px-3 text-xs">
              <Link href={editUrl}>
                <Pencil className="h-3 w-3" />
                ویرایش این صفحه
              </Link>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs"
            onClick={onLogout}
          >
            خروج
          </Button>
        </div>
      </div>
    </div>
  );
}