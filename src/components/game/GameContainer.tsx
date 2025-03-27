import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import WebcamView from "./WebcamView";
import DollCharacter from "./DollCharacter";
import GameStatus from "./GameStatus";
import { Button } from "../ui/button";
import { Play, Camera, AlertTriangle, Clock } from "lucide-react";

interface GameContainerProps {
  totalRounds?: number;
  initialRound?: number;
}

const GameContainer = ({
  totalRounds = 5,
  initialRound = 1,
}: GameContainerProps) => {
  const [currentRound, setCurrentRound] = useState(initialRound);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isLookingAtPlayer, setIsLookingAtPlayer] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameTime, setGameTime] = useState(0); // Time in seconds
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const difficultyRef = useRef<number>(1); // Difficulty multiplier

  // Mock eye tracking data for demonstration
  const [eyeTrackingData, setEyeTrackingData] = useState<{
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    isBlink: boolean;
  }>({
    leftEye: { x: 320, y: 240 },
    rightEye: { x: 360, y: 240 },
    isBlink: false,
  });

  const handleWebcamStart = useCallback(() => {
    setIsWebcamActive(true);
    console.log("Webcam started, setting active to true");
  }, []);

  const handleWebcamStop = useCallback(() => {
    setIsWebcamActive(false);
    setIsGameStarted(false);
    // Clear game timer if running
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    // Reset game time
    setGameTime(0);
    setTimeRemaining(180);
    difficultyRef.current = 1;
  }, []);

  const handleStartGame = useCallback(() => {
    if (isWebcamActive) {
      setIsGameStarted(true);
      setGameTime(0);
      setTimeRemaining(180);
      difficultyRef.current = 1;
      
      // Start with doll facing away from player
      setIsLookingAtPlayer(false);
      
      // Start the game timer
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
      
      gameTimerRef.current = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          // Update difficulty every 30 seconds
          if (newTime % 30 === 0 && newTime > 0) {
            difficultyRef.current += 0.5; // Increase difficulty
            console.log(`Difficulty increased to ${difficultyRef.current}`);
          }
          return newTime;
        });
        
        setTimeRemaining(prev => {
          const newTimeRemaining = prev - 1;
          if (newTimeRemaining <= 0) {
            // Player wins if they survive 3 minutes
            setIsVictory(true);
            setIsGameStarted(false);
            if (gameTimerRef.current) {
              clearInterval(gameTimerRef.current);
              gameTimerRef.current = null;
            }
            return 0;
          }
          return newTimeRemaining;
        });
      }, 1000);
      
      // Start the doll turning cycle
      setTimeout(() => {
        setIsLookingAtPlayer(true);
      }, 2000);
    }
  }, [isWebcamActive]);

  const handleRetry = useCallback(() => {
    setCurrentRound(1);
    setIsGameOver(false);
    setIsVictory(false);
    setIsGameStarted(false);
    setIsLookingAtPlayer(false);
    setGameTime(0);
    setTimeRemaining(180);
    difficultyRef.current = 1;
    
    // Clear game timer if running
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, []);

  const handleDollAnimationComplete = useCallback(() => {
    // Toggle doll state after animation completes
    if (!isGameOver && !isVictory && isGameStarted) {
      const currentDifficulty = difficultyRef.current;
      
      // Calculate timing based on current difficulty and whether doll is looking at player
      let delay: number;
      
      if (isLookingAtPlayer) {
        // When looking at player, stay longer as difficulty increases
        // Base delay: 2-4 seconds, multiplied by difficulty factor
        const baseDelay = Math.random() * 2000 + 2000;
        delay = baseDelay * currentDifficulty;
        // Cap the maximum delay at 10 seconds
        delay = Math.min(delay, 10000);
      } else {
        // When facing away, use a consistent shorter delay (1-2 seconds)
        delay = Math.random() * 1000 + 1000;
      }
      
      setTimeout(() => {
        setIsLookingAtPlayer((prev) => !prev);
      }, delay);
    }
  }, [isGameOver, isVictory, isGameStarted, isLookingAtPlayer]);

  // Check if player blinked while doll was looking
  useEffect(() => {
    if (isGameStarted && isLookingAtPlayer && eyeTrackingData.isBlink) {
      console.log("Player blinked while doll was looking!");
      setIsGameOver(true);
      setIsGameStarted(false);
      
      // Clear game timer
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    }
  }, [isGameStarted, isLookingAtPlayer, eyeTrackingData.isBlink]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center p-4">
      {/* Round indicator */}
      <div className="mb-8 max-w-[1200px] w-full">
        <div className="bg-[#5D4037]/90 text-[#F5ECD7] px-6 py-3 rounded-lg flex items-center gap-2 w-fit">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="#F5ECD7"/>
              <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="#F5ECD7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-lg font-bold">Don't Blink Challenge!</span>
          </div>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex justify-center gap-6 max-w-[1200px] w-full">
        {/* Webcam panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#F5ECD7] rounded-lg p-6 flex-1 flex flex-col items-center shadow-lg border-4 border-[#5D4037]">
          <WebcamView
            onWebcamStart={handleWebcamStart}
            onWebcamStop={handleWebcamStop}
            isTracking={isWebcamActive}
            eyeTrackingData={eyeTrackingData}
            onEyeDataUpdate={setEyeTrackingData}
          />

          {!isWebcamActive && (
            <Button 
              onClick={handleWebcamStart}
              className="mt-4 bg-[#E6C28C] hover:bg-[#D4A76A] text-[#5D4037] border-2 border-[#5D4037] font-bold px-4 py-2 flex items-center gap-2 rounded-md"
            >
              <Camera className="w-5 h-5" />
              Start Camera
            </Button>
          )}

          {isWebcamActive && !isGameStarted && !isGameOver && !isVictory && (
            <Button 
              onClick={handleStartGame}
              className="mt-4 bg-[#E6C28C] hover:bg-[#D4A76A] text-[#5D4037] border-2 border-[#5D4037] font-bold px-4 py-2 flex items-center gap-2 rounded-md"
            >
              <Play className="w-5 h-5" />
              Start Game
            </Button>
          )}

          {isGameStarted && !isGameOver && !isVictory && (
            <div className="mt-4 bg-[#5D4037] text-[#F5ECD7] px-4 py-3 rounded-md w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-bold">Time Remaining:</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-xl font-mono">{formatTime(timeRemaining)}</span>
                </div>
              </div>
              <div className="w-full bg-[#3E2723] h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#E5A953]" 
                  style={{ width: `${(timeRemaining / 180) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Doll character panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#F5ECD7] rounded-lg p-6 flex-1 flex flex-col items-center shadow-lg border-4 border-[#5D4037]">
          <DollCharacter
            isLookingAtPlayer={isLookingAtPlayer}
            onAnimationComplete={handleDollAnimationComplete}
          />

          {isGameStarted && isLookingAtPlayer && (
            <div className="mt-4 bg-[#E5A953] text-[#5D4037] px-4 py-3 rounded-md w-full text-center">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xl font-bold">DOLL TURNING!</span>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="font-bold text-lg">DON'T BLINK!</div>
            </div>
          )}
          
          {isGameStarted && !isLookingAtPlayer && (
            <div className="mt-4 bg-[#4CAF50]/80 text-white px-4 py-3 rounded-md w-full text-center">
              <div className="font-bold text-lg">SAFE TO BLINK</div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Game progress bar */}
      <div className="mt-8 max-w-[1200px] w-full">
        <div className="flex items-center gap-4">
          <div className="text-[#5D4037] font-bold">Game Progress: {Math.round((gameTime / 180) * 100)}%</div>
          <div className="flex-1 h-4 bg-[#5D4037]/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#E5A953]" 
              style={{ width: `${(gameTime / 180) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="text-right text-[#5D4037] mt-2">
          2024 Squint Game. Blink at your own risk.
        </div>
      </div>

      <GameStatus
        currentRound={currentRound}
        totalRounds={totalRounds}
        isGameOver={isGameOver}
        isVictory={isVictory}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default GameContainer;
