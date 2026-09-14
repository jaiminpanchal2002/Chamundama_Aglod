import type { Metadata } from "next";
import { PolicyPage } from "@/components/site/PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <PolicyPage
      slug="privacy-policy"
      title="Privacy Policy"
      fallback={`We respect the privacy of every devotee.

• Personal data you provide (name, contact details, donation information) is used only to process your request and by the Trust for its records.
• Uploaded payment proofs are stored privately and are accessible only to authorized Trust administrators for verification. They are never displayed publicly.
• Contact and volunteer form submissions are stored securely and used only to respond to you.
• We use privacy-conscious analytics and do not sell your data.

This is a placeholder policy. The final privacy policy will be provided by Shree Chamunda Dham Aglod Trust.`}
    />
  );
}
