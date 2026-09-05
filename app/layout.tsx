import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  referrer: "no-referrer",
  title: "LotRank | Analyse intelligente des enchères automobiles",
  description: "Comparez les enchères automobiles en France, repérez les opportunités et comprenez les risques.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "LotRank",
    title: "LotRank | Analyse intelligente des enchères automobiles",
    description: "Comparez les enchères automobiles en France, repérez les opportunités et comprenez les risques.",
  },
  twitter: {
    card: "summary",
    title: "LotRank | Analyse intelligente des enchères automobiles",
    description: "Comparez les enchères automobiles en France, repérez les opportunités et comprenez les risques.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#313b40",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
