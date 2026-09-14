import type { AdminRole } from "@prisma/client";

/**
 * Role-based access control (spec §32).
 * Permissions are checked server-side on every admin action — never rely on
 * hiding UI alone (spec §45).
 */
export type Permission =
  | "content.manage" // pages, hero, gallery, videos, news, announcements
  | "events.manage"
  | "temple.manage" // temple info, darshan timings, trust
  | "donations.view" // see donation records + proofs
  | "donations.verify" // move to VERIFIED
  | "donations.approve" // APPROVE / REJECT — releases money-side actions
  | "campaigns.manage"
  | "qr.manage"
  | "settings.manage" // social, SEO, site settings
  | "community.manage" // volunteers, contact submissions
  | "users.manage" // admin users + roles
  | "audit.view";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    "content.manage",
    "events.manage",
    "temple.manage",
    "donations.view",
    "donations.verify",
    "donations.approve",
    "campaigns.manage",
    "qr.manage",
    "settings.manage",
    "community.manage",
    "users.manage",
    "audit.view",
  ],
  TRUSTEE_ADMIN: [
    "content.manage",
    "events.manage",
    "temple.manage",
    "donations.view",
    "donations.verify",
    "donations.approve",
    "campaigns.manage",
    "qr.manage",
    "settings.manage",
    "community.manage",
    "audit.view",
  ],
  CONTENT_MANAGER: [
    "content.manage",
    "events.manage",
    "community.manage",
  ],
  EVENT_MANAGER: ["events.manage"],
  // Donation managers handle verification + receipts, but NOT content or users.
  DONATION_MANAGER: [
    "donations.view",
    "donations.verify",
    "donations.approve",
    "campaigns.manage",
    "qr.manage",
  ],
  VIEWER: ["donations.view", "audit.view"],
};

export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function permissionsFor(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  TRUSTEE_ADMIN: "Trustee Admin",
  CONTENT_MANAGER: "Content Manager",
  EVENT_MANAGER: "Event Manager",
  DONATION_MANAGER: "Donation Manager",
  VIEWER: "Viewer / Auditor",
};
