import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuminoCut — Removedor de Fundo Perfeito com IA",
  description: "Remoção de fundo de imagens com qualidade de estúdio, preservação de capuzes, roupas claras e detalhes finos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#F8F9FB] text-slate-900 antialiased selection:bg-[#ff3b30] selection:text-white">
        {children}
      </body>
    </html>
  );
}
