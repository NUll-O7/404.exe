"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "../components/Header.jsx"
import NodeViewer from "../components/NodeViewer.jsx"
import ChoiceButton from "../components/ChoiceButton.jsx"
import InventoryDisplay from "../components/InventoryDisplay.jsx"
import { useStoryContext } from "../context/StoryContext.jsx"
import { fetchNode } from "../services/api.js"
import audioService from "../services/audioService.js"
import { motion, AnimatePresence } from "framer-motion"

const StoryPage = () => {
  const router = useRouter()
  const params = useParams()
  const nodeId = params?.nodeId || ""
  const { state, dispatch } = useStoryContext()
  const { currentNode, isLoadingNode, error } = state
  const [transitionState, setTransitionState] = useState("idle") // idle, exiting, entering

  useEffect(() => {
    // Initialize audio on component mount (requires user interaction)
    audioService.initialize()

    const loadNode = async () => {
      // Special case for 'continue' - navigate to the last node in history
      if (nodeId === "continue") {
        const lastNodeId = state.history[state.history.length - 1] || "start"
        router.replace(`/story/${lastNodeId}`)
        return
      }

      // If we already have this node loaded, don't fetch it again
      if (currentNode && currentNode.id === nodeId) return

      try {
        const node = await fetchNode(nodeId)
        dispatch({ type: "SET_CURRENT_NODE", payload: node })
      } catch (err) {
        console.error("Error loading node:", err)
        // Play error sound
        audioService.playSoundEffect("/sounds/error.mp3")
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to load story node. Please try again.",
        })
      }
    }

    loadNode()
  }, [nodeId, dispatch, currentNode, router, state.history])

  const handleChoiceSelect = async (choice) => {
    // Start transition animation
    setTransitionState("exiting")

    // Play selection sound effect
    audioService.playSoundEffect("/sounds/select.mp3")

    // Apply effects from the choice
    if (choice.effects && choice.effects.length > 0) {
      dispatch({ type: "APPLY_EFFECTS", payload: choice.effects })
    }

    // Wait for exit animation
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Navigate to the next node
    router.push(`/story/${choice.next}`)

    // Set entering state for new node
    setTransitionState("entering")

    // Reset state after animation completes
    setTimeout(() => {
      setTransitionState("idle")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLoadingNode ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your adventure...</p>
            </div>
          ) : error ? (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p>{error}</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNode?.id || "empty"}
                initial={transitionState === "entering" ? { opacity: 0, y: 50 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={transitionState === "exiting" ? { opacity: 0, y: -50 } : false}
                transition={{ duration: 0.3 }}
              >
                <NodeViewer node={currentNode} />

                <InventoryDisplay />

                {currentNode && currentNode.choices && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">What will you do?</h3>
                    {currentNode.choices.map((choice, index) => (
                      <ChoiceButton key={index} choice={choice} onSelect={handleChoiceSelect} />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default StoryPage
