"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  predictMeal,
  saveMultiItemMeal,
  type PredictionResult,
} from "@/lib/predict";
import { useCameraScanner } from "@/hooks/useCameraScanner";
import { dataURLtoFile } from "@/lib/utils/image";
import CameraPreview from "./CameraPreview";
import PredictionPanel from "./PredictionPanel";
import CameraError from "./CameraError";

interface CameraScannerProps {
  onClose?: () => void;
}

export default function CameraScanner({ onClose }: CameraScannerProps) {
  const {
    videoRef,
    isLoading,
    error,
    isCameraActive,
    switchCamera,
    startCamera,
    capturedImage,
    setCapturedImage,
    capturePhoto,
    handleClose,
  } = useCameraScanner({ onCloseAction: onClose });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const processedCaptureRef = useRef<string | null>(null);
  const [predictionInfo, setPredictionInfo] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isAddingToJournal, setIsAddingToJournal] = useState(false);
  const [journalStatus, setJournalStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!capturedImage) return;
    if (processedCaptureRef.current === capturedImage) return;
    processedCaptureRef.current = capturedImage;

    const runPrediction = async () => {
      try {
        setIsPredicting(true);
        setPredictionInfo(null);
        setJournalStatus(null);

        const file = dataURLtoFile(capturedImage, "capture.jpg");
        const result = await predictMeal(file, "medium");

        setPredictionInfo(result);
      } catch (e) {
        console.error(e);
        const msg = e instanceof Error && e.message?.includes("timeout")
          ? "Modelele de AI se încălzesc. Reîncearcă în 1-2 minute."
          : "Eroare la identificare. Reîncearcă.";
        setJournalStatus(msg);
      } finally {
        setIsPredicting(false);
      }
    };

    runPrediction();
  }, [capturedImage]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCapturedImage(dataUrl);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveMeal = async (items: PredictionResult[], portion: string) => {
    if (!capturedImage || items.length === 0) return;
    try {
      setIsAddingToJournal(true);
      setJournalStatus(null);

      const foodItems = items.map((item) => ({
        name: item.display_name || item.food_class || "Unknown",
        food_class: item.food_class || "",
        nutrition: {
          calories: item.nutrition?.calories || 0,
          protein: item.nutrition?.protein || 0,
          carbs: item.nutrition?.carbs || 0,
          fats: item.nutrition?.fats || 0,
        },
      }));

      await saveMultiItemMeal(foodItems, portion, undefined, capturedImage);

      setPredictionInfo(null);
      setCapturedImage(null);
      processedCaptureRef.current = null;
      setJournalStatus(null);
    } catch (e) {
      console.error(e);
      setJournalStatus("Eroare la salvare");
    } finally {
      setIsAddingToJournal(false);
    }
  };

  if (error) {
    return <CameraError error={error} onRetry={startCamera} />;
  }

  return (
    <div className="fixed inset-0 z-50 h-dvh w-full overflow-hidden bg-black text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <CameraPreview
        videoRef={videoRef}
        isLoading={isLoading}
        isCameraActive={isCameraActive}
        onClose={handleClose}
        onCapture={capturePhoto}
        onSwitchCamera={switchCamera}
        onUpload={handleUpload}
      />

      <PredictionPanel
        predictionInfo={predictionInfo}
        isPredicting={isPredicting}
        isAddingToJournal={isAddingToJournal}
        journalStatus={journalStatus}
        capturedImage={capturedImage}
        onSaveMeal={handleSaveMeal}
      />
    </div>
  );
}