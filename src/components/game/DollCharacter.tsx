import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DollCharacterProps {
  isLookingAtPlayer: boolean;
  onAnimationComplete?: () => void;
}

const DollCharacter: React.FC<DollCharacterProps> = ({
  isLookingAtPlayer,
  onAnimationComplete = () => {},
}) => {
  return (
    <div
      className="relative w-full h-[450px] rounded-lg overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: 'url("/assets/dollbg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      }}
    >
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
              className="relative w-[350px] h-[350px] flex items-center justify-center"
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
                src="/assets/front.png"
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
              className="relative w-[350px] h-[350px] flex items-center justify-center"
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
                src="/assets/back.png"
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
