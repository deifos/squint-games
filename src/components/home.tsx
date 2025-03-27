import React from "react";
import GameContainer from "./game/GameContainer";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { HelpCircle } from "lucide-react";

const Home = () => {
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
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/brand.svg"
              alt="Squint Game Logo"
              className="h-8"
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
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-4"
      >
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          2024 Squint Game. Use a working webcam for the best experience.
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
