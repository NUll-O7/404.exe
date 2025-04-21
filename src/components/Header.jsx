"use client"

import { useStoryContext } from "../context/StoryContext.jsx"
import Link from "next/link"
import { SunIcon, MoonIcon, VolumeIcon, Volume2Icon, VolumeXIcon, Mic, MicOff } from "lucide-react"
import { useState, useEffect } from "react"
import narrationService from "../services/narrationService.js"

const Header = () => {
  const { state, dispatch } = useStoryContext()
  const [showAudioControls, setShowAudioControls] = useState(false)
  const [showNarrationControls, setShowNarrationControls] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])
  const [narrationSupported, setNarrationSupported] = useState(false)

  useEffect(() => {
    // Check if narration is supported
    const isSupported = narrationService.checkSupport()
    setNarrationSupported(isSupported)

    // Initialize narration service if supported
    if (isSupported) {
      narrationService.initialize()
    }
  }, [])

  useEffect(() => {
    // Get initial voices if narration is supported
    if (narrationService.checkSupport()) {
      // Get initial voices
      setAvailableVoices(narrationService.getVoices())

      // Set up event listener for when voices are loaded
      const handleVoicesChanged = () => {
        setAvailableVoices(narrationService.getVoices())
      }

      // Some browsers need a timeout to load voices
      setTimeout(() => {
        setAvailableVoices(narrationService.getVoices())
      }, 1000)

      // Add event listener for voiceschanged
      if (window.speechSynthesis) {
        window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged)
      }

      // Clean up
      return () => {
        if (window.speechSynthesis) {
          window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged)
        }
      }
    }
  }, [])

  const handleDarkModeToggle = () => {
    dispatch({ type: "TOGGLE_DARK_MODE" })
  }

  const handleMuteToggle = () => {
    dispatch({ type: "TOGGLE_MUTE" })
  }

  const handleVolumeChange = (e) => {
    dispatch({ type: "SET_VOLUME", payload: Number.parseFloat(e.target.value) })
  }

  const handleMusicVolumeChange = (e) => {
    dispatch({ type: "SET_MUSIC_VOLUME", payload: Number.parseFloat(e.target.value) })
  }

  const handleEffectsVolumeChange = (e) => {
    dispatch({ type: "SET_EFFECTS_VOLUME", payload: Number.parseFloat(e.target.value) })
  }

  const handleNarrationToggle = () => {
    dispatch({ type: "TOGGLE_NARRATION" })
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

  const handleNarrationVolumeChange = (e) => {
    dispatch({ type: "SET_NARRATION_VOLUME", payload: Number.parseFloat(e.target.value) })
  }

  const handleAutoplayToggle = () => {
    dispatch({ type: "TOGGLE_NARRATION_AUTOPLAY" })
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          Interactive Story Engine
        </Link>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleDarkModeToggle}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {state.darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setShowAudioControls(!showAudioControls)
                setShowNarrationControls(false)
              }}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Audio settings"
            >
              {state.audio.isMuted ? (
                <VolumeXIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : state.audio.volume > 0.5 ? (
                <Volume2Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <VolumeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {showAudioControls && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio Settings</span>
                  <button
                    onClick={handleMuteToggle}
                    className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {state.audio.isMuted ? "Unmute" : "Mute"}
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Master Volume
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(state.audio.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.audio.volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>

                <div className="mb-3">
                  <div className="flex justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Music Volume
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(state.audio.musicVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.audio.musicVolume}
                    onChange={handleMusicVolumeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Effects Volume
                    </label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(state.audio.effectsVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={state.audio.effectsVolume}
                    onChange={handleEffectsVolumeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              </div>
            )}
          </div>

          {narrationSupported && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNarrationControls(!showNarrationControls)
                  setShowAudioControls(false)
                }}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Narration settings"
              >
                {state.narration.enabled ? (
                  <Mic className="h-5 w-5 text-blue-500" />
                ) : (
                  <MicOff className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {showNarrationControls && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Narration Settings</span>
                    <button
                      onClick={handleNarrationToggle}
                      className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {state.narration.enabled ? "Disable" : "Enable"}
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voice</label>
                    <select
                      value={state.narration.voiceIndex}
                      onChange={handleVoiceChange}
                      className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                      disabled={!state.narration.enabled}
                    >
                      {availableVoices.map((voice, index) => (
                        <option key={index} value={index}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Speed</label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {state.narration.rate.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={state.narration.rate}
                      onChange={handleRateChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      disabled={!state.narration.enabled}
                    />
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pitch</label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {state.narration.pitch.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={state.narration.pitch}
                      onChange={handlePitchChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      disabled={!state.narration.enabled}
                    />
                  </div>

                  <div className="mb-3">
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
                      onChange={handleNarrationVolumeChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      disabled={!state.narration.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-play narration</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={state.narration.autoplay}
                        onChange={handleAutoplayToggle}
                        disabled={!state.narration.enabled}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
