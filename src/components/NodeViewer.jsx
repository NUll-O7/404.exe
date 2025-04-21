"use client"

import { useEffect, useState, useRef } from "react"
import { useStoryContext } from "../context/StoryContext.jsx"
import audioService from "../services/audioService.js"
import narrationService from "../services/narrationService.js"
import { Play, Pause, StopCircle } from "lucide-react"
import BackgroundScene from "./BackgroundScene.jsx"
import { motion, AnimatePresence } from "framer-motion"

const NodeViewer = ({ node }) => {
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isNarrating, setIsNarrating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showFullText, setShowFullText] = useState(false)
  const { state } = useStoryContext()
  const typingIntervalRef = useRef(null)
  const textContainerRef = useRef(null)

  // Set up narration callbacks
  useEffect(() => {
    if (narrationService.checkSupport()) {
      narrationService.initialize()
    }
  }, [])

  useEffect(() => {
    if (!node) return

    // Reset typing animation when node changes
    setTypedText("")
    setIsTyping(true)
    setShowFullText(false)

    // Initialize audio service (must be done after user interaction)
    audioService.initialize()

    // Play background music if specified in the node
    if (node.backgroundMusic) {
      audioService.playBackgroundMusic(node.backgroundMusic)
    }

    // Play ambient sound if specified in the node
    if (node.ambientSound) {
      audioService.playSoundEffect(node.ambientSound, 0.3)
    }

    // Play entry sound effect if specified
    if (node.entrySoundEffect) {
      audioService.playSoundEffect(node.entrySoundEffect)
    }

    // Auto-narrate if enabled and supported
    if (state.narration.enabled && state.narration.autoplay && narrationService.checkSupport()) {
      narrationService.speak(node.text, node)
    }

    let index = 0
    const text = node.text
    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        setTypedText((prev) => prev + text.charAt(index))

        // Play typing sound effect occasionally
        if (Math.random() < 0.1 && node.typingSoundEffect) {
          audioService.playSoundEffect(node.typingSoundEffect, 0.2)
        }

        index++
      } else {
        clearInterval(typingIntervalRef.current)
        setIsTyping(false)
      }
    }, 30) // Adjust typing speed as needed

    return () => {
      clearInterval(typingIntervalRef.current)
      // Don't stop narration when component unmounts, as it might be due to a re-render
    }
  }, [node, state.narration.enabled, state.narration.autoplay])

  const handlePlayNarration = () => {
    if (isPaused) {
      narrationService.resume()
    } else {
      narrationService.speak(node.text, node)
    }
  }

  const handlePauseNarration = () => {
    narrationService.pause()
  }

  const handleStopNarration = () => {
    narrationService.stop()
  }

  const handleShowFullText = () => {
    clearInterval(typingIntervalRef.current)
    setTypedText(node.text)
    setIsTyping(false)
    setShowFullText(true)
  }

  if (!node)
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="prose dark:prose-invert max-w-none mb-6"
      >
        <BackgroundScene node={node} />

        {state.narration.enabled && narrationService.checkSupport() && (
          <div className="flex items-center space-x-2 mb-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
            {!isNarrating || isPaused ? (
              <button
                onClick={handlePlayNarration}
                className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                aria-label="Play narration"
              >
                <Play size={16} />
              </button>
            ) : (
              <button
                onClick={handlePauseNarration}
                className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                aria-label="Pause narration"
              >
                <Pause size={16} />
              </button>
            )}

            {isNarrating && (
              <button
                onClick={handleStopNarration}
                className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                aria-label="Stop narration"
              >
                <StopCircle size={16} />
              </button>
            )}

            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isNarrating ? (isPaused ? "Narration paused" : "Narrating...") : "Narration available"}
            </span>
          </div>
        )}

        <motion.div
          ref={textContainerRef}
          className="min-h-[200px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="whitespace-pre-line">
            {typedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>

          {isTyping && !showFullText && (
            <button
              onClick={handleShowFullText}
              className="mt-4 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Show all text
            </button>
          )}
        </motion.div>

        {node.audio && (
          <div className="mt-4">
            <audio controls className="w-full">
              <source src={node.audio} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default NodeViewer
