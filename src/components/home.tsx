import React, { useState, useEffect } from "react";
import GameContainer from "./game/GameContainer";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { HelpCircle, RefreshCw, XIcon } from "lucide-react";
import SplashScreen from "./SplashScreen";

const Home = () => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenSplash = localStorage.getItem("squintGames_hasSeenSplash");

    if (!hasSeenSplash) {
      // First visit, show splash screen
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    // Mark that user has seen the splash screen
    localStorage.setItem("squintGames_hasSeenSplash", "true");
    setShowSplash(false);
  };

  const resetSplashScreen = () => {
    localStorage.removeItem("squintGames_hasSeenSplash");
    setShowSplash(true);
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
          <Button variant="outline" className="text-gray-700 hover:bg-gray-100">
            <HelpCircle className="w-4 h-4 mr-2" />
            How to Play
          </Button>
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
