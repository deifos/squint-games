import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import WebcamView from "./WebcamView";
import DollCharacter from "./DollCharacter";
import GameStatus from "./GameStatus";

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
  const [isLookingAtPlayer, setIsLookingAtPlayer] = useState(true);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

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
  }, []);

  const handleRetry = useCallback(() => {
    setCurrentRound(1);
    setIsGameOver(false);
    setIsVictory(false);
    setIsLookingAtPlayer(true);
  }, []);

  const handleDollAnimationComplete = useCallback(() => {
    // Toggle doll state after animation completes
    if (!isGameOver && !isVictory) {
      setTimeout(
        () => {
          setIsLookingAtPlayer((prev) => !prev);
        },
        Math.random() * 2000 + 1000,
      ); // Random delay between 1-3 seconds
    }
  }, [isGameOver, isVictory]);

  return (
    <div className="relative w-full h-full min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[1200px] h-[800px] bg-gray-900 rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center gap-8"
      >
        <GameStatus
          currentRound={currentRound}
          totalRounds={totalRounds}
          isGameOver={isGameOver}
          isVictory={isVictory}
          onRetry={handleRetry}
        />

        <div className="flex items-center justify-center gap-8 w-full">
          <WebcamView
            onWebcamStart={handleWebcamStart}
            onWebcamStop={handleWebcamStop}
            isTracking={isWebcamActive}
            eyeTrackingData={eyeTrackingData}
            onEyeDataUpdate={setEyeTrackingData}
          />

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <DollCharacter
              isLookingAtPlayer={isLookingAtPlayer}
              onAnimationComplete={handleDollAnimationComplete}
            />
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm">
          {isWebcamActive ? (
            <p>Don't blink while the doll is watching!</p>
          ) : (
            <p>Start your webcam to begin the game</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GameContainer;
