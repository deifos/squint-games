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
  // Add history state for debugging
  const [earHistory, setEarHistory] = useState<number[]>([]);
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
    
    // Update EAR history for debugging
    setEarHistory(prev => {
      const newHistory = [...prev, ear];
      if (newHistory.length > 30) { // Keep only last 30 values
        return newHistory.slice(-30);
      }
      return newHistory;
    });
    
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
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              
              // Draw ALL facial landmarks to debug
              drawAllFacialLandmarks(ctx, landmarks, video.width);
              
              // Draw eye landmarks specifically
              drawEyeRegions(ctx, landmarks, video.width);
              
              // Create a semi-transparent overlay for debug info
              ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
              ctx.fillRect(10, 10, 300, 180);
              
              // Display EAR value
              ctx.font = "20px Arial";
              ctx.fillStyle = "#00FF00";
              ctx.fillText(`EAR: ${isValidEAR ? ear.toFixed(3) : 'Invalid'}`, 20, 40);
              ctx.fillText(`Threshold: ${EAR_THRESHOLD}`, 20, 70);
              
              // Display blink status with color
              ctx.fillStyle = isBlink ? "#FF3333" : "#00FF00";
              ctx.fillText(`Blinking: ${isBlink ? "YES" : "NO"}`, 20, 100);
              
              // Display blink count
              ctx.fillStyle = "#FFFFFF";
              ctx.fillText(`Total Blinks: ${blinkCount}`, 20, 130);
              
              // Display confirmation counter when blinking
              if (isBlink) {
                ctx.fillStyle = "#FF9900";
                const confirmationText = `Confirming: ${blinkFrameCount.current}/${BLINK_CONFIRMATION_FRAMES}`;
                ctx.fillText(confirmationText, 20, 160); 
              }
              
              // Draw EAR history graph
              drawEARGraph(ctx, earHistory);
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

  // Helper function to draw all facial landmarks for debugging
  const drawAllFacialLandmarks = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number) => {
    ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
    landmarks.forEach((point, index) => {
      if (index % 5 === 0) { // Draw every 5th point to avoid overcrowding
        const x = width - point[0]; // Flip X for mirrored video
        const y = point[1];
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };
  
  // Draw eye regions specifically
  const drawEyeRegions = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number) => {
    // Left eye landmark indices
    const leftEyeIndices = [33, 133, 159, 160, 161, 144, 145, 153, 154, 155];
    // Right eye landmark indices
    const rightEyeIndices = [263, 362, 385, 386, 387, 373, 374, 380, 381, 382];
    
    // Draw left eye region
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 2;
    leftEyeIndices.forEach(index => {
      if (index < landmarks.length) {
        const x = width - landmarks[index][0]; // Flip X for mirrored video
        const y = landmarks[index][1];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.stroke();
        // Add index label for debugging
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "8px Arial";
        ctx.fillText(`${index}`, x + 5, y);
      }
    });
    
    // Draw right eye region
    ctx.strokeStyle = "#FFFF00";
    rightEyeIndices.forEach(index => {
      if (index < landmarks.length) {
        const x = width - landmarks[index][0]; // Flip X for mirrored video
        const y = landmarks[index][1];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.stroke();
        // Add index label for debugging
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "8px Arial";
        ctx.fillText(`${index}`, x + 5, y);
      }
    });
  };
  
  // Draw EAR history graph
  const drawEARGraph = (ctx: CanvasRenderingContext2D, history: number[]) => {
    if (history.length < 2) return;
    
    const graphWidth = 300;
    const graphHeight = 100;
    const x = canvasRef.current!.width - graphWidth - 20;
    const y = 20;
    
    // Draw background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(x, y, graphWidth, graphHeight);
    
    // Draw threshold line
    ctx.strokeStyle = "#FF3333";
    ctx.lineWidth = 1;
    const thresholdY = y + graphHeight - (EAR_THRESHOLD * graphHeight * 2); // Scale for visibility
    ctx.beginPath();
    ctx.moveTo(x, thresholdY);
    ctx.lineTo(x + graphWidth, thresholdY);
    ctx.stroke();
    
    // Draw EAR history line
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const step = graphWidth / (history.length - 1);
    
    history.forEach((ear, i) => {
      // Scale the EAR values for better visibility (typical EAR is 0.2-0.4)
      const scaledEAR = ear * 2;
      const pointX = x + (i * step);
      const pointY = y + graphHeight - (scaledEAR * graphHeight);
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    });
    
    ctx.stroke();
    
    // Add label
    ctx.font = "12px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("EAR History", x + 10, y + 15);
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
    <div className="w-[400px] h-[300px] bg-[#F5ECD7] relative overflow-hidden rounded-lg border-2 border-[#5D4037]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      
      {/* Single eye design overlay when webcam is not active */}
      {!isTracking && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F5ECD7]">
          <div className="relative w-48 h-48 rounded-full bg-white border-4 border-[#5D4037] flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full bg-[#5D4037]"></div>
            <div className="absolute w-8 h-8 rounded-full bg-white top-[52px] left-[52px]"></div>
          </div>
        </div>
      )}
      
      {/* Add status overlay */}
      {(!isTracking || isModelLoading) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute bottom-4 text-center p-2 max-w-xs">
            <p className="text-lg font-medium mb-2 text-[#5D4037]">{detectionStatus}</p>
            {isModelLoading && (
              <div className="w-8 h-8 border-2 border-t-transparent border-[#5D4037] rounded-full animate-spin mx-auto"></div>
            )}
          </div>
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
      
      {/* Removed blink counter as requested */}
    </div>
  );
};

export default WebcamView;
