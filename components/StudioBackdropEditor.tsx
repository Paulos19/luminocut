"use client";

import React, { useRef } from "react";
import { 
  Layers, 
  Palette, 
  Sparkles, 
  Image as ImageIcon, 
  UploadCloud, 
  Sliders, 
  Trash2 
} from "lucide-react";

export interface BackdropConfig {
  type: "transparent" | "color" | "gradient" | "blur" | "image";
  value: string;
  cssStyle?: React.CSSProperties;
  cssClass?: string;
}

interface StudioBackdropEditorProps {
  currentBackdrop: BackdropConfig;
  onSelectBackdrop: (config: BackdropConfig) => void;
  blurIntensity: number;
  setBlurIntensity: (val: number) => void;
  customBgUrl: string | null;
  setCustomBgUrl: (url: string | null) => void;
}

const PRESET_COLORS = [
  { name: "Branco Neve", hex: "#ffffff", border: "border-slate-300" },
  { name: "Cinza Estúdio", hex: "#e2e8f0", border: "border-slate-400" },
  { name: "Preto Ônix", hex: "#0b0f19", border: "border-slate-700" },
  { name: "Bege Minimalista", hex: "#f5ebe0", border: "border-stone-300" },
  { name: "Azul Executivo", hex: "#1e3a8a", border: "border-blue-900" },
  { name: "Verde Esmeralda", hex: "#065f46", border: "border-emerald-800" },
  { name: "Terracota Quente", hex: "#9a3412", border: "border-amber-900" },
  { name: "Roxo Real", hex: "#581c87", border: "border-purple-900" },
];

const PRESET_GRADIENTS = [
  {
    name: "Cyberpunk Glow",
    style: { background: "linear-gradient(135deg, #0f172a 0%, #312e81 50%, #4c1d95 100%)" },
  },
  {
    name: "Sunset Studio",
    style: { background: "linear-gradient(135deg, #fb923c 0%, #f43f5e 50%, #881337 100%)" },
  },
  {
    name: "Aurora Borealis",
    style: { background: "linear-gradient(135deg, #042f2e 0%, #065f46 50%, #1e1b4b 100%)" },
  },
  {
    name: "Titanium Metal",
    style: { background: "linear-gradient(135deg, #1e293b 0%, #475569 50%, #0f172a 100%)" },
  },
  {
    name: "Golden Hour",
    style: { background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #78350f 100%)" },
  },
  {
    name: "Rose Glamour",
    style: { background: "linear-gradient(135deg, #fbcfe8 0%, #f472b6 50%, #831843 100%)" },
  },
];

export function StudioBackdropEditor({
  currentBackdrop,
  onSelectBackdrop,
  blurIntensity,
  setBlurIntensity,
  customBgUrl,
  setCustomBgUrl,
}: StudioBackdropEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBgUrl(url);
      onSelectBackdrop({
        type: "image",
        value: url,
      });
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-5 text-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#ff3b30]" />
          <h3 className="font-bold text-sm text-slate-950">Cenário & Fundo</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Personalize o resultado</span>
      </div>

      {/* Tabs Principais Responsivas em Grade de Ícones (Layout Apple/Figma) */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90">
        <button
          onClick={() =>
            onSelectBackdrop({
              type: "transparent",
              value: "light",
              cssClass: "bg-transparency-grid-light",
            })
          }
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentBackdrop.type === "transparent"
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
          }`}
          title="Fundo transparente"
        >
          <Layers className="h-4 w-4 mb-1" />
          <span className="truncate w-full text-center">Fundo</span>
        </button>

        <button
          onClick={() =>
            onSelectBackdrop({
              type: "color",
              value: "#ffffff",
              cssStyle: { backgroundColor: "#ffffff" },
            })
          }
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentBackdrop.type === "color"
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
          }`}
          title="Cor sólida de estúdio"
        >
          <Palette className="h-4 w-4 mb-1" />
          <span className="truncate w-full text-center">Cores</span>
        </button>

        <button
          onClick={() =>
            onSelectBackdrop({
              type: "gradient",
              value: "cyberpunk",
              cssStyle: PRESET_GRADIENTS[0].style,
            })
          }
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentBackdrop.type === "gradient"
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
          }`}
          title="Gradientes de estúdio"
        >
          <Sparkles className="h-4 w-4 mb-1" />
          <span className="truncate w-full text-center">Gradiente</span>
        </button>

        <button
          onClick={() => {
            onSelectBackdrop({
              type: "blur",
              value: "bokeh",
            });
            if (blurIntensity === 0) setBlurIntensity(12);
          }}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentBackdrop.type === "blur"
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
          }`}
          title="Efeito Bokeh / Desfoque"
        >
          <Sliders className="h-4 w-4 mb-1" />
          <span className="truncate w-full text-center">Desfoque</span>
        </button>

        <button
          onClick={() => {
            if (customBgUrl) {
              onSelectBackdrop({ type: "image", value: customBgUrl });
            } else {
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            currentBackdrop.type === "image"
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
          }`}
          title="Carregar imagem própria"
        >
          <ImageIcon className="h-4 w-4 mb-1" />
          <span className="truncate w-full text-center">Upload</span>
        </button>
      </div>

      {/* Opções conforme a aba selecionada */}
      {currentBackdrop.type === "transparent" && (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() =>
              onSelectBackdrop({
                type: "transparent",
                value: "light",
                cssClass: "bg-transparency-grid-light",
              })
            }
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all ${
              currentBackdrop.value === "light"
                ? "border-slate-950 bg-white text-slate-950 shadow-sm ring-1 ring-slate-950"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-transparency-grid-light border border-slate-300 shrink-0 shadow-inner" />
            <div className="text-left">
              <p className="text-xs font-bold leading-tight text-slate-900">Grid Claro</p>
              <p className="text-[10px] text-slate-500 font-normal">Padrão</p>
            </div>
          </button>

          <button
            onClick={() =>
              onSelectBackdrop({
                type: "transparent",
                value: "dark",
                cssClass: "bg-transparency-grid-dark",
              })
            }
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all ${
              currentBackdrop.value === "dark"
                ? "border-slate-950 bg-white text-slate-950 shadow-sm ring-1 ring-slate-950"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
            }`}
          >
            <div className="w-5 h-5 rounded-lg bg-transparency-grid-dark border border-slate-700 shrink-0 shadow-inner" />
            <div className="text-left">
              <p className="text-xs font-bold leading-tight text-slate-900">Grid Escuro</p>
              <p className="text-[10px] text-slate-500 font-normal">Contraste</p>
            </div>
          </button>
        </div>
      )}

      {currentBackdrop.type === "color" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((col) => (
              <button
                key={col.hex}
                onClick={() =>
                  onSelectBackdrop({
                    type: "color",
                    value: col.hex,
                    cssStyle: { backgroundColor: col.hex },
                  })
                }
                title={col.name}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                  currentBackdrop.value === col.hex
                    ? "ring-2 ring-slate-950 ring-offset-2 ring-offset-white scale-110"
                    : col.border
                }`}
                style={{ backgroundColor: col.hex }}
              />
            ))}

            {/* Custom Color Input */}
            <label className="relative h-8 w-8 rounded-full border-2 border-dashed border-slate-300 hover:border-slate-900 flex items-center justify-center cursor-pointer overflow-hidden transition-colors">
              <input
                type="color"
                value={currentBackdrop.value.startsWith("#") ? currentBackdrop.value : "#ffffff"}
                onChange={(e) =>
                  onSelectBackdrop({
                    type: "color",
                    value: e.target.value,
                    cssStyle: { backgroundColor: e.target.value },
                  })
                }
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
              />
              <span className="text-[10px] font-bold text-slate-500">+</span>
            </label>
          </div>
        </div>
      )}

      {currentBackdrop.type === "gradient" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {PRESET_GRADIENTS.map((grad) => (
            <button
              key={grad.name}
              onClick={() =>
                onSelectBackdrop({
                  type: "gradient",
                  value: grad.name,
                  cssStyle: grad.style,
                })
              }
              className={`h-12 rounded-xl p-2 border flex items-end justify-start transition-all hover:scale-[1.02] cursor-pointer ${
                currentBackdrop.value === grad.name
                  ? "ring-2 ring-slate-950 ring-offset-2 ring-offset-white border-slate-900 shadow-sm"
                  : "border-slate-200/80 hover:border-slate-300"
              }`}
              style={grad.style}
            >
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                {grad.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {currentBackdrop.type === "blur" && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Intensidade do Desfoque Bokeh</span>
            <span className="font-bold text-slate-950">{blurIntensity}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            value={blurIntensity}
            onChange={(e) => setBlurIntensity(Number(e.target.value))}
            className="w-full accent-slate-950 cursor-pointer"
          />
        </div>
      )}

      {currentBackdrop.type === "image" && (
        <div className="pt-1 flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCustomImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UploadCloud className="h-4 w-4 text-slate-600" />
            <span>{customBgUrl ? "Trocar Imagem de Fundo" : "Subir Foto de Fundo"}</span>
          </button>

          {customBgUrl && (
            <button
              onClick={() => {
                setCustomBgUrl(null);
                onSelectBackdrop({
                  type: "transparent",
                  value: "light",
                  cssClass: "bg-transparency-grid-light",
                });
              }}
              title="Remover fundo personalizado"
              className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
