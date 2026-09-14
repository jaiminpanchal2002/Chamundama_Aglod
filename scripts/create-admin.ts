/**
 * Create or update an admin user. Usage:
 *   npm run create:admin -- <email> <password> <name> <ROLE>
 * ROLE is one of: SUPER_ADMIN TRUSTEE_ADMIN CONTENT_MANAGER EVENT_MANAGER
 *                 DONATION_MANAGER VIEWER  (default SUPER_ADMIN)
 * Falls back to SEED_SUPERADMIN_* env vars when arguments are omitted.
 */
import { PrismaClient, type AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "TRUSTEE_ADMIN",
  "CONTENT_MANAGER",
  "EVENT_MANAGER",
  "DONATION_MANAGER",
  "VIEWER",
];

async function main() {
  const [, , argEmail, argPassword, argName, argRole] = process.argv;
  const email = (argEmail || process.env.SEED_SUPERADMIN_EMAIL || "").toLowerCase();
  const password = argPassword || process.env.SEED_SUPERADMIN_PASSWORD || "";
  const name = argName || process.env.SEED_SUPERADMIN_NAME || "Admin";
  const role: AdminRole = ROLES.includes(argRole as AdminRole)
    ? (argRole as AdminRole)
    : "SUPER_ADMIN";

  if (!email || !password) {
    console.error("Email and password are required.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { name, role, passwordHash, isActive: true },
    create: { email, name, role, passwordHash },
  });
  console.log(`✓ Admin ready: ${user.email} (${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
