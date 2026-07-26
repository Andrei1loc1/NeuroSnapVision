"use client";

import { useRouter } from "next/navigation";
import CameraScanner from "@/components/camera/CameraScanner";

export default function VisionAIPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  return <CameraScanner onClose={handleClose} />;
}