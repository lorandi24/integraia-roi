import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Calculadora de ROI de IA – IntegraIA by EMET",
  description:
    "Calcula en 2 minutos cuánto tiempo y dinero puede ahorrar tu pyme con inteligencia artificial, y en cuántos meses recuperas la inversión.",
  openGraph: {
    title: "Calculadora de ROI de IA – IntegraIA by EMET",
    description: "¿Cuánto ahorra tu pyme con IA? Descúbrelo en 2 minutos.",
    locale: "es_MX",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
