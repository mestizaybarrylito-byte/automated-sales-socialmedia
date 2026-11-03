import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CampaignWizard } from "@/components/owner/campaign-wizard";
import { getNetwork, getTrend } from "@/lib/trends";
import { fetchLiveTrends } from "@/lib/trends-live";
import { COUNTRY_COOKIE, LOCALE_COOKIE, parseSettings } from "@/lib/settings";
import { strings } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function getSettings() {
  const jar = cookies();
  return parseSettings({
    country: jar.get(COUNTRY_COOKIE)?.value,
    locale: jar.get(LOCALE_COOKIE)?.value,
  });
}

export async function generateMetadata({
  params,
}: {
  params: { network: string; trendId: string };
}) {
  const { country, locale } = getSettings();
  const t = strings[locale].campaign;
  const network = getNetwork(params.network);
  try {
    const { trends } = await fetchLiveTrends(country, locale);
    const trend = getTrend(trends, params.network, params.trendId);
    return {
      title: trend
        ? `${t.metaPrefix} ${trend.title} — ${network?.label ?? params.network}`
        : t.metaNotFound,
    };
  } catch {
    return { title: t.metaUnavailable };
  }
}

export default async function CampaignPage({
  params,
}: {
  params: { network: string; trendId: string };
}) {
  const network = getNetwork(params.network);
  if (!network) notFound();
  const { country, locale } = getSettings();
  const t = strings[locale].campaign;

  let trends;
  try {
    ({ trends } = await fetchLiveTrends(country, locale));
  } catch (err) {
    const detail = err instanceof Error ? err.message : null;
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="font-sans text-sm">
          <Link href="/owner/trends" className="text-rust-700 underline underline-offset-4">
            {t.back}
          </Link>
        </p>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl">{t.errorTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-charcoal-800/70 text-sm">{t.errorBody}</p>
            {process.env.NODE_ENV !== "production" && detail && (
              <p className="mt-3 font-mono text-xs text-charcoal-800/70 break-words">
                {detail}
              </p>
            )}
            <a
              href="/owner/trends"
              className="mt-4 inline-flex items-center justify-center rounded-md font-sans font-medium h-10 px-5 text-sm bg-rust-700 text-cream hover:bg-rust-600"
            >
              {t.errorCta}
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trend = getTrend(trends, params.network, params.trendId);
  if (!trend) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="font-sans text-sm">
        <Link href="/owner/trends" className="text-rust-700 underline underline-offset-4">
          {t.back}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Badge className={network.badgeClass}>{network.label}</Badge>
        {trend.category && <Badge variant="secondary">{trend.category}</Badge>}
        <span className="font-sans text-sm text-charcoal-800/60">
          {trend.volume}
          {trend.growth ? ` · ${trend.growth}` : ""}
        </span>
      </div>
      <h1 className="text-3xl mt-3">{trend.title}</h1>
      <p className="font-sans text-rust-700 font-medium mt-1">{trend.hashtag}</p>
      <p className="text-charcoal-800/70 mt-2 max-w-2xl">{trend.summary}</p>

      <div className="mt-10">
        <CampaignWizard trend={trend} network={network} locale={locale} />
      </div>
    </div>
  );
}
