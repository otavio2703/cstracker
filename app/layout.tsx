import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: {
    default: "CSTracker",
    template: "%s | CSTracker",
  },
  description:
    "Análise pessoal de partidas de CS2 e biblioteca de granadas para consulta rápida.",
  keywords: ["CS2", "Counter-Strike", "grenades", "stats", "demos", "análise"],
  robots: "noindex, nofollow", // MVP pessoal — não indexar por enquanto
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={cn(
          "min-h-screen bg-surface-900 text-gray-100 font-sans",
          "flex flex-col"
        )}
      >
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
