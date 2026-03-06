"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCodeStyling, { type Options, type DotType, type CornerSquareType } from "qr-code-styling";
import { Button } from "./ui/button";
import { Download, Upload, X, Palette, Shapes } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── 15 Built-in Design Presets ──────────────────────────────────────────────
interface Preset {
  name: string;
  bg: string;
  fg: string;
  dotType: DotType;
  cornerType: CornerSquareType;
  gradient?: boolean;
}

export const QR_PRESETS: Preset[] = [
  { name: "Classic",       fg: "#000000", bg: "#FFFFFF", dotType: "square",         cornerType: "square" },
  { name: "Rounded",       fg: "#1A1A2E", bg: "#FFFFFF", dotType: "rounded",        cornerType: "extra-rounded" },
  { name: "Dots",          fg: "#0066CC", bg: "#F0F4FF", dotType: "dots",           cornerType: "extra-rounded" },
  { name: "Classy",        fg: "#2C2C2C", bg: "#FFFFF0", dotType: "classy",         cornerType: "square" },
  { name: "Classy Round",  fg: "#4B0082", bg: "#FAF0FF", dotType: "classy-rounded", cornerType: "extra-rounded" },
  { name: "Neon",          fg: "#00FF87", bg: "#0A0A0A", dotType: "dots",           cornerType: "extra-rounded" },
  { name: "Sunset",        fg: "#FF4500", bg: "#1A0500", dotType: "rounded",        cornerType: "extra-rounded" },
  { name: "Ocean",         fg: "#0077B6", bg: "#CAF0F8", dotType: "classy-rounded", cornerType: "extra-rounded" },
  { name: "Midnight",      fg: "#D4E4FF", bg: "#0D1B2A", dotType: "rounded",        cornerType: "square" },
  { name: "Forest",        fg: "#2D6A4F", bg: "#D8F3DC", dotType: "classy-rounded", cornerType: "extra-rounded" },
  { name: "Cherry",        fg: "#C9184A", bg: "#FFF0F3", dotType: "dots",           cornerType: "extra-rounded" },
  { name: "Gold Rush",     fg: "#B8860B", bg: "#1A1100", dotType: "square",         cornerType: "square" },
  { name: "Carbon",        fg: "#A0AEC0", bg: "#1A202C", dotType: "classy",         cornerType: "square" },
  { name: "Royal",         fg: "#2B2D8A", bg: "#EEF0FF", dotType: "classy-rounded", cornerType: "extra-rounded" },
  { name: "Frost",         fg: "#2C7DA0", bg: "#E9F5FB", dotType: "dots",           cornerType: "extra-rounded" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
export interface QRDesign {
  fgColor: string;
  bgColor: string;
  dotType: DotType;
  cornerType: CornerSquareType;
  logoDataUrl?: string;
}

interface QRDesignerProps {
  value: string;
  title?: string;
  design: QRDesign;
  onDesignChange: (d: QRDesign) => void;
  showDownload?: boolean;
  previewOnly?: boolean;  // For the My QRs card — no editor panels
  size?: number;
}

export function QRDesigner({
  value,
  title,
  design,
  onDesignChange,
  showDownload = true,
  previewOnly = false,
  size = 220,
}: QRDesignerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(design.logoDataUrl);

  const buildOptions = useCallback((): Options => ({
    width: size,
    height: size,
    type: "canvas",
    data: value,
    margin: 8,
    dotsOptions: {
      color: design.fgColor,
      type: design.dotType,
    },
    cornersSquareOptions: {
      color: design.fgColor,
      type: design.cornerType,
    },
    cornersDotOptions: {
      color: design.fgColor,
    },
    backgroundOptions: {
      color: design.bgColor,
    },
    imageOptions: {
      imageSize: 0.3,
      margin: 4,
      crossOrigin: "anonymous",
      saveAsBlob: true,
    },
    image: design.logoDataUrl || undefined,
    qrOptions: {
      errorCorrectionLevel: "H", // High correction needed for center logo
    },
  }), [value, design, size]);

  // Initialize once
  useEffect(() => {
    if (!containerRef.current) return;
    qrRef.current = new QRCodeStyling(buildOptions());
    containerRef.current.innerHTML = "";
    qrRef.current.append(containerRef.current);
  }, []);

  // Update on option change
  useEffect(() => {
    qrRef.current?.update(buildOptions());
  }, [buildOptions]);

  const downloadPNG = () => {
    qrRef.current?.download({ name: title || "scanova-qr", extension: "png" });
  };

  const downloadSVG = () => {
    qrRef.current?.download({ name: title || "scanova-qr", extension: "svg" });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      onDesignChange({ ...design, logoDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(undefined);
    onDesignChange({ ...design, logoDataUrl: undefined });
  };

  const applyPreset = (preset: Preset) => {
    onDesignChange({
      ...design,
      fgColor: preset.fg,
      bgColor: preset.bg,
      dotType: preset.dotType,
      cornerType: preset.cornerType,
    });
  };

  if (previewOnly) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm"
             style={{ background: design.bgColor }}>
          <div ref={containerRef} style={{ width: size, height: size }} />
        </div>
        {showDownload && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadPNG} className="h-8 text-xs">
              <Download className="w-3 h-3 mr-1" /> PNG
            </Button>
            <Button variant="outline" size="sm" onClick={downloadSVG} className="h-8 text-xs">
              <Download className="w-3 h-3 mr-1" /> SVG
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-2xl overflow-hidden border border-border/40 shadow-lg shadow-black/10"
             style={{ background: design.bgColor }}>
          <div ref={containerRef} style={{ width: size, height: size }} />
        </div>
        {showDownload && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadPNG} className="bg-background/50 h-8 text-xs">
              <Download className="w-3 h-3 mr-1" /> PNG
            </Button>
            <Button variant="outline" size="sm" onClick={downloadSVG} className="bg-background/50 h-8 text-xs">
              <Download className="w-3 h-3 mr-1" /> SVG
            </Button>
          </div>
        )}
      </div>

      {/* ── 15 Style Presets ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest">
          <Shapes className="w-3.5 h-3.5" /> Styles
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {QR_PRESETS.map((preset) => {
            const isActive =
              design.fgColor === preset.fg &&
              design.bgColor === preset.bg &&
              design.dotType === preset.dotType;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                title={preset.name}
                className={cn(
                  "h-10 rounded-lg border-2 text-[10px] font-semibold transition-all hover:scale-105",
                  isActive
                    ? "border-primary ring-1 ring-primary/40 scale-105"
                    : "border-border/40 hover:border-border"
                )}
                style={{ background: preset.bg, color: preset.fg }}
              >
                {preset.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Color Pickers ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-widest">
          <Palette className="w-3.5 h-3.5" /> Custom Colors
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">QR Color</label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50">
              <input
                type="color"
                value={design.fgColor}
                onChange={e => onDesignChange({ ...design, fgColor: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-muted-foreground">{design.fgColor}</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Background</label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50">
              <input
                type="color"
                value={design.bgColor}
                onChange={e => onDesignChange({ ...design, bgColor: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-muted-foreground">{design.bgColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Center Logo ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Center Logo</p>
        {logoPreview ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
            <img src={logoPreview} alt="logo" className="w-12 h-12 rounded-lg object-contain border border-border" />
            <div className="flex-1">
              <p className="text-sm font-medium">Custom Logo</p>
              <p className="text-xs text-muted-foreground">Showing in center</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={removeLogo}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 border-dashed cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Upload logo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG — shown in center</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        )}
      </div>
    </div>
  );
}

// ─── Lightweight display (My QRs cards) ───────────────────────────────────────
export function QRPreview({ value, design, size = 80 }: { value: string; design: QRDesign; size?: number }) {
  return (
    <QRDesigner
      value={value}
      design={design}
      onDesignChange={() => {}}
      showDownload={false}
      previewOnly
      size={size}
    />
  );
}
