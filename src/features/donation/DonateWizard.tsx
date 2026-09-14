"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, ShieldCheck, Upload } from "lucide-react";
import { formatINR } from "@/lib/utils";

export interface WizardCampaign {
  slug: string;
  name: string;
  desc?: string;
}
export interface WizardQr {
  image: string;
  upiId?: string | null;
  accountLabel?: string | null;
}
export interface WizardFields {
  emailRequired: boolean;
  addressRequired: boolean;
  panRequired: boolean;
  allowAnonymous: boolean;
}

const STEPS = ["Cause", "Amount", "Details", "Pay", "Confirm"];

export function DonateWizard({
  campaigns,
  qr,
  presets,
  fields,
  initialCampaign,
}: {
  campaigns: WizardCampaign[];
  qr: WizardQr | null;
  presets: { amounts: number[]; allowCustom: boolean };
  fields: WizardFields;
  initialCampaign?: string;
}) {
  const [step, setStep] = useState(0);
  const [campaignSlug, setCampaignSlug] = useState(
    initialCampaign || campaigns[0]?.slug || "",
  );
  const [amount, setAmount] = useState<number | "">(presets.amounts[0] ?? 501);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pan: "",
    anonymous: false,
    transactionReference: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "UPI",
  });
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const activeCampaign = useMemo(
    () => campaigns.find((c) => c.slug === campaignSlug),
    [campaigns, campaignSlug],
  );

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!campaignSlug || campaigns.length === 0;
    if (step === 1) return typeof amount === "number" && amount > 0;
    if (step === 2)
      return (
        form.name.trim().length >= 2 &&
        form.mobile.trim().length >= 7 &&
        (!fields.emailRequired || !!form.email) &&
        (!fields.addressRequired || !!form.address) &&
        (!fields.panRequired || !!form.pan)
      );
    if (step === 3) return true;
    return true;
  };

  async function submit() {
    if (!proof) {
      setError("Please upload your payment screenshot / receipt.");
      return;
    }
    if (!form.transactionReference.trim()) {
      setError("Please enter the transaction reference / UTR.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      if (campaignSlug) fd.set("campaignSlug", campaignSlug);
      fd.set("amount", String(amount));
      fd.set("paidAmount", String(amount));
      fd.set("purpose", activeCampaign?.name ?? "General Donation");
      fd.set("name", form.name);
      fd.set("mobile", form.mobile);
      if (form.email) fd.set("email", form.email);
      if (form.address) fd.set("address", form.address);
      if (form.city) fd.set("city", form.city);
      if (form.state) fd.set("state", form.state);
      if (form.pan) fd.set("pan", form.pan);
      fd.set("anonymous", String(form.anonymous));
      fd.set("paymentMethod", form.paymentMethod);
      fd.set("transactionReference", form.transactionReference);
      fd.set("paymentDate", form.paymentDate);
      fd.set("proof", proof);

      const res = await fetch("/api/donations", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setReference(json.reference);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Confirmation screen ----
  if (step === 4 && reference) {
    return (
      <div className="card-temple mx-auto max-w-xl text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h2 className="mt-4 font-display text-2xl text-temple-maroon">
          આભાર — તમારી માહિતી પ્રાપ્ત થઈ
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your donation information has been submitted successfully. The Trust
          will verify the payment before generating a receipt.
        </p>
        <div className="mt-6 rounded-temple bg-temple-cream p-4">
          <p className="text-xs uppercase tracking-widest text-temple-red">
            Reference Number
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-temple-maroon">
            {reference}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-700">
            <ShieldCheck className="h-4 w-4" /> Pending Verification
          </p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Please keep this reference number for your records.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Steps indicator */}
      <ol className="mb-8 flex items-center justify-between">
        {STEPS.slice(0, 4).map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                i <= step
                  ? "bg-temple-red text-temple-cream"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span className="ml-2 hidden text-xs font-medium text-muted-foreground sm:inline">
              {label}
            </span>
            {i < 3 && (
              <span
                className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-temple-red" : "bg-muted"}`}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="card-temple">
        {/* Step 0: cause */}
        {step === 0 && (
          <div>
            <h2 className="font-display text-xl text-temple-maroon">
              સેવા પસંદ કરો · Choose a cause
            </h2>
            {campaigns.length > 0 ? (
              <div className="mt-4 space-y-3">
                {campaigns.map((c) => (
                  <label
                    key={c.slug}
                    className={`flex cursor-pointer items-start gap-3 rounded-temple border p-4 transition ${
                      campaignSlug === c.slug
                        ? "border-temple-red bg-temple-red/5"
                        : "border-border hover:border-temple-gold"
                    }`}
                  >
                    <input
                      type="radio"
                      name="campaign"
                      className="mt-1"
                      checked={campaignSlug === c.slug}
                      onChange={() => setCampaignSlug(c.slug)}
                    />
                    <span>
                      <span className="block font-medium text-temple-maroon">
                        {c.name}
                      </span>
                      {c.desc && (
                        <span className="block text-sm text-muted-foreground">
                          {c.desc}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Donation causes will be configured by the Trust. You can still
                make a general donation.
              </p>
            )}
          </div>
        )}

        {/* Step 1: amount */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-xl text-temple-maroon">
              રકમ · Amount
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {presets.amounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`rounded-temple border px-4 py-3 font-medium transition ${
                    amount === a
                      ? "border-temple-red bg-temple-red text-temple-cream"
                      : "border-border hover:border-temple-gold"
                  }`}
                >
                  {formatINR(a)}
                </button>
              ))}
            </div>
            {presets.allowCustom && (
              <div className="mt-4">
                <label className="text-sm text-muted-foreground">
                  Custom amount (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value ? Number(e.target.value) : "")
                  }
                  className="mt-1 w-full rounded-temple border border-border px-4 py-3"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: donor details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-temple-maroon">
              વિગતો · Your details
            </h2>
            <Field label="પૂરું નામ · Full name *">
              <input
                className="input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="મોબાઈલ · Mobile *">
                <input
                  className="input"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                />
              </Field>
              <Field label={`Email ${fields.emailRequired ? "*" : ""}`}>
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
            </div>
            <Field label={`સરનામું · Address ${fields.addressRequired ? "*" : ""}`}>
              <input
                className="input"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City">
                <input
                  className="input"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </Field>
              <Field label="State">
                <input
                  className="input"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </Field>
              <Field label={`PAN ${fields.panRequired ? "*" : ""}`}>
                <input
                  className="input"
                  value={form.pan}
                  onChange={(e) => set("pan", e.target.value.toUpperCase())}
                />
              </Field>
            </div>
            {fields.allowAnonymous && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.anonymous}
                  onChange={(e) => set("anonymous", e.target.checked)}
                />
                Make this donation anonymous
              </label>
            )}
          </div>
        )}

        {/* Step 3: pay + proof */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-display text-xl text-temple-maroon">
              ચુકવણી · Payment
            </h2>
            <div className="rounded-temple bg-temple-cream p-4 text-center">
              {qr ? (
                <>
                  <Image
                    src={qr.image}
                    alt="Donation QR"
                    width={220}
                    height={220}
                    className="mx-auto rounded-lg border border-temple-gold/40 bg-white p-2"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Scan the QR using your preferred UPI application.
                  </p>
                  {qr.upiId && (
                    <p className="mt-1 font-mono text-sm text-temple-maroon">
                      {qr.upiId}
                    </p>
                  )}
                  {qr.accountLabel && (
                    <p className="text-xs text-muted-foreground">
                      {qr.accountLabel}
                    </p>
                  )}
                  <p className="mt-2 font-semibold text-temple-red">
                    {typeof amount === "number" ? formatINR(amount) : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Payment QR will be configured by the Trust.
                </p>
              )}
            </div>

            <p className="text-sm font-medium text-temple-maroon">
              After paying, enter your payment details:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Transaction Ref / UTR *">
                <input
                  className="input"
                  value={form.transactionReference}
                  onChange={(e) => set("transactionReference", e.target.value)}
                />
              </Field>
              <Field label="Payment date *">
                <input
                  type="date"
                  className="input"
                  value={form.paymentDate}
                  onChange={(e) => set("paymentDate", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Upload payment screenshot / receipt * (JPEG, PNG, WEBP, PDF)">
              <label className="flex cursor-pointer items-center gap-2 rounded-temple border border-dashed border-temple-gold/60 px-4 py-3 text-sm text-muted-foreground hover:bg-temple-gold/5">
                <Upload className="h-4 w-4" />
                {proof ? proof.name : "Choose file"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                />
              </label>
            </Field>
            <p className="rounded bg-amber-50 p-3 text-xs text-amber-800">
              A payment screenshot is not automatic proof of payment. The Trust
              will verify your transaction against official bank/UPI records
              before generating a receipt.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 0 || submitting}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="btn-outline disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={submit}
              className="btn-gold disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit donation details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
