"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FacingMode = "environment" | "user";

interface UseCameraOptions {
  defaultFacingMode?: FacingMode;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  streamRef: React.RefObject<MediaStream | null>;
  isLoading: boolean;
  error: string | null;
  facingMode: FacingMode;
  isCameraActive: boolean;
  startCamera: (mode?: FacingMode) => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
}

export function useCamera(options?: UseCameraOptions): UseCameraReturn {
  const defaultFacingMode = options?.defaultFacingMode ?? "environment";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>(defaultFacingMode);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(
    async (mode: FacingMode = facingMode) => {
      setIsLoading(true);
      setError(null);

      try {
        stopCamera();

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API is not supported in this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsCameraActive(true);
      } catch {
        setError("Camera access is required to scan meals.");
        setIsCameraActive(false);
      } finally {
        setIsLoading(false);
      }
    },
    [facingMode, stopCamera]
  );

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return {
    videoRef,
    streamRef,
    isLoading,
    error,
    facingMode,
    isCameraActive,
    startCamera,
    stopCamera,
    switchCamera,
  };
}