import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Clock } from "lucide-react";

interface GameStatusProps {
  currentRound?: number;
  totalRounds?: number;
  isGameStarted?: boolean;
  isGameOver?: boolean;
  isVictory?: boolean;
  onRetry?: () => void;
  timeRemaining?: number;
  totalTime?: number;
}

const GameStatus = ({
  currentRound = 1,
  totalRounds = 5,
  isGameStarted = false,
  isGameOver = false,
  isVictory = false,
  onRetry = () => {},
  timeRemaining = 180,
  totalTime = 180,
}: GameStatusProps) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate progress percentage
  const progressPercentage = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));

  return (
    <div className="w-full max-w-md">
      {/* Time remaining and progress bar */}
      {isGameStarted && !isGameOver && !isVictory && (
        <div className="mb-4 w-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-[#5D4037] font-medium">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="w-full bg-[#E6C28C]/30 rounded-full h-2.5">
            <div 
              className="bg-[#E6C28C] h-2.5 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <AlertDialog open={isGameOver || isVictory}>
        <AlertDialogContent className="bg-[#F5ECD7] border-4 border-[#5D4037] rounded-lg p-6 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-[#5D4037] font-bold text-center">
              {isVictory ? "🎉 Victory!" : "🙈 Game Over!"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-[#5D4037] text-center">
              {isVictory
                ? "Congratulations! You survived the full 3 minutes!"
                : "You blinked at the wrong time! The doll caught you."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center mt-4">
            <AlertDialogAction 
              onClick={onRetry}
              className="bg-[#E6C28C] hover:bg-[#D4A76A] text-[#5D4037] border-2 border-[#5D4037] font-bold px-6 py-2 rounded-md text-lg"
            >
              {isVictory ? "Play Again" : "Try Again"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameStatus;
