"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  COUNTRIES,
  COUNTRY_COOKIE,
  parseSettings,
  type Locale,
} from "@/lib/settings";
import { readCookie, writeCookie } from "@/lib/cookies";

/**
 * Renders a real flag image; the emoji flag stays behind it as an offline
 * fallback (revealed automatically if the image fails to load).
 */
export function FlagIcon({ code, flag, size = 20 }: { code: string; flag: string; size?: number }) {
  const height = Math.round(size * 0.75);
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[2px]"
      style={{ width: size, height }}
    >
      <span className="text-xs leading-none">{flag}</span>
      <img
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        alt=""
        width={size}
        height={height}
        loading="lazy"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </span>
  );
}

/**
 * Country picker with flag icons, shown in the header on every page.
 * A custom dropdown (native <select> cannot render images).
 */
export function CountryPicker({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [country, setCountry] = useState("MX");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const saved = parseSettings({ country: readCookie(COUNTRY_COOKIE) });
    setCountry(saved.country);
    setActive(Math.max(0, COUNTRIES.findIndex((c) => c.code === saved.country)));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  function select(code: string) {
    setCountry(code);
    setActive(Math.max(0, COUNTRIES.findIndex((c) => c.code === code)));
    writeCookie(COUNTRY_COOKIE, code);
    setOpen(false);
    router.refresh();
  }

  function scrollActiveIntoView(index: number) {
    listRef.current
      ?.querySelector(`[data-index="${index}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(COUNTRIES.length - 1, active + 1);
      setActive(next);
      scrollActiveIntoView(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.max(0, active - 1);
      setActive(next);
      scrollActiveIntoView(next);
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(COUNTRIES[active].code);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
      scrollActiveIntoView(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(COUNTRIES.length - 1);
      scrollActiveIntoView(COUNTRIES.length - 1);
    }
  }

  const current = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-2">
        <span className="font-sans text-xs text-cream/60">{label}</span>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${label}: ${current.name[locale]}`}
          title={current.name[locale]}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className="flex items-center gap-1.5 bg-charcoal-800 text-cream text-sm rounded border border-cream/20 px-2 py-1 hover:border-cream/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-600"
        >
          <FlagIcon code={current.code} flag={current.flag} />
          <span aria-hidden="true" className="text-cream/50 text-xs">
            ▾
          </span>
        </button>
      </div>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          tabIndex={0}
          onKeyDown={onListKeyDown}
          className="absolute right-0 top-full z-50 mt-2 w-72 max-h-80 overflow-y-auto rounded-md border border-cream/20 bg-charcoal-800 py-1 shadow-xl"
        >
          {COUNTRIES.map((c, i) => {
            const selected = c.code === country;
            return (
              <li key={c.code} role="option" aria-selected={selected} data-index={i}>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => select(c.code)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm ${
                    i === active ? "bg-cream/10 text-cream" : "text-cream/85"
                  } ${selected ? "font-semibold text-cream" : ""}`}
                >
                  <FlagIcon code={c.code} flag={c.flag} />
                  <span className="flex-1 truncate">{c.name[locale]}</span>
                  {selected && (
                    <span aria-hidden="true" className="text-rust-200">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
