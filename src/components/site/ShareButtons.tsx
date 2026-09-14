"use client";

import { useState } from "react";
import { Facebook, MessageCircle, Link2, Check } from "lucide-react";

/** Share buttons (spec §58): WhatsApp, Facebook, Copy Link. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="rounded-full border border-temple-gold/40 p-2 text-temple-maroon hover:bg-temple-gold/10"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <a
        href={fb}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="rounded-full border border-temple-gold/40 p-2 text-temple-maroon hover:bg-temple-gold/10"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <button
        type="button"
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* ignore */
          }
        }}
        className="rounded-full border border-temple-gold/40 p-2 text-temple-maroon hover:bg-temple-gold/10"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
