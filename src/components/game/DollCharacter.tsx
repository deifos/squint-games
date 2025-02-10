import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DollCharacterProps {
  isLookingAtPlayer?: boolean;
  onAnimationComplete?: () => void;
}

const DollCharacter = ({
  isLookingAtPlayer = true,
  onAnimationComplete = () => {},
}: DollCharacterProps) => {
  return (
    <div className="relative w-[300px] h-[400px] bg-white rounded-lg shadow-lg overflow-hidden">
      <motion.div
        className="w-full h-full"
        animate={{
          rotateY: isLookingAtPlayer ? 0 : 180,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        onAnimationComplete={onAnimationComplete}
      >
        {/* Doll face when looking at player */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full flex flex-col items-center justify-center",
            "[backface-visibility:hidden]",
          )}
        >
          <div className="w-32 h-32 rounded-full bg-pink-200 mb-4">
            {/* Eyes */}
            <div className="relative w-full h-full">
              <motion.div
                animate={{
                  scale: isLookingAtPlayer ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isLookingAtPlayer ? Infinity : 0,
                }}
                className="relative w-full h-full"
              >
                <div className="absolute left-4 top-12 w-6 h-6 rounded-full bg-black flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div className="absolute right-4 top-12 w-6 h-6 rounded-full bg-black flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                {/* Smile - now animated */}
                <motion.div
                  animate={{
                    scaleX: isLookingAtPlayer ? 1.2 : 0.8,
                    scaleY: isLookingAtPlayer ? 1.1 : 0.9,
                  }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-8 border-b-4 border-black rounded-b-full"
                ></motion.div>
              </motion.div>
            </div>
          </div>
          <div className="w-48 h-48 bg-red-400 rounded-t-full">
            {/* Dress */}
          </div>
        </div>

        {/* Doll back when turned away */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full flex flex-col items-center justify-center",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
          )}
        >
          <div className="w-32 h-32 rounded-full bg-pink-300 mb-4">
            {/* Back of head */}
          </div>
          <div className="w-48 h-48 bg-red-500 rounded-t-full">
            {/* Back of dress */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DollCharacter;
