"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/admin-users";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, roles: ["admin", "staff"] },
  { href: "/admin/inventory", label: "Inventory", icon: Package, roles: ["admin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["admin"] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data } = useSession();
  const user = data?.user;

  if (!user || !user.role) return null;
  const role = user.role as Role;
  const visible = NAV.filter((n) => n.roles.includes(role));

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-rype-line bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rype-leaf text-white">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <div className="font-display text-lg font-semibold leading-none">Rype</div>
          <div className="text-[11px] uppercase tracking-wider text-rype-mute">Admin</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visible.map((n) => {
          const active =
            n.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-rype-leaf/10 text-rype-leafDark"
                  : "text-rype-ink/70 hover:bg-rype-ink/5 hover:text-rype-ink"
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-rype-line p-3">
        <div className="px-2 pb-2">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-xs text-rype-mute capitalize">{role}</div>
          <div className="truncate text-[11px] text-rype-mute">{user.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rype-ink/70 transition hover:bg-rype-red/10 hover:text-rype-red"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
