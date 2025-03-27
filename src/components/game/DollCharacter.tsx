import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DollCharacterProps {
  isLookingAtPlayer?: boolean;
  onAnimationComplete?: () => void;
}

const DollCharacter = ({
  isLookingAtPlayer = true,
  onAnimationComplete = () => {},
}: DollCharacterProps) => {
  return (
    <div className="w-[400px] h-[300px] bg-[#F5ECD7] relative overflow-hidden rounded-lg border-2 border-[#5D4037] flex items-center justify-center">
      {/* Emotion icons in the corners */}
      <div className="absolute top-4 left-4 text-2xl">😠</div>
      <div className="absolute top-4 right-4 text-2xl">😠</div>
      <div className="absolute bottom-4 left-4 text-2xl">😠</div>
      <div className="absolute bottom-4 right-4 text-2xl">😠</div>
      
      <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
        {isLookingAtPlayer ? (
          // Front image when looking at player
          <motion.div
            key="looking"
            className="relative flex flex-col items-center justify-center h-full w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="relative w-[200px] h-[200px] flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <img 
                src="/assets/front.JPG" 
                alt="Front facing character" 
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </motion.div>
        ) : (
          // Back image when not looking
          <motion.div
            key="not-looking"
            className="relative flex flex-col items-center justify-center h-full w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="relative w-[200px] h-[200px] flex items-center justify-center"
              animate={{
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <img 
                src="/assets/back.JPG" 
                alt="Back facing character" 
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DollCharacter;
