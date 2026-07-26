"use client";

import { X, Zap, Camera, Image as ImageIcon, RotateCcw, ScanLine } from "lucide-react";

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
  isCameraActive: boolean;
  onClose: () => void;
  onCapture: () => void;
  onSwitchCamera: () => void;
  onUpload: () => void;
}

export default function CameraPreview({
  videoRef,
  isLoading,
  isCameraActive,
  onClose,
  onCapture,
  onSwitchCamera,
  onUpload,
}: CameraPreviewProps) {
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_22%,rgba(0,0,0,0.22)_76%)]" />

      <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
        <button
          onClick={onClose}
          aria-label="Close camera"
          className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/15 text-white shadow-lg backdrop-blur-xl transition hover:bg-white/25 active:scale-95"
        >
          <X size={21} />
        </button>

        <div className="rounded-full border border-white/30 bg-white/20 px-5 py-2 text-sm font-semibold tracking-wide text-white shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          Scanează Masa
        </div>

        <button
          aria-label="AI flash"
          className="grid size-11 place-items-center rounded-full border border-emerald-300/30 bg-white/15 text-emerald-300 shadow-lg backdrop-blur-xl transition hover:bg-white/25 active:scale-95"
        >
          <Zap size={21} />
        </button>
      </header>

      {isLoading && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="size-10 animate-spin rounded-full border-2 border-white/25 border-t-emerald-400" />
            <p className="text-sm font-medium text-white/75">Se pornește camera...</p>
          </div>
        </div>
      )}

      <div className="absolute inset-x-5 top-[18%] z-20 mx-auto max-w-md">
        <div className="relative aspect-[1.08] overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.03] shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />

          <div className="absolute inset-9 rounded-[1.5rem] border border-emerald-300/15 bg-emerald-300/[0.035]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.14)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
          </div>

          <div className="absolute left-8 right-8 top-1/2 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent shadow-[0_0_18px_rgba(52,211,153,0.8)]" />

          <div className="absolute left-7 top-7 h-11 w-11 rounded-tl-[1.4rem] border-l-[2.5px] border-t-[2.5px] border-white/85" />
          <div className="absolute right-7 top-7 h-11 w-11 rounded-tr-[1.4rem] border-r-[2.5px] border-t-[2.5px] border-white/85" />
          <div className="absolute bottom-7 left-7 h-11 w-11 rounded-bl-[1.4rem] border-b-[2.5px] border-l-[2.5px] border-white/85" />
          <div className="absolute bottom-7 right-7 h-11 w-11 rounded-br-[1.4rem] border-b-[2.5px] border-r-[2.5px] border-white/85" />

          <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-300/30 bg-black/25 px-4 py-2 text-xs font-semibold text-emerald-200 backdrop-blur-xl">
            <ScanLine size={14} />
            Scanare vizuală
          </div>
        </div>
      </div>

      <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-0 right-0 z-30 px-7">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <button
                onClick={onUpload}
                aria-label="Open gallery"
                className="grid size-14 place-items-center rounded-2xl border border-white/25 bg-white/15 text-white shadow-xl backdrop-blur-xl transition hover:bg-white/25 active:scale-95"
              >
                <ImageIcon size={23} />
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onCapture}
                aria-label="Capture photo"
                disabled={!isCameraActive}
                className="grid size-20 place-items-center rounded-full border-4 border-emerald-500 bg-white shadow-lg transition hover:scale-[1.03] active:scale-95 disabled:opacity-60"
              >
                <Camera size={28} className="text-emerald-700" />
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onSwitchCamera}
                aria-label="Switch camera"
                className="grid size-14 place-items-center rounded-2xl border border-white/25 bg-white/15 text-white shadow-xl backdrop-blur-xl transition hover:bg-white/25 active:scale-95"
              >
                <RotateCcw size={23} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
