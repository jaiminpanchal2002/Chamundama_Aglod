import type { Metadata } from "next";
import { PolicyPage } from "@/components/site/PolicyPage";

export const metadata: Metadata = { title: "Donation Policy" };

export default function Page() {
  return (
    <PolicyPage
      slug="donation-policy"
      title="Donation Policy"
      fallback={`How donations work at Shree Chamunda Dham Aglod:

• Donations are made by scanning the official payment QR shown on the donate page.
• After paying, you submit your transaction reference and a payment proof.
• A payment screenshot is NOT automatic proof of payment. The Trust verifies every transaction against official bank/UPI records before it is approved.
• A receipt is generated only after the donation is approved. You can verify any receipt using the link/QR printed on it.
• Uploaded payment proofs are kept private and are visible only to authorized Trust administrators.
• No tax-exemption (80G) benefit is claimed unless the Trust has a valid applicable registration and has explicitly enabled it.

This is a placeholder. The final donation policy will be provided by Shree Chamunda Dham Aglod Trust.`}
    />
  );
}
