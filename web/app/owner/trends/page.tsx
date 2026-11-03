import Link from "next/link";
import { cookies } from "next/headers";
import { NETWORKS, getTrendsByNetwork } from "@/lib/trends";
import { fetchLiveTrends } from "@/lib/trends-live";
import {
  COUNTRY_COOKIE,
  LOCALE_COOKIE,
  countryName,
  parseSettings,
} from "@/lib/settings";
import { strings } from "@/lib/i18n";
import { TrendCard } from "@/components/owner/trend-card";
import { NetworkLogo } from "@/components/owner/network-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Trends are fetched live on every visit window — never prerendered stale. */
export const dynamic = "force-dynamic";

function getSettings() {
  const jar = cookies();
  return parseSettings({
    country: jar.get(COUNTRY_COOKIE)?.value,
    locale: jar.get(LOCALE_COOKIE)?.value,
  });
}

export function generateMetadata() {
  const t = strings[getSettings().locale].trendsList;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function TrendsPage() {
  const { country, locale } = getSettings();
  const t = strings[locale].trendsList;

  let trends;
  let sources: string[];
  try {
    ({ trends, sources } = await fetchLiveTrends(country, locale));
  } catch (err) {
    const detail = err instanceof Error ? err.message : null;
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="font-sans text-sm">
          <Link href="/owner" className="text-rust-700 underline underline-offset-4">
            {t.back}
          </Link>
        </p>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl">{t.errorTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-charcoal-800/70 text-sm">{t.errorBody}</p>
            <p className="mt-3 font-sans text-sm text-charcoal-800/70">
              {t.errorLogHint} <code className="font-mono text-xs">[trends-live]</code>
            </p>
            {process.env.NODE_ENV !== "production" && detail && (
              <p className="mt-3 font-mono text-xs text-charcoal-800/70 break-words">
                {t.detailPrefix} {detail}
              </p>
            )}
            <a
              href="/owner/trends"
              className="mt-4 inline-flex items-center justify-center rounded-md font-sans font-medium h-10 px-5 text-sm bg-rust-700 text-cream hover:bg-rust-600"
            >
              {t.retry}
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="font-sans text-sm">
        <Link href="/owner" className="text-rust-700 underline underline-offset-4">
          {t.back}
        </Link>
      </p>
      <p className="font-sans text-sm text-rust-700 font-medium mt-4">{t.kicker}</p>
      <h1 className="text-3xl mt-1">
        {t.title} · {countryName(country, locale)}
      </h1>
      <p className="text-charcoal-800/70 mt-2 max-w-2xl">{t.description}</p>
      <p className="font-sans text-xs text-charcoal-800/60 mt-2">
        {t.sourceNote.replace("{sources}", sources.join(" · "))}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {NETWORKS.map((network) => {
          const items = getTrendsByNetwork(trends, network.id);
          return (
            <section key={network.id} aria-label={`${t.trendsOf} ${network.label}`}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <h2 className="text-2xl flex items-center gap-2.5">
                  <NetworkLogo network={network.id} size={26} />
                  {network.label}
                </h2>
                <Badge className={network.badgeClass}>{network.canvas.label}</Badge>
              </div>
              <p className="font-sans text-sm text-charcoal-800/60 mb-5">
                {strings[locale].networkTagline[network.id]}
              </p>
              <div className="grid gap-4">
                {items.map((trend) => (
                  <TrendCard key={trend.id} trend={trend} locale={locale} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
