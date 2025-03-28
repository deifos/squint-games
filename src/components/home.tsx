import React, { useState, useEffect, useRef } from "react";
import GameContainer from "./game/GameContainer";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { RefreshCw, XIcon } from "lucide-react";
import SplashScreen from "./SplashScreen";

const Home = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenSplash = localStorage.getItem("squintGames_hasSeenSplash");
    const savedMuteState = localStorage.getItem("squintGames_isMuted");

    // Initialize audio
    audioRef.current = new Audio("/sounds/soundtrack.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2; // Set volume to 20% of maximum
    
    // Set volume based on saved preference
    if (savedMuteState === "true") {
      setIsMuted(true);
    } else {
      setIsMuted(false);
      // Only play if not first visit or splash screen is not showing
      if (!hasSeenSplash || !showSplash) {
        audioRef.current.play().catch(err => {
          console.log("Audio playback failed:", err);
        });
      }
    }

    if (!hasSeenSplash) {
      // First visit, show splash screen
      setShowSplash(true);
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Effect to handle mute/unmute
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.pause();
    } else if (!showSplash) {
      // Only play if splash screen is not showing
      audioRef.current.play().catch(err => {
        console.log("Audio playback failed:", err);
      });
    }
    
    // Save mute preference
    localStorage.setItem("squintGames_isMuted", isMuted.toString());
  }, [isMuted, showSplash]);

  const handleSplashComplete = () => {
    // Mark that user has seen the splash screen
    localStorage.setItem("squintGames_hasSeenSplash", "true");
    setShowSplash(false);
    
    // Start playing music after splash screen if not muted
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log("Audio playback failed:", err);
      });
    }
  };

  const resetSplashScreen = () => {
    localStorage.removeItem("squintGames_hasSeenSplash");
    setShowSplash(true);
    
    // Pause audio during splash screen
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleSound = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="min-h-screen w-full text-gray-800 relative"
      style={{
        backgroundImage: 'url("/assets/bg2.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-40 shadow-md"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/brand.svg"
              alt="Squint Game Logo"
              className="h-12"
            />
          </div>
          <button 
            onClick={toggleSound}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            className="bg-[#F5ECD7] hover:bg-[#E6C28C] text-[#5D4037] border-4 border-[#5D4037] font-bold px-5 py-2 rounded-md text-lg flex items-center gap-2 transition-colors"
          >
            <span className="text-xl">{isMuted ? "🔇" : "🔊"}</span>
            <span>{isMuted ? "Sound Off" : "Sound On"}</span>
          </button>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <GameContainer totalRounds={5} initialRound={1} />
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-40 shadow-md bg-white"
      >
        <div className="container mx-auto px-4 py-3 flex flex-col items-center justify-center">
          <div className="text-sm text-gray-600 flex gap-2">
            {new Date().getFullYear()} Squint Game. built by vlad, find me on{" "}
            <a
              href="https://x.com/diefosv"
              target="_blank"
              rel="noopener noreferrer"
              className=" flex"
            >
              <XIcon className="w-4 h-4 " />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetSplashScreen}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Splash
            </button>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
