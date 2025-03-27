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
    <div className="relative w-[300px] h-[400px] bg-white/80 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
        {isLookingAtPlayer ? (
          // Front image when looking at player
          <motion.div
            key="looking"
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="relative w-[250px] h-[350px] flex items-center justify-center"
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
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="relative w-[250px] h-[350px] flex items-center justify-center"
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
