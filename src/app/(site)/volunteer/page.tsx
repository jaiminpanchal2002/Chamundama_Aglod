import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/ui/Section";
import { JsonForm } from "@/components/site/JsonForm";

export const metadata: Metadata = {
  title: "સેવક · Volunteer",
  description: "Register as a sevak / volunteer at Shree Chamunda Dham Aglod.",
};

export default function VolunteerPage() {
  return (
    <Section tone="cream" className="pt-28">
      <SectionHeading
        eyebrow="✦ સેવા"
        title="સેવક નોંધણી · Volunteer"
        subtitle="Offer your seva to Maa Chamunda's dham."
      />
      <div className="mx-auto max-w-2xl">
        <JsonForm
          endpoint="/api/volunteer"
          submitLabel="Register"
          successTitle="જય માતાજી — નોંધણી થઈ"
          successBody="Your registration has been received. The Trust will contact you."
          fields={[
            { name: "name", label: "નામ · Name", required: true, half: true },
            { name: "age", label: "Age", type: "number", half: true },
            { name: "mobile", label: "મોબાઈલ · Mobile", required: true, half: true },
            { name: "email", label: "Email", type: "email", half: true },
            { name: "city", label: "City", half: true },
            { name: "availableDates", label: "Available dates", half: true },
            { name: "areaOfInterest", label: "Area of interest" },
            { name: "message", label: "Message", textarea: true },
          ]}
        />
      </div>
    </Section>
  );
}
