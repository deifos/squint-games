import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import WebcamView from "./WebcamView";
import DollCharacter from "./DollCharacter";
import GameStatus from "./GameStatus";
import { Button } from "../ui/button";
import { Play } from "lucide-react";

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
  }, []);

  const handleStartGame = useCallback(() => {
    if (isWebcamActive) {
      setIsGameStarted(true);
      // Start with doll facing away from player
      setIsLookingAtPlayer(false);
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
  }, []);

  const handleDollAnimationComplete = useCallback(() => {
    // Toggle doll state after animation completes
    if (!isGameOver && !isVictory && isGameStarted) {
      setTimeout(() => {
        setIsLookingAtPlayer((prev) => !prev);
      }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
    }
  }, [isGameOver, isVictory, isGameStarted]);

  // Check if player blinked while doll was looking
  useEffect(() => {
    if (isGameStarted && isLookingAtPlayer && eyeTrackingData.isBlink) {
      console.log("Player blinked while doll was looking!");
      setIsGameOver(true);
    }
  }, [isGameStarted, isLookingAtPlayer, eyeTrackingData.isBlink]);

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[1200px] h-[800px] bg-white/80 backdrop-blur-sm p-8 flex flex-col items-center justify-center gap-8 rounded-xl"
      >
        <div className="mt-4 mb-4 w-full flex justify-center">
          <GameStatus
            currentRound={currentRound}
            totalRounds={totalRounds}
            isGameOver={isGameOver}
            isVictory={isVictory}
            onRetry={handleRetry}
          />
        </div>

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
            className="flex flex-col items-center gap-4"
          >
            <DollCharacter
              isLookingAtPlayer={isLookingAtPlayer}
              onAnimationComplete={handleDollAnimationComplete}
            />
            
            {isWebcamActive && !isGameStarted && !isGameOver && !isVictory && (
              <Button 
                onClick={handleStartGame}
                className="mt-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-300 hover:bg-white/60 px-6 py-2 text-lg"
              >
                <Play className="w-5 h-5" />
                Start Game
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameContainer;
