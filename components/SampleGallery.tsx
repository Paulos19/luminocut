"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface SampleGalleryProps {
  onSelectSample: (imagePath: string, name: string) => void;
  disabled?: boolean;
}

const SAMPLES = [
  {
    name: "Gwen Stacy (Capuz)",
    src: "/image.png",
    desc: "Ilustração 2D com capuz branco sobreposto",
    tag: "Capuz / Anime",
  },
  {
    name: "Retrato (Cabelos Finos)",
    src: "/samples/portrait.jpg",
    desc: "Cabelos cacheados e iluminação suave de estúdio",
    tag: "Foto Real",
  },
  {
    name: "Produto (Relógio)",
    src: "/samples/product.jpg",
    desc: "Fundo com reflexos, água e pedras",
    tag: "E-commerce",
  },
];

export function SampleGallery({ onSelectSample, disabled }: SampleGalleryProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3.5 sm:px-5 sm:py-3.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-[#ff3b30]" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 tracking-tight">
            Experimente em 1 clique com casos reais:
          </p>
          <p className="text-[10px] text-slate-500 hidden sm:block">
            Demonstração com bordas complexas, capuzes e cabelos finos
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full md:w-auto">
        {SAMPLES.map((sample) => (
          <button
            key={sample.name}
            disabled={disabled}
            onClick={() => onSelectSample(sample.src, sample.name)}
            className="group flex-1 sm:flex-initial flex items-center gap-2.5 p-1.5 pr-4 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-900/30 hover:shadow-md transition-all duration-200 text-left disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <div className="relative h-9 w-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-slate-200/80 group-hover:ring-slate-900/20 shadow-sm">
              <img
                src={sample.src}
                alt={sample.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-black leading-none tracking-tight">
                {sample.tag}
              </p>
              <p className="text-[10px] text-slate-500 group-hover:text-slate-700 font-medium leading-tight mt-1">
                {sample.name.split(" ")[0]}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
