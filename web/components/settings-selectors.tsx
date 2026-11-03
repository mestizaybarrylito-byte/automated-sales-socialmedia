"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  parseSettings,
  type Locale,
} from "@/lib/settings";
import { readCookie, writeCookie } from "@/lib/cookies";
import { strings } from "@/lib/i18n";
import { CountryPicker } from "@/components/country-picker";

/**
 * Country + language pickers shown in the header on every page.
 * Rendered from defaults on the server, then synced with cookies on mount
 * (no hydration mismatch: first client render matches SSR), and every change
 * persists to cookies + refreshes server-rendered content.
 */
export function SettingsSelectors() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(parseSettings({ locale: readCookie(LOCALE_COOKIE) }).locale);
  }, []);

  function updateLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    writeCookie(LOCALE_COOKIE, nextLocale);
    router.refresh();
  }

  const t = strings[locale].header;

  return (
    <div className="flex items-center gap-3">
      <CountryPicker locale={locale} label={t.country} />
      <label className="flex items-center gap-2 font-sans text-xs text-cream/60">
        {t.language}
        <select
          aria-label={t.language}
          className="bg-charcoal-800 text-cream text-sm rounded border border-cream/20 px-2 py-1 max-w-[9rem]"
          value={locale}
          onChange={(e) => updateLocale(e.target.value as Locale)}
        >
          {LOCALES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
