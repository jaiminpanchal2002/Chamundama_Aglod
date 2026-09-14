"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  verifyDonation,
  approveDonation,
  rejectDonation,
  clarifyDonation,
} from "../actions";

export function DonationActions({
  donationId,
  status,
  canVerify,
  canApprove,
}: {
  donationId: string;
  status: string;
  canVerify: boolean;
  canApprove: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"reject" | "clarify" | null>(null);

  const run = (fn: () => Promise<void>) => {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        setMode(null);
        setReason("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed");
      }
    });
  };

  const isFinal = status === "APPROVED" || status === "REJECTED";
  const canVerifyNow =
    canVerify &&
    (status === "PENDING_VERIFICATION" || status === "CLARIFICATION_REQUIRED");
  const canApproveNow = canApprove && status === "VERIFIED";

  if (isFinal) {
    return (
      <p className="text-sm text-slate-500">
        This donation is <strong>{status.toLowerCase()}</strong>. No further
        action required.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {pending && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Working…
        </p>
      )}
      {error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}

      {canVerifyNow && (
        <button
          disabled={pending}
          onClick={() => run(() => verifyDonation(donationId))}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          Mark Verified
        </button>
      )}

      {canApproveNow && (
        <button
          disabled={pending}
          onClick={() => run(() => approveDonation(donationId))}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
        >
          Approve & Generate Receipt
        </button>
      )}
      {canApprove && status !== "VERIFIED" && (
        <p className="text-xs text-slate-400">
          A donation must be verified before it can be approved.
        </p>
      )}

      {(canVerify || canApprove) && (
        <div className="border-t border-slate-100 pt-3">
          {mode === null ? (
            <div className="flex gap-2">
              {canVerify && (
                <button
                  onClick={() => setMode("clarify")}
                  className="flex-1 rounded-md border border-orange-300 px-3 py-2 text-sm text-orange-700 hover:bg-orange-50"
                >
                  Request Clarification
                </button>
              )}
              {canApprove && (
                <button
                  onClick={() => setMode("reject")}
                  className="flex-1 rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  Reject
                </button>
              )}
            </div>
          ) : (
            <div>
              <label className="admin-label">
                {mode === "reject"
                  ? "Reason shown to donor"
                  : "What clarification is needed?"}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="admin-input"
              />
              <div className="mt-2 flex gap-2">
                <button
                  disabled={pending || reason.trim().length < 3}
                  onClick={() =>
                    run(() =>
                      mode === "reject"
                        ? rejectDonation(donationId, reason)
                        : clarifyDonation(donationId, reason),
                    )
                  }
                  className="rounded-md bg-temple-maroon px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setMode(null);
                    setReason("");
                  }}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
