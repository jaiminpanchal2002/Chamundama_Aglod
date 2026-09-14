"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

export function Navbar({
  locale,
  items,
  donateLabel,
  brand,
}: {
  locale: Locale;
  items: NavItem[];
  donateLabel: string;
  brand: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || pathname !== "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "border-b border-temple-gold/25 bg-temple-maroon/95 backdrop-blur supports-[backdrop-filter]:bg-temple-maroon/80"
          : "bg-gradient-to-b from-black/50 to-transparent",
      )}
    >
      <nav className="container-temple flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-temple-cream">
          <span aria-hidden className="text-2xl text-temple-gold">
            ॐ
          </span>
          <span className="font-display text-base font-semibold sm:text-lg lang-gu">
            {brand}
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 lg:flex">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium text-temple-cream/90 transition hover:text-temple-gold",
                  pathname === item.href && "text-temple-gold",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher current={locale} className="text-temple-cream/90" />
          <Link href="/donate" className="btn-gold px-4 py-2 text-sm">
            <Heart className="h-4 w-4" /> {donateLabel}
          </Link>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className="rounded p-2 text-temple-cream lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-temple-gold/25 bg-temple-maroon lg:hidden"
          >
            <ul className="container-temple flex flex-col py-4">
              {items.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    className="block py-3 text-temple-cream/90 transition active:translate-x-1 active:text-temple-gold"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + items.length * 0.05 }}
                className="mt-3 flex items-center justify-between"
              >
                <LanguageSwitcher
                  current={locale}
                  className="text-temple-cream/90"
                />
                <Link href="/donate" className="btn-gold px-4 py-2 text-sm">
                  <Heart className="h-4 w-4" /> {donateLabel}
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
