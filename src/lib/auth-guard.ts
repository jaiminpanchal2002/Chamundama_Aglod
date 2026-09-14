import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { auth } from "@/auth";
import { can, type Permission } from "@/lib/rbac";

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

/**
 * Server-side gate for admin pages/actions. Redirects unauthenticated users to
 * the login page. If a permission is supplied, users lacking it are sent to the
 * dashboard (authorization is always enforced on the server — spec §45).
 */
export async function requireAdmin(
  permission?: Permission,
): Promise<AdminSessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.role) {
    redirect("/admin/login");
  }
  const admin: AdminSessionUser = {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role,
  };
  if (permission && !can(admin.role, permission)) {
    redirect("/admin?denied=1");
  }
  return admin;
}

/** Throwing variant for use inside server actions / API routes. */
export async function assertPermission(
  permission: Permission,
): Promise<AdminSessionUser> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.role || !can(user.role, permission)) {
    throw new Error("Not authorized");
  }
  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email ?? "",
    role: user.role,
  };
}
