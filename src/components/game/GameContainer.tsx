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
  const [countdownValue, setCountdownValue] = useState(5); // 5-second countdown timer
  const [isCountingDown, setIsCountingDown] = useState(false); // Countdown state
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const difficultyRef = useRef<number>(1); // Difficulty multiplier
  const dollTimerRef = useRef<NodeJS.Timeout | null>(null); // Reference for doll turning timer

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
    setIsCountingDown(false);
    // Clear game timer if running
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    // Clear countdown timer if running
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    // Clear doll timer if running
    if (dollTimerRef.current) {
      clearTimeout(dollTimerRef.current);
      dollTimerRef.current = null;
    }
    // Reset game time and countdown
    setGameTime(0);
    setTimeRemaining(180);
    setCountdownValue(5);
    difficultyRef.current = 1;
  }, []);

  const startCountdown = useCallback(() => {
    if (isWebcamActive) {
      setIsCountingDown(true);
      setCountdownValue(5);
      
      // Start the countdown timer
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      
      countdownTimerRef.current = setInterval(() => {
        setCountdownValue(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            // When countdown reaches zero, start the actual game
            setIsCountingDown(false);
            setIsGameStarted(true);
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            startGameTimer();
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }
  }, [isWebcamActive]);

  // Start the game timer and doll turning cycle
  const startGameTimer = useCallback(() => {
    console.log("Starting game timer and doll turning cycle");
    setGameTime(0);
    setTimeRemaining(180);
    difficultyRef.current = 1;
    
    // Start with doll facing away from player (Green Light)
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
    
    // Start the first turn cycle - after 2 seconds, turn to face player (Red Light)
    console.log("Starting first turn cycle: Doll is facing away (Green Light)");
    setTimeout(() => {
      console.log("First turn: Doll turning to face player (Red Light)");
      setIsLookingAtPlayer(true); // Turn to face player (Red Light)
      scheduleDollTurn();
    }, 2000);
  }, []);

  // Function to schedule the next doll turn
  const scheduleDollTurn = useCallback(() => {
    // Clear any existing doll timer
    if (dollTimerRef.current) {
      clearTimeout(dollTimerRef.current);
      dollTimerRef.current = null;
    }
    
    // If game is over, don't schedule more turns
    if (!isGameStarted || isGameOver || isVictory) {
      console.log("Game is not active, not scheduling next turn");
      return;
    }
    
    // Calculate timing based on current difficulty and whether doll is looking at player
    const currentDifficulty = difficultyRef.current;
    let delay: number;
    
    if (isLookingAtPlayer) {
      // RED LIGHT: Doll is facing player, players must not blink
      // Duration increases with difficulty
      const baseDelay = Math.random() * 2000 + 3000; // 3-5 seconds base
      delay = baseDelay * currentDifficulty;
      delay = Math.min(delay, 12000); // Cap at 12 seconds max
      console.log(`RED LIGHT: Doll facing player for ${delay/1000} seconds (Difficulty: ${currentDifficulty})`);  
    } else {
      // GREEN LIGHT: Doll is facing away, players can blink
      // Duration decreases with difficulty but has a minimum
      const baseDelay = Math.random() * 1500 + 1500; // 1.5-3 seconds base
      delay = Math.max(baseDelay / (currentDifficulty * 0.5), 1500); // Minimum 1.5 seconds
      console.log(`GREEN LIGHT: Doll facing away for ${delay/1000} seconds (Difficulty: ${currentDifficulty})`);
    }
    
    // Schedule the next turn
    console.log(`Scheduling turn from ${isLookingAtPlayer ? 'Red Light' : 'Green Light'} to ${!isLookingAtPlayer ? 'Red Light' : 'Green Light'} in ${delay/1000} seconds`);
    
    dollTimerRef.current = setTimeout(() => {
      // Only change the doll's state if the game is still active
      if (isGameStarted && !isGameOver && !isVictory) {
        console.log(`Executing turn: Changing from ${isLookingAtPlayer ? 'Red Light' : 'Green Light'} to ${!isLookingAtPlayer ? 'Red Light' : 'Green Light'}`);
        setIsLookingAtPlayer(prev => !prev);
        scheduleDollTurn();
      }
    }, delay);
  }, [isLookingAtPlayer, isGameStarted, isGameOver, isVictory]);

  // Handle doll animation completion
  const handleDollAnimationComplete = useCallback(() => {
    console.log(`Doll animation complete. Current state: ${isLookingAtPlayer ? 'Red Light (facing player)' : 'Green Light (facing away)'}`);
    
    // Only schedule the next turn if the game is still active
    if (isGameStarted && !isGameOver && !isVictory) {
      console.log('Animation complete, scheduling next turn...');
      scheduleDollTurn();
    }
  }, [isGameStarted, isGameOver, isVictory, isLookingAtPlayer, scheduleDollTurn]);

  const handleStartGame = useCallback(() => {
    if (isWebcamActive) {
      startCountdown(); // Start the countdown instead of immediately starting the game
    }
  }, [isWebcamActive, startCountdown]);

  const handleRetry = useCallback(() => {
    setCurrentRound(1);
    setIsGameOver(false);
    setIsVictory(false);
    setIsGameStarted(false);
    setIsLookingAtPlayer(false);
    setGameTime(0);
    setTimeRemaining(180);
    setCountdownValue(5);
    difficultyRef.current = 1;
    
    // Clear game timer if running
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    // Clear countdown timer if running
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    // Clear doll timer if running
    if (dollTimerRef.current) {
      clearTimeout(dollTimerRef.current);
      dollTimerRef.current = null;
    }
  }, []);

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
      
      // Clear doll timer
      if (dollTimerRef.current) {
        clearTimeout(dollTimerRef.current);
        dollTimerRef.current = null;
      }
    }
  }, [isGameStarted, isLookingAtPlayer, eyeTrackingData.isBlink]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (dollTimerRef.current) {
        clearTimeout(dollTimerRef.current);
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
          className="bg-[#F5ECD7] rounded-lg p-6 flex-1 flex flex-col items-center shadow-lg border-4 border-[#5D4037] relative">
          <WebcamView
            onWebcamStart={handleWebcamStart}
            onWebcamStop={handleWebcamStop}
            isTracking={isWebcamActive}
            eyeTrackingData={eyeTrackingData}
            onEyeDataUpdate={setEyeTrackingData}
          />
            
          {/* Countdown overlay */}
          {isCountingDown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-lg">
              <div className="text-8xl font-bold text-white">{countdownValue}</div>
            </div>
          )}
            
          {!isWebcamActive && (
            <Button 
              onClick={handleWebcamStart}
              className="mt-4 bg-[#E6C28C] hover:bg-[#D4A76A] text-[#5D4037] border-2 border-[#5D4037] flex items-center gap-2"
            >
              <Camera size={16} />
              Start Camera
            </Button>
          )}

          {!isGameStarted && !isCountingDown && isWebcamActive && (
            <Button
              onClick={handleStartGame}
              className="mt-4 bg-[#A1887F] hover:bg-[#8D6E63] text-white flex items-center gap-2"
            >
              <Play size={16} />
              Start Game
            </Button>
          )}

          {/* Game status display */}
          <div className="mt-4 w-full">
            <GameStatus
              isGameStarted={isGameStarted || isCountingDown}
              isGameOver={isGameOver}
              isVictory={isVictory}
              onRetry={handleRetry}
            />
          </div>
        </motion.div>

        {/* Doll character panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg flex-1 flex flex-col items-center shadow-lg border-4 border-[#5D4037] overflow-hidden relative">
          <DollCharacter 
            isLookingAtPlayer={isLookingAtPlayer} 
            onAnimationComplete={handleDollAnimationComplete}
          />

          {/* Alert overlay that's always present but only visible when needed */}
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${isGameStarted && isLookingAtPlayer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
            <div className="bg-[#E5A953] text-[#5D4037] px-4 py-3 w-full text-center shadow-md">
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xl font-bold">DOLL TURNING!</span>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="font-bold text-lg">DON'T BLINK!</div>
            </div>
          </div>
          
          {/* Safe to blink overlay */}
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${isGameStarted && !isLookingAtPlayer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
            <div className="bg-[#4CAF50]/80 text-white px-4 py-3 w-full text-center shadow-md">
              <div className="font-bold text-lg">SAFE TO BLINK</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Game progress bar */}
      <div className="mt-8 max-w-[1200px] w-full">
        <div className="bg-[#F5ECD7] rounded-lg p-4 shadow-lg border-4 border-[#5D4037]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[#5D4037] font-bold text-lg">
              Game Progress: {(isGameStarted || isCountingDown) ? Math.round((gameTime / 180) * 100) : 0}%
            </div>
            <div className="text-[#5D4037] font-bold flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {(isGameStarted || isCountingDown) ? formatTime(timeRemaining) : formatTime(180)}
            </div>
          </div>
          <div className="w-full h-6 bg-[#5D4037]/20 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-[#E5A953] transition-all duration-1000 ease-linear shadow-md"
              style={{ width: `${(isGameStarted || isCountingDown) ? (gameTime / 180) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="text-right text-[#5D4037] mt-2 text-sm">
            {new Date().getFullYear()} Squint Game. Blink at your own risk.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
