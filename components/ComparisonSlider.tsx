"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";

interface ComparisonSliderProps {
  originalUrl: string;
  processedUrl: string;
  backdropStyle?: React.CSSProperties;
  backdropClass?: string;
  customBgUrl?: string | null;
  blurIntensity?: number;
}

export function ComparisonSlider({
  originalUrl,
  processedUrl,
  backdropStyle = {},
  backdropClass = "bg-transparency-grid-dark",
  customBgUrl = null,
  blurIntensity = 0,
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // Porcentagem de 0 a 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] max-h-[640px] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-800 shadow-2xl bg-[#0b0f19]"
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Lado Direito: Imagem Recortada com o Fundo Escolhido */}
      <div
        className={`absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden ${backdropClass}`}
        style={backdropStyle}
      >
        {/* Caso tenha fundo customizado */}
        {customBgUrl && (
          <img
            src={customBgUrl}
            alt="Cenário Personalizado"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Caso tenha desfoque bokeh do fundo original */}
        {blurIntensity > 0 && !customBgUrl && (
          <img
            src={originalUrl}
            alt="Fundo Desfocado"
            className="absolute inset-0 w-full h-full object-contain filter"
            style={{ filter: `blur(${blurIntensity}px) brightness(0.9)` }}
          />
        )}

        {/* Sujeito Recortado */}
        <img
          src={processedUrl}
          alt="Recorte IA"
          className="relative z-10 w-full h-full object-contain pointer-events-none drop-shadow-xl"
        />

        {/* Badge Depois */}
        <span className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-950 text-white shadow-sm flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
          <span>Recorte IA</span>
        </span>
      </div>

      {/* Lado Esquerdo: Imagem Original (com clip-path dinâmico) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      >
        <div className="absolute inset-0 w-full h-full bg-slate-50 flex items-center justify-center">
          <img
            src={originalUrl}
            alt="Imagem Original"
            className="w-full h-full object-contain"
          />
          {/* Badge Antes */}
          <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm border border-slate-200">
            Original
          </span>
        </div>
      </div>

      {/* Linha Divisória e Alça de Arrasto */}
      <div
        className="absolute top-0 bottom-0 z-30 w-px bg-slate-950/40 shadow-sm pointer-events-none flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="h-10 w-10 -ml-[19px] rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center cursor-ew-resize border border-slate-200 hover:scale-110 active:scale-95 transition-transform duration-100 group">
          <MoveHorizontal className="h-4 w-4 text-slate-800 group-hover:text-[#ff3b30] transition-colors" />
        </div>
      </div>
    </div>
  );
}
