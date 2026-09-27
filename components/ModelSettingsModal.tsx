"use client";

import React from "react";
import { X, Cpu, Sliders, Check, Sparkles } from "lucide-react";

export interface ModelConfig {
  model: string;
  alphaMatting: boolean;
  afThreshold: number;
  abThreshold: number;
  aErode: number;
}

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  onChangeConfig: (newConfig: ModelConfig) => void;
}

export const AVAILABLE_MODELS = [
  {
    id: "isnet-anime",
    name: "ISNet Anime & Ilustrações",
    badge: "Preserva Capuzes & Traços 2D",
    desc: "Treinado especialmente para artes conceituais, animes, games e personagens. Não apaga capuzes, mantos, roupas claras e preserva os traços originais.",
    recommendedFor: "anime",
  },
  {
    id: "u2net_human_seg",
    name: "U2Net Human Seg (Fotos Reais & Retratos)",
    badge: "Fios Finos & Retratos Reais",
    desc: "Modelo especialista em retratos humanos, fotos reais e pessoas. Preserva cabelos soltos, roupas e bordas complexas com extrema estabilidade.",
    recommendedFor: "photo",
  },
  {
    id: "isnet-general-use",
    name: "ISNet Geral",
    badge: "E-Commerce & Produtos",
    desc: "Segmentação com foco em detalhes estruturais, relógios, cosméticos e produtos para catálogo.",
    recommendedFor: "product",
  },
  {
    id: "u2net",
    name: "U2Net Clássico",
    badge: "Fotografia Padrão",
    desc: "Modelo consagrado de segmentação saliente. Rápido, porém pode confundir roupas brancas ou ilustrações com fundo.",
    recommendedFor: "general",
  },
  {
    id: "silueta",
    name: "Silueta",
    badge: "Ultra Leve",
    desc: "Modelo ultraleve e compacto com inferência instantânea, ideal para testes rápidos.",
    recommendedFor: "fast",
  },
];

export function ModelSettingsModal({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}: ModelSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-950">Motores Neurais de Recorte</h3>
              <p className="text-xs text-slate-500">Escolha o modelo ideal para o tipo da sua imagem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de Modelos */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Modelo Selecionado
            </label>
            <span className="text-[11px] text-[#ff3b30] flex items-center gap-1 font-semibold">
              <Sparkles className="h-3 w-3" />
              Use ISNet Anime para capuzes e desenhos
            </span>
          </div>
          <div className="space-y-2.5">
            {AVAILABLE_MODELS.map((item) => (
              <div
                key={item.id}
                onClick={() => onChangeConfig({ ...config, model: item.id })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  config.model === item.id
                    ? "border-slate-950 bg-slate-50/80 shadow-sm ring-1 ring-slate-950"
                    : "border-slate-200/90 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-950">{item.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.id === "isnet-anime"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : item.id === "u2net_human_seg"
                          ? "bg-slate-100 text-slate-800 border-slate-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  {config.model === item.id && (
                    <div className="h-5 w-5 rounded-full bg-slate-950 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alpha Matting Switch */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-slate-700" />
              <div>
                <span className="text-xs font-bold text-slate-900">
                  Refinamento Alpha Matting
                </span>
                <p className="text-[11px] text-slate-500">
                  Calcula transparências intermediárias em bordas complexas
                </p>
              </div>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, alphaMatting: !config.alphaMatting })}
              className={`w-11 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                config.alphaMatting ? "bg-slate-950" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  config.alphaMatting ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {config.alphaMatting && (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Erosão de borda (Erode Size)</span>
                <span className="font-mono text-slate-950 font-bold">{config.aErode}px</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                value={config.aErode}
                onChange={(e) =>
                  onChangeConfig({ ...config, aErode: Number(e.target.value) })
                }
                className="w-full accent-slate-950 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            Aplicar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
