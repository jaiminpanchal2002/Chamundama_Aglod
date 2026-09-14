import { z } from "zod";

/** Donor + donation submission payload (spec §15). */
export const donationSubmissionSchema = z.object({
  campaignSlug: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero").max(10_000_000),
  purpose: z.string().max(200).optional(),

  name: z.string().min(2, "Please enter your full name").max(120),
  mobile: z
    .string()
    .min(7, "Please enter a valid mobile number")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Invalid mobile number"),
  email: z.string().email().max(160).optional().or(z.literal("")),
  address: z.string().max(300).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  country: z.string().max(80).optional(),
  pan: z.string().max(20).optional(),
  anonymous: z.coerce.boolean().optional(),

  paymentMethod: z.string().max(30).optional(),
  transactionReference: z
    .string()
    .min(4, "Please enter the transaction reference / UTR")
    .max(60),
  paymentDate: z.string().min(1, "Please enter the payment date"),
  paidAmount: z.coerce.number().positive().max(10_000_000),
});

export type DonationSubmission = z.infer<typeof donationSubmissionSchema>;

/** Admin status-change payload (spec §16). */
export const donationActionSchema = z.object({
  donationId: z.string().uuid(),
  action: z.enum(["verify", "approve", "reject", "clarify"]),
  reason: z.string().max(500).optional(),
});
