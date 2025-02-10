import React, { useRef, useEffect, useState, useCallback } from "react";
import useSound from "use-sound";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-converter";
import * as blazeface from "@tensorflow-models/blazeface";

interface WebcamViewProps {
  onWebcamStart?: () => void;
  onWebcamStop?: () => void;
  isTracking?: boolean;
  onEyeDataUpdate?: (data: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    isBlink: boolean;
  }) => void;
  eyeTrackingData?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    isBlink: boolean;
  };
}

const WebcamView = ({
  onWebcamStart = () => {},
  onWebcamStop = () => {},
  isTracking = false,
  onEyeDataUpdate = () => {},
  eyeTrackingData = {
    leftEye: { x: 0, y: 0 },
    rightEye: { x: 0, y: 0 },
    isBlink: false,
  },
}: WebcamViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const lastBlinkState = useRef(false);
  const [playChime] = useSound("/sounds/chime.mp3");

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        await tf.setBackend("webgl");
        await tf.ready();
        console.log("TensorFlow backend ready");
        const loadedModel = await blazeface.load();
        console.log("BlazeFace model loaded");
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (error) {
        console.error("Error loading model:", error);
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  const detectFace = async () => {
    if (!model || !videoRef.current || !isTracking) {
      console.log("Skipping detection:", {
        hasModel: !!model,
        hasVideo: !!videoRef.current,
        isTracking,
      });
      return;
    }

    try {
      // Create a tensor from the video element
      const tensor = tf.browser.fromPixels(videoRef.current);
      const predictions = await model.estimateFaces(tensor, false);
      tensor.dispose(); // Clean up the tensor

      console.log("Got predictions:", predictions);

      if (predictions.length > 0) {
        const face = predictions[0];
        console.log("Face data:", face);

        // Get eye positions and flip X coordinate since video is mirrored
        const width = videoRef.current.width;
        const leftEye = face.landmarks[1]; // Left eye
        const rightEye = face.landmarks[0]; // Right eye

        // Calculate eye positions (flipped horizontally)
        const leftEyeX = width - leftEye[0];
        const leftEyeY = leftEye[1];
        const rightEyeX = width - rightEye[0];
        const rightEyeY = rightEye[1];

        // Calculate eye distance for blink detection
        const eyeDistance = Math.abs(leftEyeY - rightEyeY);
        const isBlink = eyeDistance < 3; // Threshold for blink detection

        // Detect blink transition (false -> true) to count blinks
        if (isBlink && !lastBlinkState.current) {
          setBlinkCount((prev) => prev + 1);
        }
        lastBlinkState.current = isBlink;

        console.log("Processed face data:", {
          leftEyeX,
          leftEyeY,
          rightEyeX,
          rightEyeY,
          isBlink,
        });

        // Update tracking data
        onEyeDataUpdate({
          leftEye: { x: leftEyeX, y: leftEyeY },
          rightEye: { x: rightEyeX, y: rightEyeY },
          isBlink,
        });
      }

      requestAnimationFrame(detectFace);
    } catch (error) {
      console.error("Error detecting face:", error);
      requestAnimationFrame(detectFace);
    }
  };

  const startWebcam = async () => {
    if (!model) {
      console.error("Model not loaded yet");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          console.log("Video loaded, starting detection");
          onWebcamStart();
          // Set tracking to true and start detection loop
          isTracking = true;
          requestAnimationFrame(detectFace);
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const stopWebcam = () => {
    setBlinkCount(0); // Reset blink count when stopping webcam
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      onWebcamStop();
      isTracking = false;
    }
  };

  // Update canvas size to match video
  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      // Set fixed dimensions for better tracking
      const width = 640;
      const height = 480;

      videoRef.current.width = width;
      videoRef.current.height = height;
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      // Set video styles
      Object.assign(videoRef.current.style, {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: "scaleX(-1)", // Mirror the video
      });
    }
  }, []);

  // Draw eye tracking visualization
  useEffect(() => {
    if (canvasRef.current && isTracking) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw eye tracking points
        const drawEye = (x: number, y: number) => {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "#00ff00";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "white";
          ctx.stroke();
        };

        // Draw both eyes
        drawEye(eyeTrackingData.leftEye.x, eyeTrackingData.leftEye.y);
        drawEye(eyeTrackingData.rightEye.x, eyeTrackingData.rightEye.y);

        // Draw blink counter
        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.strokeText(
          `${blinkCount}`,
          canvasRef.current.width / 2,
          canvasRef.current.height / 2,
        );
        ctx.fillText(
          `${blinkCount}`,
          canvasRef.current.width / 2,
          canvasRef.current.height / 2,
        );
      }
    }
  }, [isTracking, eyeTrackingData]);

  return (
    <Card className="w-[640px] h-[480px] bg-gray-900 relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }} // Mirror the video
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={startWebcam}
          disabled={isTracking || isModelLoading}
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={stopWebcam}
          disabled={!isTracking}
        >
          <CameraOff className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default WebcamView;
