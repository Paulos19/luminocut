"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { MoveHorizontal, ArrowDown, Sparkles, Layers } from "lucide-react";
import { FluidGlassCanvas } from "../three/FluidGlassCanvas";

interface HeroBeforeAfterProps {
  onExploreStudio: () => void;
  onUploadClick: () => void;
}

export function HeroBeforeAfter({
  onExploreStudio,
  onUploadClick,
}: HeroBeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [heroScene, setHeroScene] = useState<"veil" | "fashion">("veil");

  const containerRef = useRef<HTMLDivElement>(null);
  const sliderLineRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  // GSAP: Animação de introdução suave e varredura do slider
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headlineRef.current) {
        gsap.from(headlineRef.current.children, {
          y: 35,
          opacity: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.1,
        });
      }

      const sliderObj = { pos: 25 };
      gsap.to(sliderObj, {
        pos: 50,
        duration: 1.6,
        ease: "power3.inOut",
        delay: 0.4,
        onUpdate: () => {
          setSliderPosition(sliderObj.pos);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [heroScene]);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove]
  );

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, handleMove]);

  const originalSrc =
    heroScene === "veil"
      ? "/hero/hero_veil.jpg"
      : "/hero/hero_cinematic.jpg";

  const cutoutSrc =
    heroScene === "veil"
      ? "/hero/hero_veil_cutout.png"
      : "/hero/hero_cutout.png";

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none bg-[#F8F9FB] text-slate-900 flex items-center justify-center cursor-ew-resize"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
    >
      {/* ========================================================================= */}
      {/* CAMADA DIREITA: RECORTE TRANSPARENTE + THREE.JS FLUID GLASS (100% WIDTH)  */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#FFFFFF] via-[#F8F9FB] to-[#F1F3F7]">
        {/* Canvas Three.js com gotas líquidas refrativas sobre fundo claro */}
        <FluidGlassCanvas intensity={1.0} />

        {/* Grade de transparência sutil e elegante para o estúdio claro */}
        <div className="absolute inset-0 bg-transparency-grid-light opacity-60 pointer-events-none" />

        {/* Sujeito Recortado preenchendo 100% da tela exatamente alinhado */}
        <img
          src={cutoutSrc}
          alt="Recorte em Alta Resolução"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
        />

        {/* Indicador Minimalista do Lado Recortado */}
        <div className="absolute top-24 right-8 sm:right-14 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-[11px] font-medium tracking-wide text-slate-700 shadow-sm pointer-events-none">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
          <span>Fundo Removido</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CAMADA ESQUERDA: FOTO ORIGINAL COMPLETA (100% WIDTH) COM CLIP-PATH        */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      >
        <div className="absolute inset-0 w-full h-full bg-[#F8F9FB]">
          {/* Imagem Original Completa com Fundo Claro 100% Width */}
          <img
            src={originalSrc}
            alt="Foto Original com Fundo"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Indicador Minimalista do Lado Original */}
          <div className="absolute top-24 left-8 sm:left-14 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-[11px] font-medium tracking-wide text-slate-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>Foto Original</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LINHA DIVISÓRIA INTERATIVA E ALÇA DE ARRASTO (ESTÉTICA REF. 2)            */}
      {/* ========================================================================= */}
      <div
        ref={sliderLineRef}
        className="absolute top-0 bottom-0 z-30 w-px bg-slate-950/30 pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.08)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Rótulo superior na linha vertical */}
        <div className="absolute top-6 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 text-[10px] uppercase font-mono tracking-wider text-slate-700 shadow-sm whitespace-nowrap">
          <span>{Math.round(sliderPosition)}%</span>
        </div>

        {/* Alça Circular de Arrasto */}
        <div className="absolute top-1/2 -translate-y-1/2 -ml-5 h-10 w-10 rounded-full bg-white/95 text-slate-950 shadow-xl flex items-center justify-center border border-slate-200/90 cursor-ew-resize hover:scale-110 active:scale-95 transition-transform duration-100 group">
          <MoveHorizontal className="h-4 w-4 text-slate-800 group-hover:text-[#ff3b30] transition-colors" />
        </div>

        {/* Rótulo inferior na linha vertical */}
        <div className="absolute bottom-6 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 text-[9px] uppercase font-mono tracking-widest text-slate-500 shadow-sm whitespace-nowrap">
          Arraste
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OVERLAY EDITORIAL LIMPO (SEM BARRAS // NEM LABELS DE BACKEND)             */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 sm:p-14 z-20">
        <div className="h-14" />

        {/* Título Editorial de Alto Impacto */}
        <div ref={headlineRef} className="max-w-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-[2px] bg-[#ff3b30]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Estúdio de Precisão
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-slate-950 leading-[0.94]">
            Recorte Perfeito. <br />
            <span className="text-slate-400 font-light">Zero Fundo.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-md">
            Preservação milimétrica de tecidos translúcidos, véus e cabelos finos com matting neural.
          </p>

          <div className="flex items-center gap-3 pt-2 pointer-events-auto">
            <button
              onClick={onUploadClick}
              className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs tracking-tight transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Testar Minha Imagem</span>
              <Sparkles className="h-3.5 w-3.5 text-[#ff3b30]" />
            </button>

            {/* Alternador de Amostra da Hero (Véu Translúcido vs Alta Moda) */}
            <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-full border border-slate-200/80 text-[11px] font-medium text-slate-600">
              <button
                onClick={() => setHeroScene("veil")}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  heroScene === "veil"
                    ? "bg-slate-950 text-white shadow-sm font-semibold"
                    : "hover:text-slate-950"
                }`}
              >
                Véu Translúcido
              </button>
              <button
                onClick={() => setHeroScene("fashion")}
                className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                  heroScene === "fashion"
                    ? "bg-slate-950 text-white shadow-sm font-semibold"
                    : "hover:text-slate-950"
                }`}
              >
                Alta Moda
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé Editorial Limpo */}
        <div className="flex items-end justify-between border-t border-slate-200/80 pt-4 text-xs text-slate-500">
          <div className="hidden sm:block max-w-xs text-[11px] leading-relaxed text-slate-500">
            Arraste o divisor horizontalmente para comparar a imagem original com o recorte transparente.
          </div>

          {/* Botão de Rolagem Suave para o Estúdio */}
          <div
            onClick={onExploreStudio}
            className="mx-auto flex flex-col items-center gap-1 cursor-pointer pointer-events-auto hover:text-slate-950 transition-colors group"
          >
            <span className="text-[11px] tracking-wider uppercase font-semibold text-slate-600 group-hover:text-slate-950">
              Rolar para o Estúdio
            </span>
            <ArrowDown className="h-4 w-4 text-slate-900 animate-bounce" />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Resolução 4K</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
          </div>
        </div>
      </div>
    </section>
  );
}
