"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useCamera } from "@/hooks/useCamera";

type CameraScannerOptions = {
  onCloseAction?: () => void;
};

export function useCameraScanner({ onCloseAction }: CameraScannerOptions = {}) {
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const {
    videoRef,
    isLoading,
    error,
    facingMode,
    isCameraActive,
    switchCamera,
    startCamera,
    stopCamera,
  } = useCamera({ defaultFacingMode: "environment" });

  const handleClose = useCallback(() => {
    stopCamera();
    if (onCloseAction) {
      onCloseAction();
    } else {
      router.push("/");
    }
  }, [stopCamera, router, onCloseAction]);

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
  }

  return {
    videoRef,
    isLoading,
    error,
    facingMode,
    isCameraActive,
    switchCamera,
    startCamera,
    stopCamera,
    capturedImage,
    setCapturedImage,
    capturePhoto,
    handleClose,
  };
}
