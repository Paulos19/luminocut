"use client";

import React from "react";
import { Sparkles, Cpu, Zap } from "lucide-react";

interface NavbarProps {
  backendOnline: boolean;
  selectedModel: string;
}

export function Navbar({ backendOnline, selectedModel }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#090d16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                LuminoCut
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO IA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Removedor de Fundo Perfeito & Estúdio
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Backend Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <span
              className={`h-2 w-2 rounded-full animate-pulse ${
                backendOnline ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
              }`}
            />
            <span className="text-slate-300 font-medium">
              Backend Python:{" "}
              <strong className={backendOnline ? "text-emerald-400" : "text-amber-400"}>
                {backendOnline ? "Online (FastAPI)" : "Conectando..."}
              </strong>
            </span>
          </div>

          {/* Model Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Modelo:</span>
            <span className="font-semibold text-indigo-300 uppercase">{selectedModel}</span>
          </div>

          {/* Zero Cost Guarantee */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <Zap className="h-3.5 w-3.5" />
            <span>100% Gratuito</span>
          </div>
        </div>
      </div>
    </header>
  );
}
