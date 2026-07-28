// src/components/ui/image-upload.tsx
"use client";
import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: "book" | "square";
}

export function ImageUpload({
  value,
  onChange,
  label = "Cover Image",
  aspect = "book",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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

    setUploading(true);

    try {
      // Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Update with the server URL
      onChange(data.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
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
          {uploading ? (
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