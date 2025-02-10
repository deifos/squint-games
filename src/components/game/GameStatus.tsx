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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-background">
      <Card className="p-4 shadow-lg border-2">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-lg">
              Round {currentRound}/{totalRounds}
            </Badge>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {!isGameOver && !isVictory && (
                <Badge variant="secondary" className="bg-green-500 text-white">
                  Game in Progress
                </Badge>
              )}
            </motion.div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      <AlertDialog open={isGameOver || isVictory}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isVictory ? "🎉 Victory!" : "💀 Game Over!"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isVictory
                ? "Congratulations! You have completed all rounds successfully!"
                : "You blinked at the wrong time! The doll caught you."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onRetry}>
              {isVictory ? "Play Again" : "Try Again"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameStatus;
