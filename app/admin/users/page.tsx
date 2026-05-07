import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UsersClient } from "./UsersClient";
import type { User } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();

  let users: User[] = [];
  let dbError: string | null = null;
  try {
    users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  } catch (e) {
    console.error("listUsers failed:", e);
    dbError =
      "Could not connect to the database. Set DATABASE_URL in .env.local and run `npm run db:push && npm run db:seed`.";
  }

  return (
    <UsersClient
      users={users}
      dbError={dbError}
      currentEmail={session?.user?.email ?? null}
    />
  );
}
