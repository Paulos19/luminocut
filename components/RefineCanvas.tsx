"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Paintbrush, Eraser, Undo, Check, X, Sliders } from "lucide-react";

interface RefineCanvasProps {
  originalUrl: string;
  processedUrl: string;
  onApplyRefine: (newProcessedDataUrl: string) => void;
  onCancel: () => void;
}

export function RefineCanvas({
  originalUrl,
  processedUrl,
  onApplyRefine,
  onCancel,
}: RefineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushMode, setBrushMode] = useState<"restore" | "erase">("restore");
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const processedImgRef = useRef<HTMLImageElement | null>(null);

  // Inicializar imagens e Canvas
  useEffect(() => {
    const orig = new Image();
    const proc = new Image();
    orig.crossOrigin = "anonymous";
    proc.crossOrigin = "anonymous";

    orig.src = originalUrl;
    proc.src = processedUrl;

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        originalImgRef.current = orig;
        processedImgRef.current = proc;
        setImagesLoaded(true);

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = proc.naturalWidth;
          canvas.height = proc.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(proc, 0, 0);
            // Salvar estado inicial no histórico
            const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([initialData]);
          }
        }
      }
    };

    orig.onload = checkLoaded;
    proc.onload = checkLoaded;
  }, [originalUrl, processedUrl]);

  // Função para desenhar no canvas
  const drawAtPoint = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !originalImgRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, brushSize * (scaleX > 1 ? scaleX * 0.5 : 1), 0, Math.PI * 2);
      ctx.clip();

      if (brushMode === "restore") {
        // Restaurar pixels da foto original
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(originalImgRef.current, 0, 0);
      } else {
        // Apagar pixels (borracha)
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fill();
      }

      ctx.restore();
    },
    [brushMode, brushSize]
  );

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), currentState]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove o atual
    const prevState = newHistory[newHistory.length - 1];
    ctx.putImageData(prevState, 0, 0);
    setHistory(newHistory);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    drawAtPoint(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      drawAtPoint(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onApplyRefine(dataUrl);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Barra de Ferramentas do Pincel */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Botão Restaurar */}
          <button
            onClick={() => setBrushMode("restore")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              brushMode === "restore"
                ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500"
                : "text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Paintbrush className="h-3.5 w-3.5" />
            <span>Restaurar (Recuperar Roupa / Detalhes)</span>
          </button>

          {/* Botão Borracha */}
          <button
            onClick={() => setBrushMode("erase")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              brushMode === "erase"
                ? "bg-red-600 text-white shadow-sm ring-1 ring-red-500"
                : "text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Apagar Sobras</span>
          </button>
        </div>

        {/* Tamanho do Pincel */}
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Sliders className="h-3.5 w-3.5 text-slate-700" />
          <span>Tamanho:</span>
          <span className="font-mono text-slate-950 font-bold w-8">{brushSize}px</span>
          <input
            type="range"
            min="6"
            max="70"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 sm:w-32 accent-slate-950 cursor-pointer"
          />
        </div>

        {/* Desfazer e Ações */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            title="Desfazer traço"
            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Undo className="h-4 w-4" />
          </button>

          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5 text-[#ff3b30]" />
            Aplicar Retoque
          </button>
        </div>
      </div>

      {/* Área do Canvas Interativo */}
      <div className="relative w-full aspect-[4/3] max-h-[640px] rounded-3xl overflow-hidden border border-slate-200 bg-transparency-grid-light flex items-center justify-center shadow-lg">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full object-contain cursor-crosshair select-none"
        />
        {!imagesLoaded && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center text-xs text-slate-700 font-medium">
            Carregando ferramentas de retoque...
          </div>
        )}
      </div>
    </div>
  );
}
