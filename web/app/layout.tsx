import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BrandThemeProvider } from "@/components/brand-theme-provider";

export const metadata: Metadata = {
  title: "Casa de Brasas — Carnes artesanales y salsas caseras",
  description:
    "E-commerce prototipo: cortes artesanales premium y salsas caseras. Modelo 100% digital, zero-stock cross-docking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <BrandThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </BrandThemeProvider>
      </body>
    </html>
  );
}
