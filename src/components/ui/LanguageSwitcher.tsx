"use client";

import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  current,
  className,
}: {
  current: Locale;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={cn("inline-flex items-center gap-1 text-sm", className)}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="mx-1 opacity-40">|</span>}
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => setLocale(l))}
            aria-current={current === l ? "true" : undefined}
            className={cn(
              "rounded px-1 transition hover:text-temple-gold",
              current === l
                ? "font-semibold text-temple-gold"
                : "opacity-80",
            )}
          >
            {LOCALE_LABELS[l]}
          </button>
        </span>
      ))}
    </div>
  );
}
