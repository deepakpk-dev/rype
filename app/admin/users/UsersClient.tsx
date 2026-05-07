"use client";
import { Database, Shield, User as UserIcon } from "lucide-react";
import type { User } from "@prisma/client";
import { useIsAdmin } from "@/lib/session-helpers";
import { Forbidden } from "@/components/admin/RoleGate";
import { cn } from "@/lib/utils";

export function UsersClient({
  users,
  dbError,
  currentEmail,
}: {
  users: User[];
  dbError: string | null;
  currentEmail: string | null;
}) {
  const isAdmin = useIsAdmin();

  if (!isAdmin) return <Forbidden message="User management is admin-only." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-rype-mute">
          Seeded admin and staff accounts, now persisted in Postgres. Passwords
          are bcrypt-hashed.
        </p>
      </div>

      {dbError && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rype-orange/30 bg-rype-orange/5 px-4 py-3 text-sm text-rype-orange">
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium text-rype-ink">Database not connected</div>
            <div className="mt-0.5 text-rype-ink/70">{dbError}</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {users.map((u) => {
          const isMe = currentEmail === u.email;
          const Icon = u.role === "admin" ? Shield : UserIcon;
          return (
            <div
              key={u.email}
              className={cn("card p-5", isMe && "ring-2 ring-rype-leaf")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      u.role === "admin"
                        ? "bg-rype-leaf/10 text-rype-leafDark"
                        : "bg-rype-yellow/25 text-rype-ink"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{u.name ?? u.email}</div>
                    <div className="text-xs text-rype-mute">{u.email}</div>
                  </div>
                </div>
                {isMe && (
                  <span className="rounded-full bg-rype-leaf/10 px-2 py-0.5 text-[11px] font-medium text-rype-leafDark">
                    You
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full border border-rype-line bg-white px-2 py-0.5 text-xs capitalize text-rype-mute">
                  {u.role}
                </span>
                <span className="text-xs text-rype-mute">
                  {u.role === "admin"
                    ? "Full access — inventory, orders, users"
                    : "Orders only — can update statuses"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-rype-mute">
        Roles cannot be changed in the UI yet — edit directly via Prisma Studio
        (<code className="rounded bg-rype-cream/60 px-1 py-0.5">npm run db:studio</code>) for now.
      </p>
    </div>
  );
}
