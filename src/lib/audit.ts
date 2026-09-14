import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

interface AuditInput {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: unknown;
  newValues?: unknown;
}

/** Best-effort request metadata (never throws). */
export async function requestMeta() {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null;
    const userAgent = h.get("user-agent") ?? null;
    return { ip, userAgent };
  } catch {
    return { ip: null, userAgent: null };
  }
}

/**
 * Append an audit entry (spec §33). Append-only: there is no update/delete path
 * exposed to admins. Failures are swallowed so auditing never breaks a flow.
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    const { ip, userAgent } = await requestMeta();
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: (input.oldValues as object | undefined) ?? undefined,
        newValues: (input.newValues as object | undefined) ?? undefined,
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
