"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  UploadCloud,
  Sparkles,
  Download,
  Copy,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Split,
  Eye,
  Check,
  AlertCircle,
  Clock,
  Maximize2,
  Paintbrush,
  Camera,
  Package,
} from "lucide-react";

import { EditorialNavbar } from "../components/layout/EditorialNavbar";
import { HeroBeforeAfter } from "../components/hero/HeroBeforeAfter";
import { ComparisonSlider } from "../components/ComparisonSlider";
import {
  StudioBackdropEditor,
  BackdropConfig,
} from "../components/StudioBackdropEditor";
import {
  GeminiArtDirector,
  GeminiSuggestions,
} from "../components/GeminiArtDirector";
import { SampleGallery } from "../components/SampleGallery";
import {
  ModelSettingsModal,
  ModelConfig,
} from "../components/ModelSettingsModal";
import { RefineCanvas } from "../components/RefineCanvas";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

type ViewMode = "slider" | "cutout" | "sideBySide";

export default function HomePage() {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // Estados da Imagem
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [processMetrics, setProcessMetrics] = useState<{
    execution_time_ms: number;
    width: number;
    height: number;
    model_used: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Visualização e Edição Manual
  const [viewMode, setViewMode] = useState<ViewMode>("slider");
  const [isRefining, setIsRefining] = useState<boolean>(false);

  // Cenário & Fundo (Padrão: Grade clara para o tema claro)
  const [backdrop, setBackdrop] = useState<BackdropConfig>({
    type: "transparent",
    value: "light",
    cssClass: "bg-transparency-grid-light",
  });
  const [blurIntensity, setBlurIntensity] = useState<number>(10);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  // Gemini AI Art Director
  const [geminiSuggestions, setGeminiSuggestions] = useState<GeminiSuggestions | null>(null);
  const [loadingGemini, setLoadingGemini] = useState<boolean>(false);

  // Configurações do Modelo
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    model: "isnet-anime",
    alphaMatting: false,
    afThreshold: 240,
    abThreshold: 10,
    aErode: 10,
  });

  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const studioSectionRef = useRef<HTMLDivElement>(null);

  const checkBackendHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`, { method: "GET" });
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  const processImage = useCallback(async (file: File, configToUse = modelConfig) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setProcessingStatus("Enviando imagem para a IA...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", configToUse.model);
      formData.append("alpha_matting", String(configToUse.alphaMatting));
      formData.append("af_threshold", String(configToUse.afThreshold));
      formData.append("ab_threshold", String(configToUse.abThreshold));
      formData.append("a_erode", String(configToUse.aErode));
      formData.append("return_base64", "true");

      const modelDisplayName =
        configToUse.model === "isnet-anime"
          ? "ISNet Anime (Capuzes e Ilustrações)"
          : configToUse.model.toUpperCase();

      setProcessingStatus(`Calculando recorte (${modelDisplayName})...`);

      const res = await fetch(`${API_BASE}/api/remove-bg`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Falha na comunicação com a API de remoção.");
      }

      setProcessingStatus("Preservando bordas e canal de transparência...");

      const data = await res.json();
      if (data.success && data.data_url) {
        setProcessedUrl(data.data_url);
        setProcessMetrics(data.metrics);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido ao processar imagem.";
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  }, [modelConfig]);

  const handleFileSelected = useCallback((file: File, forceModel?: string) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).");
      return;
    }

    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setProcessedUrl(null);
    setProcessMetrics(null);
    setGeminiSuggestions(null);
    setCustomBgUrl(null);
    setIsRefining(false);

    const cfg = forceModel ? { ...modelConfig, model: forceModel } : modelConfig;
    if (forceModel) {
      setModelConfig(cfg);
    }

    processImage(file, cfg);

    setTimeout(() => {
      studioSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [modelConfig, processImage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkBackendHealth();
    }, 100);
    const interval = setInterval(checkBackendHealth, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [checkBackendHealth]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelected(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFileSelected]);

  const handleSelectSample = async (samplePath: string, name: string) => {
    try {
      setIsProcessing(true);
      setProcessingStatus("Carregando imagem de amostra...");
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], samplePath.split("/").pop() || "sample.jpg", {
        type: blob.type || "image/png",
      });

      if (name.toLowerCase().includes("capuz") || samplePath.includes("image.png")) {
        handleFileSelected(file, "isnet-anime");
      } else if (name.toLowerCase().includes("produto")) {
        handleFileSelected(file, "isnet-general-use");
      } else {
        handleFileSelected(file, "birefnet-general");
      }
    } catch {
      setErrorMsg("Não foi possível carregar a imagem de exemplo.");
      setIsProcessing(false);
    }
  };

  const handleQuickModelSwitch = (newModelId: string) => {
    const updated = { ...modelConfig, model: newModelId };
    setModelConfig(updated);
    if (originalFile) {
      processImage(originalFile, updated);
    }
  };

  const handleTriggerGemini = async () => {
    if (!originalFile) return;
    setLoadingGemini(true);
    try {
      const formData = new FormData();
      formData.append("file", originalFile);

      const res = await fetch(`${API_BASE}/api/gemini/suggest-backgrounds`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erro na análise do Gemini.");
      }

      const data = await res.json();
      setGeminiSuggestions(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Não foi possível obter sugestões do Gemini no momento.");
    } finally {
      setLoadingGemini(false);
    }
  };

  const handleDownloadTransparent = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `luminocut-transparente-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  const handleDownloadComposed = async () => {
    if (!processedUrl || !originalUrl) return;

    const imgSubject = new Image();
    imgSubject.crossOrigin = "anonymous";
    imgSubject.src = processedUrl;

    imgSubject.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imgSubject.naturalWidth;
      canvas.height = imgSubject.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const finishDownload = () => {
        ctx.drawImage(imgSubject, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `luminocut-cenario-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.7 },
        });
      };

      if (backdrop.type === "color") {
        ctx.fillStyle = backdrop.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        finishDownload();
      } else if (backdrop.type === "gradient") {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (backdrop.value === "Sunset Studio") {
          grad.addColorStop(0, "#fb923c");
          grad.addColorStop(0.5, "#f43f5e");
          grad.addColorStop(1, "#881337");
        } else if (backdrop.value === "Cyberpunk Glow") {
          grad.addColorStop(0, "#0f172a");
          grad.addColorStop(0.5, "#312e81");
          grad.addColorStop(1, "#4c1d95");
        } else if (backdrop.value === "Aurora Borealis") {
          grad.addColorStop(0, "#042f2e");
          grad.addColorStop(0.5, "#065f46");
          grad.addColorStop(1, "#1e1b4b");
        } else if (backdrop.value === "Golden Hour") {
          grad.addColorStop(0, "#fef08a");
          grad.addColorStop(0.5, "#f59e0b");
          grad.addColorStop(1, "#78350f");
        } else {
          grad.addColorStop(0, "#f1f5f9");
          grad.addColorStop(1, "#e2e8f0");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        finishDownload();
      } else if (backdrop.type === "image" && customBgUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = customBgUrl;
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          finishDownload();
        };
      } else if (backdrop.type === "blur") {
        const origImg = new Image();
        origImg.crossOrigin = "anonymous";
        origImg.src = originalUrl;
        origImg.onload = () => {
          ctx.filter = `blur(${blurIntensity * 1.5}px) brightness(0.95)`;
          ctx.drawImage(origImg, 0, 0, canvas.width, canvas.height);
          ctx.filter = "none";
          finishDownload();
        };
      } else {
        finishDownload();
      }
    };
  };

  const handleCopyClipboard = async () => {
    if (!processedUrl) return;
    try {
      const res = await fetch(processedUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErrorMsg("Seu navegador não suporta copiar imagens diretamente.");
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessMetrics(null);
    setGeminiSuggestions(null);
    setCustomBgUrl(null);
    setErrorMsg(null);
    setIsRefining(false);
  };

  const scrollToStudio = () => {
    studioSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] text-slate-900 selection:bg-[#ff3b30] selection:text-white">
      {/* 1. NAVBAR EDITORIAL LIMPA (TEMA CLARO) */}
      <EditorialNavbar
        onScrollToStudio={scrollToStudio}
        onOpenUpload={() => fileInputRef.current?.click()}
      />

      {/* 2. HERO 100VH EM TELA CHEIA (100% WIDTH EDGE-TO-EDGE) */}
      <HeroBeforeAfter
        onExploreStudio={scrollToStudio}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      {/* 3. SEÇÃO WORKSPACE DO ESTÚDIO */}
      <section
        ref={studioSectionRef}
        id="studio-section"
        className="relative z-10 w-full max-w-[1720px] mx-auto px-6 sm:px-12 py-20 space-y-10"
      >
        {/* Banner de Aviso caso Backend esteja offline */}
        {!backendOnline && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-xs text-amber-900 font-medium">
                <strong>Serviço aguardando conexão:</strong> O backend FastAPI não respondeu no endereço{" "}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-bold">{API_BASE}</code>.
              </div>
            </div>
            <button
              onClick={checkBackendHealth}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Reconectar
            </button>
          </div>
        )}

        {/* Mensagem de Erro Geral */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <span className="text-xs text-red-900 font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs text-red-600 hover:text-red-800 underline font-semibold"
            >
              Fechar
            </button>
          </div>
        )}

        {/* CASO 1: SEM IMAGEM DO USUÁRIO CARREGADA */}
        {!originalUrl && (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff3b30]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b30]" />
                  <span>Estúdio de Recorte</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-950 mt-1">
                  Carregue Sua Foto
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Arraste qualquer imagem ou cole direto com Ctrl+V. Preservação milimétrica de capuzes, mantos e cabelos finos.
              </p>
            </div>

            {/* Dropzone Principal */}
            <div className="max-w-4xl mx-auto">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelected(file);
                }}
                className="group relative cursor-pointer rounded-3xl p-14 sm:p-20 border-2 border-dashed border-slate-300 hover:border-slate-950 bg-white hover:bg-slate-50/50 transition-all duration-300 flex flex-col items-center justify-center text-center space-y-6 shadow-sm hover:shadow-md"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />

                <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-200 p-0.5 group-hover:scale-105 transition-transform flex items-center justify-center shadow-inner">
                  <UploadCloud className="h-9 w-9 text-slate-700 group-hover:text-slate-950 transition-colors" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold uppercase tracking-tight text-slate-950">
                    Arraste sua imagem aqui ou clique para selecionar
                  </h3>
                  <p className="text-xs text-slate-500">
                    Você também pode colar direto da área de transferência com{" "}
                    <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-mono text-[11px]">
                      Ctrl + V
                    </kbd>
                  </p>
                </div>

                <div className="inline-flex items-center gap-4 text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Check className="h-4 w-4 text-[#ff3b30]" /> Preserva Capuzes & Roupas
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Check className="h-4 w-4 text-[#ff3b30]" /> Fios de Cabelo
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Check className="h-4 w-4 text-[#ff3b30]" /> Resolução Nativa 4K
                  </span>
                </div>
              </div>

              {/* Galeria de Amostras */}
              <div className="mt-8">
                <SampleGallery onSelectSample={handleSelectSample} />
              </div>
            </div>
          </div>
        )}

        {/* CASO 2: WORKSPACE ATIVO COM FOTO CARREGADA */}
        {originalUrl && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Barra de Ações Superior do Workspace (Console Organizado de 2 Níveis) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              {/* Nível 1: Controles de Processamento & Modos de Visualização */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Bloco Esquerdo: Origem, Modelos Neurais e Pincel */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar py-0.5">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Carregar uma nova imagem"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Nova Foto</span>
                  </button>

                  <div className="h-5 w-px bg-slate-200 mx-0.5 shrink-0 hidden sm:block" />

                  {/* Seletor de Modelo Inteligente - SEM EMOJIS! COM ÍCONES LUCIDE E DESIGN EDITORIAL */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium shrink-0">
                    <button
                      onClick={() => handleQuickModelSwitch("isnet-anime")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        modelConfig.model === "isnet-anime"
                          ? "bg-[#ff3b30] text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                      title="Otimizado para ilustrações, capuzes claros e bordas 2D"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Anime & Capuz</span>
                    </button>

                    <button
                      onClick={() => handleQuickModelSwitch("birefnet-general")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        modelConfig.model === "birefnet-general"
                          ? "bg-slate-950 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                      title="Otimizado para fotos reais, retratos e cabelos finos"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Foto Real</span>
                    </button>

                    <button
                      onClick={() => handleQuickModelSwitch("isnet-general-use")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        modelConfig.model === "isnet-general-use"
                          ? "bg-slate-950 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                      title="Otimizado para produtos, e-commerce e objetos"
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>Produtos</span>
                    </button>
                  </div>

                  <div className="h-5 w-px bg-slate-200 mx-0.5 shrink-0 hidden sm:block" />

                  {/* Pincel de Retoque */}
                  <button
                    onClick={() => setIsRefining(!isRefining)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      isRefining
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Paintbrush className="h-3.5 w-3.5" />
                    <span>{isRefining ? "Fechar Pincel" : "Pincel de Retoque"}</span>
                  </button>

                  {/* Configurações Avançadas */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                    title="Configurações avançadas do motor ONNX"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Bloco Direito: Modos de Visualização do Canvas */}
                {!isRefining && (
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shrink-0 self-start lg:self-auto">
                    <button
                      onClick={() => setViewMode("slider")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        viewMode === "slider"
                          ? "bg-white text-slate-950 shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <Split className="h-3.5 w-3.5" />
                      <span>Slider</span>
                    </button>

                    <button
                      onClick={() => setViewMode("cutout")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        viewMode === "cutout"
                          ? "bg-white text-slate-950 shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Recorte</span>
                    </button>

                    <button
                      onClick={() => setViewMode("sideBySide")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        viewMode === "sideBySide"
                          ? "bg-white text-slate-950 shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Lado a Lado</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Nível 2: Métricas de Processamento + Botões de Exportação */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                {/* Métricas discretas e elegantes */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 overflow-x-auto no-scrollbar py-0.5">
                  {processMetrics ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>
                          Processado em <strong className="text-slate-800">{processMetrics.execution_time_ms}ms</strong>
                        </span>
                      </div>
                      <span>•</span>
                      <div>
                        <span>
                          Dimensões: <strong className="text-slate-800">{processMetrics.width} × {processMetrics.height} px</strong>
                        </span>
                      </div>
                      <span>•</span>
                      <div>
                        <span>
                          Motor: <strong className="text-slate-800 uppercase">{processMetrics.model_used}</strong>
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400">Pronto para exportação em resolução nativa</span>
                  )}
                </div>

                {/* Ações de Download e Cópia */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    disabled={!processedUrl || isProcessing}
                    onClick={handleCopyClipboard}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                    title="Copiar imagem recortada para a área de transferência"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>

                  <button
                    disabled={!processedUrl || isProcessing}
                    onClick={handleDownloadTransparent}
                    className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-700" />
                    <span>Baixar PNG</span>
                  </button>

                  <button
                    disabled={!processedUrl || isProcessing}
                    onClick={handleDownloadComposed}
                    className="px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#ff3b30]" />
                    <span>Baixar com Cenário</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visualizador ou Modo de Refinamento */}
            {isRefining && originalUrl && processedUrl ? (
              <RefineCanvas
                originalUrl={originalUrl}
                processedUrl={processedUrl}
                onApplyRefine={(newUrl) => {
                  setProcessedUrl(newUrl);
                  setIsRefining(false);
                  confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.6 },
                  });
                }}
                onCancel={() => setIsRefining(false)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl">
                    {/* Overlay de Processamento */}
                    {isProcessing && (
                      <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-[#ff3b30] animate-spin" />
                          <Sparkles className="h-6 w-6 text-[#ff3b30] absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-950">
                            Processando com IA
                          </h4>
                          <p className="text-xs text-slate-600">
                            {processingStatus || "Calculando recorte neural..."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Modo 1: Slider Antes/Depois */}
                    {viewMode === "slider" && processedUrl && (
                      <ComparisonSlider
                        originalUrl={originalUrl}
                        processedUrl={processedUrl}
                        backdropClass={backdrop.cssClass}
                        backdropStyle={backdrop.cssStyle}
                        customBgUrl={customBgUrl}
                        blurIntensity={backdrop.type === "blur" ? blurIntensity : 0}
                      />
                    )}

                    {/* Modo 2: Recorte Isolado */}
                    {viewMode === "cutout" && processedUrl && (
                      <div
                        className={`relative w-full aspect-[4/3] max-h-[640px] flex items-center justify-center overflow-hidden ${
                          backdrop.cssClass || ""
                        }`}
                        style={backdrop.cssStyle}
                      >
                        {customBgUrl && (
                          <img
                            src={customBgUrl}
                            alt="Fundo customizado"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        {backdrop.type === "blur" && !customBgUrl && (
                          <img
                            src={originalUrl}
                            alt="Fundo Desfocado"
                            className="absolute inset-0 w-full h-full object-contain filter"
                            style={{ filter: `blur(${blurIntensity}px) brightness(0.95)` }}
                          />
                        )}
                        <img
                          src={processedUrl}
                          alt="Resultado Recortado"
                          className="relative z-10 w-full h-full object-contain drop-shadow-md"
                        />
                      </div>
                    )}

                    {/* Modo 3: Lado a Lado */}
                    {viewMode === "sideBySide" && processedUrl && (
                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-100">
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white aspect-square flex items-center justify-center relative">
                          <img
                            src={originalUrl}
                            alt="Original"
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-white">
                            Original
                          </span>
                        </div>
                        <div
                          className={`rounded-xl overflow-hidden border border-slate-200 aspect-square flex items-center justify-center relative ${
                            backdrop.cssClass || ""
                          }`}
                          style={backdrop.cssStyle}
                        >
                          {customBgUrl && (
                            <img
                              src={customBgUrl}
                              alt="Cenário"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          <img
                            src={processedUrl}
                            alt="Recorte"
                            className="w-full h-full object-contain relative z-10"
                          />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#ff3b30] text-[10px] font-bold text-white">
                            Recortado
                          </span>
                        </div>
                      </div>
                    )}

                    {!processedUrl && (
                      <div className="aspect-[4/3] flex items-center justify-center bg-slate-100">
                        <img
                          src={originalUrl}
                          alt="Preview Original"
                          className="w-full h-full object-contain opacity-60"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna Controles de Estúdio */}
                <div className="lg:col-span-4 space-y-6">
                  <StudioBackdropEditor
                    currentBackdrop={backdrop}
                    onSelectBackdrop={setBackdrop}
                    blurIntensity={blurIntensity}
                    setBlurIntensity={setBlurIntensity}
                    customBgUrl={customBgUrl}
                    setCustomBgUrl={setCustomBgUrl}
                  />

                  <GeminiArtDirector
                    suggestions={geminiSuggestions}
                    loading={loadingGemini}
                    onTriggerAnalyze={handleTriggerGemini}
                    onApplyColor={(hex) => {
                      setBackdrop({
                        type: "color",
                        value: hex,
                        cssStyle: { backgroundColor: hex },
                      });
                    }}
                    onApplyIdea={(idea) => {
                      if (idea.color) {
                        setBackdrop({
                          type: "color",
                          value: idea.color,
                          cssStyle: { backgroundColor: idea.color },
                        });
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal de Configuração de Modelos */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={modelConfig}
        onChangeConfig={(newCfg) => {
          setModelConfig(newCfg);
          if (originalFile) {
            processImage(originalFile, newCfg);
          }
        }}
      />
    </div>
  );
}
