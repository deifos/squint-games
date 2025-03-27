import React, { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment, OrbitControls } from "@react-three/drei";
import { DollModel } from "./DollModel";

interface DollCharacterProps {
  isLookingAtPlayer: boolean;
  onAnimationComplete?: () => void;
}

const DollCharacter: React.FC<DollCharacterProps> = ({
  isLookingAtPlayer,
  onAnimationComplete = () => {},
}) => {
  const [use3DModel, setUse3DModel] = useState(true);
  const [modelError, setModelError] = useState(false);

  // Trigger animation complete callback when isLookingAtPlayer changes
  useEffect(() => {
    // Small delay to allow animation to start
    const timer = setTimeout(() => {
      console.log("Animation transition started, will complete soon");
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isLookingAtPlayer]);

  // Fallback to images if 3D model fails to load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (modelError) {
        setUse3DModel(false);
        console.log("Falling back to image-based doll due to 3D model error");
      }
    }, 3000); // Wait 3 seconds before falling back
    
    return () => clearTimeout(timer);
  }, [modelError]);

  // Fallback component to show while 3D model is loading
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-[#5D4037] text-xl font-bold">Loading Doll...</div>
    </div>
  );

  // Image-based doll display
  const ImageBasedDoll = () => (
    <>
      {isLookingAtPlayer ? (
        // Front image when looking at player
        <motion.div
          key="looking"
          className="relative flex flex-col items-center justify-center h-full w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onAnimationComplete={() => {
            console.log("Front-facing animation complete");
            onAnimationComplete();
          }}
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
          onAnimationComplete={() => {
            console.log("Back-facing animation complete");
            onAnimationComplete();
          }}
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
    </>
  );

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
        {use3DModel ? (
          <motion.div
            key={`3d-model-${isLookingAtPlayer ? 'front' : 'back'}`}
            className="relative flex flex-col items-center justify-center h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => {
              console.log(`3D model animation complete (${isLookingAtPlayer ? 'front' : 'back'})`); 
              onAnimationComplete();
            }}
          >
            <div className="w-full h-full">
              <Suspense fallback={<LoadingFallback />}>
                <ErrorBoundary onError={() => setModelError(true)}>
                  <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                    <DollModel isLookingAtPlayer={isLookingAtPlayer} />
                    <Environment preset="sunset" background={false} />
                  </Canvas>
                </ErrorBoundary>
              </Suspense>
            </div>
          </motion.div>
        ) : (
          <ImageBasedDoll />
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode, onError: () => void }> {
  componentDidCatch(error: any) {
    console.error("Error in 3D model:", error);
    this.props.onError();
  }

  render() {
    return this.props.children;
  }
}

export default DollCharacter;
