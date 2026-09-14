import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonForm } from "@/components/site/JsonForm";

export const metadata: Metadata = {
  title: "સંપર્ક · Contact",
  description: "Contact Shree Chamunda Dham Aglod Trust.",
};

export default function ContactPage() {
  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading eyebrow="✦" title="સંપર્ક · Contact" />
      <div className="mx-auto max-w-2xl">
        <JsonForm
          endpoint="/api/contact"
          submitLabel="Send message"
          successTitle="આભાર — સંદેશ મળ્યો"
          successBody="Your message has been received. The Trust will get back to you."
          fields={[
            { name: "name", label: "નામ · Name", required: true, half: true },
            { name: "mobile", label: "મોબાઈલ · Mobile", required: true, half: true },
            { name: "email", label: "Email", type: "email", half: true },
            {
              name: "category",
              label: "Category",
              options: ["General", "Event", "Donation", "Temple", "Trust", "Other"],
              half: true,
            },
            { name: "subject", label: "Subject" },
            { name: "message", label: "સંદેશ · Message", required: true, textarea: true },
          ]}
        />
      </div>
    </Section>
  );
}
