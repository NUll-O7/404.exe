"use client"

import { useState } from "react"
import { useStoryContext } from "../context/StoryContext.jsx"
import audioService from "../services/audioService.js"
import { motion } from "framer-motion"

const ChoiceButton = ({ choice, onSelect }) => {
  const { state } = useStoryContext()
  const [showTooltip, setShowTooltip] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Check if all conditions for this choice are met
  const isValid = () => {
    if (!choice.conditions || choice.conditions.length === 0) return true

    return choice.conditions.every((condition) => {
      // Parse conditions like "inventory.torch = true" or "variables.courage > 5"
      const [left, operator, right] = condition.split(/\s*(=|!=|>|<|>=|<=)\s*/)
      const [category, key] = left.split(".")

      let leftValue
      if (category === "inventory") {
        leftValue = state.inventory[key]
      } else if (category === "variables") {
        leftValue = state.variables[key]
      }

      // Convert right side to appropriate type
      let rightValue = right
      if (right === "true") rightValue = true
      else if (right === "false") rightValue = false
      else if (!isNaN(right)) rightValue = Number.parseFloat(right)

      switch (operator) {
        case "=":
          return leftValue === rightValue
        case "!=":
          return leftValue !== rightValue
        case ">":
          return leftValue > rightValue
        case "<":
          return leftValue < rightValue
        case ">=":
          return leftValue >= rightValue
        case "<=":
          return leftValue <= rightValue
        default:
          return false
      }
    })
  }

  const valid = isValid()

  const handleMouseEnter = () => {
    if (!valid && choice.conditions && choice.conditions.length > 0) {
      setShowTooltip(true)
    }
    setIsHovered(true)

    // Play hover sound effect
    audioService.playSoundEffect("/sounds/hover.mp3", 0.2)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
    setIsHovered(false)
  }

  const handleClick = () => {
    if (valid) {
      // Play selection sound effect
      audioService.playSoundEffect("/sounds/select.mp3")
      onSelect(choice)
    } else {
      // Play invalid selection sound
      audioService.playSoundEffect("/sounds/invalid.mp3")
    }
  }

  return (
    <div className="relative mb-2">
      <motion.button
        onClick={handleClick}
        disabled={!valid}
        className={`w-full text-left p-4 rounded-lg transition-colors ${
          valid
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: valid ? 1.02 : 1 }}
        whileTap={{ scale: valid ? 0.98 : 1 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <div className="flex-grow">{choice.label}</div>
          {valid && isHovered && (
            <motion.div
              className="ml-2 text-white"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.div>
          )}
        </div>
      </motion.button>

      {showTooltip && (
        <motion.div
          className="absolute bottom-full left-0 mb-2 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-10 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-semibold mb-1">Requirements not met:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {choice.conditions.map((condition, index) => (
              <li key={index} className="text-gray-300">
                {condition}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

export default ChoiceButton
