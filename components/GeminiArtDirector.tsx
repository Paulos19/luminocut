"use client";

import React from "react";
import { Sparkles, Wand2, Lightbulb, Palette, Loader2 } from "lucide-react";
import { NeuralOrbCanvas } from "./three/NeuralOrbCanvas";

interface ScenarioIdea {
  title: string;
  description: string;
  style?: string;
  color?: string;
}

export interface GeminiSuggestions {
  subject?: string;
  category?: string;
  recommended_palettes?: string[];
  ideas?: ScenarioIdea[];
  error?: string;
}

interface GeminiArtDirectorProps {
  suggestions: GeminiSuggestions | null;
  loading: boolean;
  onApplyColor: (color: string) => void;
  onApplyIdea: (idea: ScenarioIdea) => void;
  onTriggerAnalyze: () => void;
}

export function GeminiArtDirector({
  suggestions,
  loading,
  onApplyColor,
  onApplyIdea,
  onTriggerAnalyze,
}: GeminiArtDirectorProps) {
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
        <NeuralOrbCanvas size={56} glowColor="#ff3b30" />
        <div>
          <h4 className="font-bold text-slate-950 text-sm">
            Gemini analisando iluminação & sujeito...
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Calculando paletas harmônicas e cenários para estúdio
          </p>
        </div>
      </div>
    );
  }

  if (!suggestions) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            <NeuralOrbCanvas size={42} glowColor="#ff3b30" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-950 text-sm">
                Direção de Arte Gemini
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                IA 3D
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analisa a iluminação para sugerir cenários harmônicos e paletas de alta precisão.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerAnalyze}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Wand2 className="h-4 w-4 text-[#ff3b30]" />
          <span>Sugerir Cenários com IA</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
      {/* Topo do Card Gemini */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            <NeuralOrbCanvas size={30} glowColor="#ff3b30" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-950">
              Direção de Arte Gemini
            </h4>
            {suggestions.subject && (
              <p className="text-xs text-slate-500">
                Sujeito: <strong className="text-slate-900">{suggestions.subject}</strong>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onTriggerAnalyze}
          className="text-xs text-slate-600 hover:text-slate-950 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Wand2 className="h-3 w-3" />
          Reanalisar
        </button>
      </div>

      {/* Paleta Recomendada */}
      {suggestions.recommended_palettes && suggestions.recommended_palettes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <Palette className="h-3.5 w-3.5 text-[#ff3b30]" />
            <span>Paleta de Cores Harmônicas (Clique para aplicar)</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {suggestions.recommended_palettes.map((hex, idx) => (
              <button
                key={idx}
                onClick={() => onApplyColor(hex)}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-slate-400 hover:shadow-sm transition-all text-xs cursor-pointer"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0"
                  style={{ backgroundColor: hex }}
                />
                <span className="font-mono text-[11px] text-slate-700 group-hover:text-slate-950 font-medium">
                  {hex}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ideias de Cenários de Estúdio */}
      {suggestions.ideas && suggestions.ideas.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span>Cenários de Estúdio Sugeridos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestions.ideas.map((idea, idx) => (
              <div
                key={idx}
                onClick={() => onApplyIdea(idea)}
                className="p-3 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {idea.color && (
                      <span
                        className="h-3 w-3 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: idea.color }}
                      />
                    )}
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-black">
                      {idea.title}
                    </h5>
                  </div>
                  <span className="text-[10px] text-[#ff3b30] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                    Aplicar →
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {idea.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
