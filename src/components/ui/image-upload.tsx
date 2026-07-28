"use client";
import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  aspect?: "book" | "square";
}

const MAX_WIDTH = 400;
const QUALITY = 0.82;

/** Resize + compress an image file and return a base64 data URL. */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  value,
  onChange,
  label = "Cover Image",
  aspect = "book",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be smaller than 8 MB.");
      return;
    }
    setProcessing(true);
    try {
      const dataUrl = await resizeImage(file);
      onChange(dataUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-slate-700 mb-1.5 block">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm",
              aspect === "book" ? "h-28 w-20" : "h-28 w-28"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Cover preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              <Upload className="h-3.5 w-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/40 transition-colors",
            aspect === "book" ? "w-20 h-28" : "w-28 h-28"
          )}
        >
          {processing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
          ) : (
            <>
              <ImageIcon className="h-5 w-5 text-slate-400" />
              <Upload className="h-3.5 w-3.5 text-slate-400" />
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      {!value && !error && (
        <p className="text-[11px] text-slate-400 mt-1.5">PNG, JPG up to 8 MB</p>
      )}
    </div>
  );
}
