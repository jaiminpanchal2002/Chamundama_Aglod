"use client";

import { MessageCircle } from "lucide-react";

/** Floating WhatsApp button (spec §51). Only rendered when admin enables it. */
export function WhatsAppButton({
  number,
  message,
}: {
  number: string;
  message?: string;
}) {
  const clean = number.replace(/[^0-9]/g, "");
  const href = `https://wa.me/${clean}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
