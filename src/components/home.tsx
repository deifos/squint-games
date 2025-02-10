import React from "react";
import GameContainer from "./game/GameContainer";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Gamepad2 } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen w-full bg-gray-950 text-white">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-pink-500" />
            <h1 className="text-xl font-bold">Squint Game</h1>
          </div>
          <Button
            variant="outline"
            className="border-pink-500 text-pink-500 hover:bg-pink-500/20"
          >
            How to Play
          </Button>
        </div>
      </motion.header>

      <main className="pt-20 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Don't Blink!</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Keep your eyes open when the doll is watching. Only blink when it
            turns away. Can you survive all rounds?
          </p>
        </motion.div>

        <GameContainer totalRounds={5} initialRound={1} />
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 py-4"
      >
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          © 2024 Squint Game. Use a working webcam for the best experience.
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
