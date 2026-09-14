import Link from "next/link";
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from "lucide-react";
import type { NavItem } from "./Navbar";

export interface FooterSocial {
  platform: string;
  url: string;
}

const iconFor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return Instagram;
    case "facebook":
      return Facebook;
    case "youtube":
      return Youtube;
    default:
      return MapPin;
  }
};

export function Footer({
  brand,
  address,
  phone,
  email,
  quickLinks,
  social,
  rightsText,
}: {
  brand: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  quickLinks: NavItem[];
  social: FooterSocial[];
  rightsText: string;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-temple-burgundy text-temple-cream">
      <div className="gold-divider" />
      <div className="container-temple grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-2xl text-temple-gold">
              ॐ
            </span>
            <span className="font-display text-lg font-semibold lang-gu">
              {brand}
            </span>
          </div>
          <p className="mt-4 text-sm text-temple-cream/70 lang-gu">
            આગલોડ, વિજાપુર, ગુજરાત
          </p>
          <p className="mt-1 text-xs text-temple-cream/50">
            Aglod, Vijapur, Gujarat, India
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-temple-gold">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-temple-cream/80 hover:text-temple-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-temple-gold">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-temple-cream/80">
            {address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-temple-gold" />
                <span>{address}</span>
              </li>
            )}
            {phone && (
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 text-temple-gold" />
                <a href={`tel:${phone}`} className="hover:text-temple-gold">
                  {phone}
                </a>
              </li>
            )}
            {email && (
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0 text-temple-gold" />
                <a href={`mailto:${email}`} className="hover:text-temple-gold">
                  {email}
                </a>
              </li>
            )}
            {!address && !phone && !email && (
              <li className="text-temple-cream/50">
                Contact details to be provided by the Trust.
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-temple-gold">
            Follow
          </h3>
          <div className="mt-4 flex gap-3">
            {social.map((s) => {
              const Icon = iconFor(s.platform);
              return (
                <a
                  key={s.platform + s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="rounded-full border border-temple-gold/40 p-2 text-temple-cream transition hover:bg-temple-gold/15"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-2 text-xs text-temple-cream/60">
            <Link href="/privacy-policy" className="hover:text-temple-gold">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-temple-gold">
              Terms
            </Link>
            <Link href="/donation-policy" className="hover:text-temple-gold">
              Donation Policy
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-temple-gold/15 py-5 text-center text-xs text-temple-cream/50">
        © {year} {brand}. {rightsText}.
        <span className="mx-2 opacity-40">•</span>
        <span className="lang-gu">|| જય મા ચામુંડા ||</span>
      </div>
    </footer>
  );
}
