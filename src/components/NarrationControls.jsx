"use client"

import { useState, useEffect } from "react"
import { useStoryContext } from "../context/StoryContext.jsx"
import narrationService from "../services/narrationService.js"
import { Play, Pause, StopCircle, Settings } from "lucide-react"

const NarrationControls = ({ text }) => {
  const { state, dispatch } = useStoryContext()
  const [isNarrating, setIsNarrating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])

  useEffect(() => {
    // Initialize narration service if supported
    if (narrationService.checkSupport()) {
      narrationService.initialize()
    }
  }, [])

  useEffect(() => {
    if (narrationService.checkSupport()) {
      // Set up narration callbacks
      narrationService.setOnNarrationStart(() => {
        setIsNarrating(true)
        setIsPaused(false)
      })

      narrationService.setOnNarrationEnd(() => {
        setIsNarrating(false)
        setIsPaused(false)
      })

      narrationService.setOnNarrationPause(() => {
        setIsPaused(true)
      })

      narrationService.setOnNarrationResume(() => {
        setIsPaused(false)
      })

      // Get available voices
      setAvailableVoices(narrationService.getVoices())
    }
  }, [])

  const handlePlayNarration = () => {
    if (isPaused) {
      narrationService.resume()
    } else {
      narrationService.speak(text)
    }
  }

  const handlePauseNarration = () => {
    narrationService.pause()
  }

  const handleStopNarration = () => {
    narrationService.stop()
  }

  const handleVoiceChange = (e) => {
    dispatch({ type: "SET_NARRATION_VOICE", payload: Number.parseInt(e.target.value) })
  }

  const handleRateChange = (e) => {
    dispatch({ type: "SET_NARRATION_RATE", payload: Number.parseFloat(e.target.value) })
  }

  const handlePitchChange = (e) => {
    dispatch({ type: "SET_NARRATION_PITCH", payload: Number.parseFloat(e.target.value) })
  }

  const handleVolumeChange = (e) => {
    dispatch({ type: "SET_NARRATION_VOLUME", payload: Number.parseFloat(e.target.value) })
  }

  if (!state.narration.enabled || !narrationService.checkSupport()) {
    return null
  }

  return (
    <div className="mb-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {!isNarrating || isPaused ? (
            <button
              onClick={handlePlayNarration}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              aria-label="Play narration"
            >
              <Play size={18} />
            </button>
          ) : (
            <button
              onClick={handlePauseNarration}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              aria-label="Pause narration"
            >
              <Pause size={18} />
            </button>
          )}

          {isNarrating && (
            <button
              onClick={handleStopNarration}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
              aria-label="Stop narration"
            >
              <StopCircle size={18} />
            </button>
          )}

          <span className="text-sm text-gray-700 dark:text-gray-300">
            {isNarrating ? (isPaused ? "Paused" : "Narrating...") : "Ready to narrate"}
          </span>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Narration settings"
        >
          <Settings size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {showSettings && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voice</label>
            <select
              value={state.narration.voiceIndex}
              onChange={handleVoiceChange}
              className="w-full p-2 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
            >
              {availableVoices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Speed</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{state.narration.rate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={state.narration.rate}
                onChange={handleRateChange}
                className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pitch</label>
                <span className="text-xs text-gray-500 dark:text-gray-400">{state.narration.pitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={state.narration.pitch}
                onChange={handlePitchChange}
                className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Volume</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(state.narration.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.narration.volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default NarrationControls
