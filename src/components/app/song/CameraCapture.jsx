import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Camera, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (e) {
      setError("Could not access camera. Please allow camera permission and try again.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `chart-${Date.now()}.jpg`, { type: "image/jpeg" });
      stopCamera();
      onCapture(file);
    }, "image/jpeg", 0.95);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-[#0a0a14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <p className="text-sm font-bold text-foreground">Camera</p>
          <button onClick={() => { stopCamera(); onClose(); }}
            className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={startCamera}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {/* Crop guide overlay */}
              <div className="absolute inset-4 border-2 border-white/20 rounded-xl pointer-events-none" />
              <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-white/50">
                Position the chart within the frame
              </p>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Capture button */}
        <div className="flex items-center justify-center py-5">
          <button
            onClick={handleCapture}
            disabled={!ready || !!error}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
          >
            <Camera className="w-7 h-7 text-black" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}