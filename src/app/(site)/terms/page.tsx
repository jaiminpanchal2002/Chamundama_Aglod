import type { Metadata } from "next";
import { PolicyPage } from "@/components/site/PolicyPage";

export const metadata: Metadata = { title: "Terms" };

export default function Page() {
  return (
    <PolicyPage
      slug="terms"
      title="Terms of Use"
      fallback={`By using this website you agree to use it respectfully and lawfully.

• Content on this website is for information about Shree Chamunda Dham Aglod and its activities.
• Donation submissions are subject to verification by the Trust before any receipt is issued.
• The Trust may update timings, events and information at any time.

This is a placeholder. The final terms will be provided by Shree Chamunda Dham Aglod Trust.`}
    />
  );
}
