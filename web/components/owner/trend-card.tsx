import Link from "next/link";
import { getNetwork, type Trend } from "@/lib/trends";
import type { Locale } from "@/lib/settings";
import { strings } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NetworkLogo } from "@/components/owner/network-logo";
import { Badge } from "@/components/ui/badge";

export function TrendCard({ trend, locale }: { trend: Trend; locale: Locale }) {
  const href = `/owner/trends/${trend.network}/${trend.id}`;
  const network = getNetwork(trend.network);
  const t = strings[locale].card;

  return (
    <Link href={href} className="block group">
      <Card className="h-full transition-colors group-hover:border-rust-600/50 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-rust-600">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans text-xs font-semibold text-rust-700">
              {t.rankLabel.replace("{rank}", String(trend.rank))}
            </span>
            <span className="flex items-center gap-2">
              {network && (
                <Badge className={`${network.badgeClass} gap-1.5`}>
                  <NetworkLogo network={network.id} size={14} />
                  {network.label}
                </Badge>
              )}
              {trend.category && <Badge variant="secondary">{trend.category}</Badge>}
            </span>
          </div>
          <CardTitle className="text-lg leading-snug mt-2">{trend.title}</CardTitle>
          <p className="font-sans text-sm font-medium text-rust-700">{trend.hashtag}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-charcoal-800/80">{trend.summary}</p>
          <div className="mt-3 flex items-center gap-3 font-sans text-xs text-charcoal-800/60">
            <span>{trend.volume}</span>
            {trend.growth && <span className="font-semibold text-ember">{trend.growth}</span>}
          </div>
          <span className="mt-4 inline-flex font-sans text-sm font-medium text-rust-700 underline underline-offset-4">
            {t.cta}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
