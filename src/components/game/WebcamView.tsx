import React, { useRef, useEffect, useState, useCallback } from "react";
import useSound from "use-sound";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-converter";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

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
  // Lower the EAR threshold to make blink detection more sensitive
  const EAR_THRESHOLD = 0.24; // Higher threshold for easier blink detection
  const blinkFrameCount = useRef(0);
  const BLINK_CONFIRMATION_FRAMES = 1; // Require fewer frames for faster response
  const [playChime] = useSound("/sounds/chime.mp3");
  // Add detection status state for better user feedback
  const [detectionStatus, setDetectionStatus] = useState<string>("Waiting for webcam");

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        await tf.setBackend("webgl");
        await tf.ready();
        console.log("TensorFlow backend ready");
        
        // Create detector with explicit size configuration and simpler model
        const detector = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs',
            refineLandmarks: false, // Set to false for better performance
            maxFaces: 1
          }
        );
        
        console.log("Face landmarks detector created");
        setModel(detector);
        setIsModelLoading(false);
      } catch (error) {
        console.error("Error loading model:", error);
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (isModelLoading) {
      setDetectionStatus("Loading facial recognition model...");
    } else if (model) {
      setDetectionStatus("Model loaded. Start webcam to begin.");
    } else {
      setDetectionStatus("Model failed to load. Please refresh the page.");
    }
  }, [isModelLoading, model]);

  // Updated calculateEAR function to work better with the MediaPipe model
  const calculateEAR = (landmarks: number[][]) => {
    // Try multiple sets of eye landmark indices to find ones that work with the model
    // These are approximate indices for the MediaPipe face mesh model
    
    // First set - using more landmark points for robustness
    const leftEyeOuter = landmarks[33] || [0, 0, 0];
    const leftEyeInner = landmarks[133] || [0, 0, 0];
    const leftEyeTop = landmarks[159] || landmarks[160] || [0, 0, 0]; // 159 or 160 (upper eyelid)
    const leftEyeBottom = landmarks[145] || landmarks[144] || [0, 0, 0]; // 145 or 144 (lower eyelid)
    
    const rightEyeOuter = landmarks[263] || [0, 0, 0];
    const rightEyeInner = landmarks[362] || [0, 0, 0];
    const rightEyeTop = landmarks[386] || landmarks[385] || [0, 0, 0]; // 386 or 385 (upper eyelid)
    const rightEyeBottom = landmarks[374] || landmarks[373] || [0, 0, 0]; // 374 or 373 (lower eyelid)
    
    // Calculate vertical eye heights
    const leftEyeHeight = Math.abs(leftEyeTop[1] - leftEyeBottom[1]);
    const rightEyeHeight = Math.abs(rightEyeTop[1] - rightEyeBottom[1]);
    
    // Calculate horizontal eye widths
    const leftEyeWidth = Math.abs(leftEyeOuter[0] - leftEyeInner[0]);
    const rightEyeWidth = Math.abs(rightEyeOuter[0] - rightEyeInner[0]);
    
    // Calculate EAR ratios
    let leftEAR = leftEyeHeight / Math.max(leftEyeWidth, 1); // Avoid division by zero
    let rightEAR = rightEyeHeight / Math.max(rightEyeWidth, 1);
    
    // Take the average
    const ear = (leftEAR + rightEAR) / 2.0;
    
    return ear;
  };

  const detectFace = async () => {
    if (!model || !videoRef.current || !isTracking) {
      return;
    }

    try {
      const video = videoRef.current;
      
      let predictions = [];
      try {
        predictions = await model.estimateFaces(video);
      } catch (detectionError) {
        console.warn("Detection error, will retry:", detectionError);
        requestAnimationFrame(detectFace);
        return;
      }

      if (predictions && predictions.length > 0) {
        const face = predictions[0];
        const keypoints = face.keypoints;
        
        if (!keypoints || keypoints.length === 0) {
          requestAnimationFrame(detectFace);
          return;
        }
        
        const landmarks = keypoints.map(kp => [kp.x || 0, kp.y || 0, kp.z || 0]);
        
        // Log landmark count for debugging
        console.log(`Detected ${landmarks.length} landmarks`);
        
        // Check if we have the minimum landmarks needed
        if (landmarks.length > 200) { // MediaPipe should provide many landmarks
          const ear = calculateEAR(landmarks);
          
          const isValidEAR = !isNaN(ear) && isFinite(ear);
          const isBlink = isValidEAR && ear < EAR_THRESHOLD;
          
          // Display current EAR value to console for debugging
          console.log(`EAR: ${ear.toFixed(3)}, Threshold: ${EAR_THRESHOLD}, Is Blink: ${isBlink}`);
          
          if (isBlink) {
            blinkFrameCount.current += 1;
            console.log(`Potential blink detected: ${blinkFrameCount.current}/${BLINK_CONFIRMATION_FRAMES} frames`);
          } else {
            if (blinkFrameCount.current >= BLINK_CONFIRMATION_FRAMES && lastBlinkState.current) {
              console.log('BLINK CONFIRMED!');
              setBlinkCount((prev) => prev + 1);
              playChime();
            }
            blinkFrameCount.current = 0;
          }
          
          lastBlinkState.current = isBlink;

          // Update eye tracking data for visualization
          const width = video.width;
          const leftEyePos = landmarks[33]; // Left eye corner
          const rightEyePos = landmarks[263]; // Right eye corner
          
          // Flip X coordinates for mirrored video
          const leftEyeX = width - leftEyePos[0];
          const leftEyeY = leftEyePos[1];
          const rightEyeX = width - rightEyePos[0];
          const rightEyeY = rightEyePos[1];
          
          // Update tracking data
          onEyeDataUpdate({
            leftEye: { x: leftEyeX, y: leftEyeY },
            rightEye: { x: rightEyeX, y: rightEyeY },
            isBlink,
          });

          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              // Clear the canvas
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              // Draw just the eye landmarks with opacity
              drawEyePoints(ctx, landmarks, video.width);
            }
          }
        } else {
          console.warn(`Insufficient landmarks: ${landmarks.length} (need more for accurate detection)`);
        }
      }

      requestAnimationFrame(detectFace);
    } catch (error) {
      console.error("Error detecting face:", error);
      requestAnimationFrame(detectFace);
    }
  };

  // Draw just the eye points with opacity
  const drawEyePoints = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number) => {
    // Eye landmark indices
    const leftEyeIndices = [33, 133, 159, 160, 161, 144, 145, 153, 154, 155];
    const rightEyeIndices = [263, 362, 385, 386, 387, 373, 374, 380, 381, 382];
    
    // Draw eye points with opacity
    ctx.fillStyle = "rgba(0, 255, 0, 0.4)"; // Semi-transparent green
    ctx.strokeStyle = "rgba(0, 200, 0, 0.6)"; // Slightly more opaque green for outline
    ctx.lineWidth = 1;
    
    // Draw left eye points
    leftEyeIndices.forEach(index => {
      if (index < landmarks.length) {
        const x = width - landmarks[index][0]; // Flip X for mirrored video
        const y = landmarks[index][1];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });
    
    // Draw right eye points
    rightEyeIndices.forEach(index => {
      if (index < landmarks.length) {
        const x = width - landmarks[index][0]; // Flip X for mirrored video
        const y = landmarks[index][1];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  const startWebcam = async () => {
    if (!model) {
      setDetectionStatus("Model not loaded yet. Please wait or refresh.");
      return;
    }
    try {
      setDetectionStatus("Requesting webcam access...");
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
          setDetectionStatus("Webcam active. Detection starting...");
          onWebcamStart();
          detectFace();
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setDetectionStatus("Error accessing webcam. Please check permissions.");
    }
  };

  const stopWebcam = () => {
    setBlinkCount(0);
    setDetectionStatus("Webcam stopped");
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    onWebcamStop();
  };

  // Effect to start/stop webcam based on isTracking prop
  useEffect(() => {
    if (isTracking && !videoRef.current?.srcObject) {
      startWebcam();
    } else if (!isTracking && videoRef.current?.srcObject) {
      stopWebcam();
    }
  }, [isTracking]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const width = 640;
      const height = 480;

      videoRef.current.width = width;
      videoRef.current.height = height;
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      Object.assign(videoRef.current.style, {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: "scaleX(-1)",
      });
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && isTracking) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const drawEye = (x: number, y: number) => {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "#00ff00";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "white";
          ctx.stroke();
        };

        drawEye(eyeTrackingData.leftEye.x, eyeTrackingData.leftEye.y);
        drawEye(eyeTrackingData.rightEye.x, eyeTrackingData.rightEye.y);
      }
    }
  }, [isTracking, eyeTrackingData]);

  return (
    <div className="w-[400px] h-[300px] bg-[#F5ECD7] relative overflow-hidden rounded-lg border-2 border-[#5D4037]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      {/* Canvas for eye tracking dots */}
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      
      {/* Blink counter in top right */}
      {isTracking && (
        <div className="absolute top-4 right-4 bg-[#E6C28C] text-[#5D4037] border-2 border-[#5D4037] rounded-full px-3 py-1 flex items-center justify-center shadow-md">
          <span className="font-bold">{blinkCount}</span>
        </div>
      )}
      
      {/* Single eye design overlay when webcam is not active */}
      {!isTracking && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F5ECD7]">
          <div className="relative w-48 h-48 rounded-full bg-white border-4 border-[#5D4037] flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full bg-[#5D4037]"></div>
            <div className="absolute w-8 h-8 rounded-full bg-white top-[52px] left-[52px]"></div>
          </div>
        </div>
      )}
      
      {/* Loading indicator (only show when model is loading) */}
      {isModelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F5ECD7]/80">
          <div className="w-12 h-12 border-4 border-t-transparent border-[#5D4037] rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Camera controls */}
      {isTracking && (
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={stopWebcam}
            size="icon"
            className="bg-[#E6C28C] hover:bg-[#D4A76A] text-[#5D4037] border-2 border-[#5D4037] rounded-full w-10 h-10"
          >
            <CameraOff className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default WebcamView;
