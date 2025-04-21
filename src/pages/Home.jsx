"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "../components/Header.jsx"
import { useStoryContext } from "../context/StoryContext.jsx"
import audioService from "../services/audioService.js"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Play, RotateCcw, ArrowRight } from "lucide-react"

const Home = () => {
  const { dispatch, state } = useStoryContext()
  const [showIntro, setShowIntro] = useState(true)
  const hasSavedGame = state.history.length > 0

  useEffect(() => {
    // Initialize audio on component mount (requires user interaction)
    const initAudio = () => {
      audioService.initialize()
      audioService.playBackgroundMusic("/music/title-theme.mp3")
      document.removeEventListener("click", initAudio)
    }

    document.addEventListener("click", initAudio)

    return () => {
      document.removeEventListener("click", initAudio)
    }
  }, [])

  const handleStartNewGame = () => {
    dispatch({ type: "RESET_GAME" })
    audioService.playSoundEffect("/sounds/start-game.mp3")
  }

  const handleContinueGame = () => {
    audioService.playSoundEffect("/sounds/continue-game.mp3")
  }

  const toggleIntro = () => {
    setShowIntro(!showIntro)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-64 mb-6 rounded-lg overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] bg-cover bg-center mix-blend-overlay"></div>

            <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-2 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Interactive Story Engine
              </motion.h1>
              <motion.p
                className="text-lg text-center max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Where your choices shape the narrative
              </motion.p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                {showIntro ? "Welcome, Adventurer" : "Game Modes"}
              </h2>
              <button
                onClick={toggleIntro}
                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
              >
                {showIntro ? "Game Modes" : "Introduction"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {showIntro ? (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="prose dark:prose-invert max-w-none mb-6"
                >
                  <p>
                    Welcome to the Interactive Story Engine, where your choices shape the narrative. Embark on an
                    adventure where every decision matters and multiple paths await.
                  </p>

                  <p>
                    You find yourself at the edge of the mysterious Whispering Woods, tasked with finding the Crystal of
                    Eternity to save your village from a terrible curse. But beware - the forest holds many secrets, and
                    not all who enter return to tell their tales.
                  </p>

                  <p>
                    Your inventory, skills, and previous choices will determine which paths are available to you. Choose
                    wisely, for the fate of your people rests in your hands.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="modes"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="prose dark:prose-invert max-w-none mb-6"
                >
                  <p>You can experience stories in two modes:</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                      <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-300">Static Mode</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Pre-written narratives with branching paths. Experience a carefully crafted story with
                        consistent quality and pacing.
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                      <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-300">AI Mode</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        Dynamic storytelling powered by artificial intelligence, creating unique experiences each time
                        you play. Every adventure will be different!
                      </p>
                    </div>
                  </div>

                  <p className="mt-4">
                    Toggle between modes using the switch in the header. Your progress is automatically saved, so you
                    can continue your adventure later.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/story/start"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                  onClick={handleStartNewGame}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start New Adventure
                </Link>
              </motion.div>

              {hasSavedGame && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/story/continue"
                    className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                    onClick={handleContinueGame}
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Continue
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                  <span className="text-green-600 dark:text-green-300 text-lg">🧩</span>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-800 dark:text-white">Branching Narrative</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Every choice matters and leads to different story paths
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                  <span className="text-blue-600 dark:text-blue-300 text-lg">🎒</span>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-800 dark:text-white">Inventory System</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Collect and use items that affect your journey
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                  <span className="text-purple-600 dark:text-purple-300 text-lg">🎭</span>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-800 dark:text-white">Character Development</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your attributes evolve based on your decisions
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-3">
                  <span className="text-amber-600 dark:text-amber-300 text-lg">🔊</span>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-800 dark:text-white">Immersive Audio</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Background music, sound effects, and voice narration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Home
