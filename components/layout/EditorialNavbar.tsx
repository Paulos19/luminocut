"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpRight, Upload } from "lucide-react";

interface EditorialNavbarProps {
  onScrollToStudio?: () => void;
  onOpenUpload?: () => void;
}

export function EditorialNavbar({
  onScrollToStudio,
  onOpenUpload,
}: EditorialNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 py-3.5 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1720px] mx-auto px-6 sm:px-12 flex items-center justify-between">
        {/* Brandmark Minimalista */}
        <div
          className="flex items-center gap-1.5 cursor-pointer select-none group"
          onClick={onScrollToStudio}
        >
          <span className="font-extrabold text-2xl tracking-tighter text-slate-950 transition-colors">
            luminocut
          </span>
          <span className="h-2 w-2 rounded-full bg-[#ff3b30] shadow-[0_0_8px_rgba(255,59,48,0.5)] group-hover:scale-125 transition-transform" />
        </div>

        {/* Links de Navegação Limpos (Sem tags de backend nem barras duplas //) */}
        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600">
          <button
            onClick={onScrollToStudio}
            className="hover:text-slate-950 transition-colors cursor-pointer"
          >
            Estúdio de Recorte
          </button>
          <button
            onClick={onScrollToStudio}
            className="hover:text-slate-950 transition-colors cursor-pointer"
          >
            Exemplos Reais
          </button>
          <span className="text-slate-400">Alta Resolução Nativa</span>
        </div>

        {/* Ações e Botão Principal */}
        <div className="flex items-center gap-3">
          <button
            onClick={onScrollToStudio}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors cursor-pointer"
          >
            <span>Como Funciona</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          <button
            onClick={onOpenUpload || onScrollToStudio}
            className="group px-5 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 font-semibold text-xs tracking-tight transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-white group-hover:-translate-y-0.5 transition-transform" />
            <span>Carregar Imagem</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
