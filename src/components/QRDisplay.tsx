"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

interface QRDisplayProps {
  value: string;
  title?: string;
  showDownload?: boolean;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

export function QRDisplay({ 
  value, 
  title, 
  showDownload = true, 
  size = 150,
  fgColor = "#0B0B0F",
  bgColor = "#FFFFFF"
}: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: {
          dark: fgColor,
          light: bgColor,
        }
      }, (error) => {
        if (error) console.error("Error generating QR", error);
      });
    }
  }, [value, size, fgColor, bgColor]);

  const downloadPNG = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || 'scanova-qr'}.png`;
    a.click();
  };

  const downloadSVG = (e: React.MouseEvent) => {
    e.stopPropagation();
    QRCode.toString(value, { type: 'svg', margin: 1, color: { dark: fgColor, light: bgColor } }, (err, string) => {
      if (err) return;
      const blob = new Blob([string], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || 'scanova-qr'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="p-1 rounded-xl shadow-sm border border-border shrink-0" style={{ backgroundColor: bgColor }}>
        <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto" style={{ width: size, height: size }} />
      </div>
      {showDownload && (
        <div className="flex gap-2 w-full justify-center mt-2">
          <Button variant="outline" size="sm" onClick={downloadPNG} className="bg-background/50 h-8 text-xs"><Download className="w-3 h-3 mr-1"/>PNG</Button>
          <Button variant="outline" size="sm" onClick={downloadSVG} className="bg-background/50 h-8 text-xs"><Download className="w-3 h-3 mr-1"/>SVG</Button>
        </div>
      )}
    </div>
  );
}
