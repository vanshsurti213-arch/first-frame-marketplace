"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  label?: string;
  currentFileUrl?: string;
  uploading?: boolean;
  progress?: number;
  className?: string;
}

export function FileUpload({
  accept = "video/*,image/*",
  maxSizeMB = 50,
  onFileSelect,
  label = "Upload file",
  currentFileUrl,
  uploading = false,
  progress = 0,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }
      setFileName(file.name);
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-150",
          dragActive
            ? "border-ff-lime/50 bg-ff-lime/5"
            : "border-white/10 hover:border-white/20 bg-white/[0.02]",
          uploading && "pointer-events-none opacity-70"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <LoadingSpinner size="md" />
            <p className="text-sm text-ff-muted">Uploading… {Math.round(progress)}%</p>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-ff-lime rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : currentFileUrl ? (
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle2 className="w-5 h-5 text-ff-success" />
            <span className="text-sm text-white/70">{fileName || "File uploaded"}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
              }}
              className="ml-2 text-ff-muted hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-ff-muted" />
            <p className="text-sm text-white/70">{label}</p>
            <p className="text-xs text-ff-muted">
              Drag & drop or click to browse · Max {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-ff-danger">{error}</p>
      )}
    </div>
  );
}
