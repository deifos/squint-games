import React from "react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { motion } from "framer-motion";

interface GameStatusProps {
  currentRound?: number;
  totalRounds?: number;
  isGameOver?: boolean;
  isVictory?: boolean;
  onRetry?: () => void;
}

const GameStatus = ({
  currentRound = 1,
  totalRounds = 5,
  isGameOver = false,
  isVictory = false,
  onRetry = () => {},
}: GameStatusProps) => {
  const progress = (currentRound / totalRounds) * 100;

  return (
    <div className="w-full max-w-md">
      <Card className="p-4 shadow-sm bg-white/80 backdrop-blur-sm border-none">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-lg text-gray-800 border-gray-300">
              Round {currentRound}/{totalRounds}
            </Badge>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {!isGameOver && !isVictory && (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                  Game in Progress
                </Badge>
              )}
            </motion.div>
          </div>

          <Progress 
            value={progress} 
            className="h-2 bg-gray-100" 
          />
        </div>
      </Card>

      <AlertDialog open={isGameOver || isVictory}>
        <AlertDialogContent className="bg-white/90 backdrop-blur-sm border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-gray-800">
              {isVictory ? "🎉 Victory!" : "🙈 Game Over!"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-gray-600">
              {isVictory
                ? "Congratulations! You have completed all rounds successfully!"
                : "You blinked at the wrong time! The monkey caught you."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={onRetry}
              className="bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
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
