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
  return (
    <div className="w-full max-w-md">
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
