import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { PageHeader, Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireAdmin("audit.view");
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Append-only record of important administrative actions. Cannot be modified."
      />
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-slate-100">
                <td className="p-3 text-slate-500">
                  {l.createdAt.toLocaleString("en-IN")}
                </td>
                <td className="p-3">{l.actor?.name || l.actorEmail || "—"}</td>
                <td className="p-3 font-mono text-xs">{l.action}</td>
                <td className="p-3 text-slate-500">
                  {l.entityType}
                  {l.entityId ? ` · ${l.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="p-3 text-slate-400">{l.ipAddress || "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
