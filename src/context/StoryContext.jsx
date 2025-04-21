"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import audioService from "../services/audioService"
import narrationService from "../services/narrationService"

const StoryContext = createContext()

const initialState = {
  currentNode: null,
  inventory: {},
  variables: {},
  darkMode: false,
  isLoadingNode: false,
  error: null,
  history: [],
  audio: {
    isMuted: false,
    volume: 0.5,
    musicVolume: 0.3,
    effectsVolume: 0.7,
  },
  narration: {
    enabled: false,
    voiceIndex: 0,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    autoplay: true,
  },
}

const storyReducer = (state, action) => {
  switch (action.type) {
    case "SET_CURRENT_NODE":
      return {
        ...state,
        currentNode: action.payload,
        history: [...state.history, action.payload.id],
        isLoadingNode: false,
        error: null,
      }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoadingNode: false,
      }

    case "SET_LOADING":
      return {
        ...state,
        isLoadingNode: true,
        error: null,
      }

    case "APPLY_EFFECTS":
      const newInventory = { ...state.inventory }
      const newVariables = { ...state.variables }

      action.payload.forEach((effect) => {
        // Parse effects like "inventory.torch = true" or "variables.courage += 1"
        const [target, operation] = effect.split(/\s*=\s*|\s*\+=\s*|\s*-=\s*/)
        const [category, key] = target.split(".")

        if (effect.includes("+=")) {
          if (category === "inventory") {
            newInventory[key] = (newInventory[key] || 0) + Number.parseInt(operation)
          } else if (category === "variables") {
            newVariables[key] = (newVariables[key] || 0) + Number.parseInt(operation)
          }
        } else if (effect.includes("-=")) {
          if (category === "inventory") {
            newInventory[key] = (newInventory[key] || 0) - Number.parseInt(operation)
          } else if (category === "variables") {
            newVariables[key] = (newVariables[key] || 0) - Number.parseInt(operation)
          }
        } else {
          // Handle boolean or string assignments
          const value = operation === "true" ? true : operation === "false" ? false : operation

          if (category === "inventory") {
            newInventory[key] = value
          } else if (category === "variables") {
            newVariables[key] = value
          }
        }
      })

      return {
        ...state,
        inventory: newInventory,
        variables: newVariables,
      }

    case "TOGGLE_DARK_MODE":
      return {
        ...state,
        darkMode: !state.darkMode,
      }

    case "RESET_GAME":
      return {
        ...initialState,
        darkMode: state.darkMode, // Preserve dark mode setting
        audio: state.audio, // Preserve audio settings
        narration: state.narration, // Preserve narration settings
      }

    case "LOAD_STATE":
      return {
        ...action.payload,
      }

    case "TOGGLE_MUTE":
      const isMuted = audioService.toggleMute()
      return {
        ...state,
        audio: {
          ...state.audio,
          isMuted,
        },
      }

    case "SET_VOLUME":
      audioService.setVolume(action.payload)
      return {
        ...state,
        audio: {
          ...state.audio,
          volume: action.payload,
        },
      }

    case "SET_MUSIC_VOLUME":
      audioService.setMusicVolume(action.payload)
      return {
        ...state,
        audio: {
          ...state.audio,
          musicVolume: action.payload,
        },
      }

    case "SET_EFFECTS_VOLUME":
      audioService.setEffectsVolume(action.payload)
      return {
        ...state,
        audio: {
          ...state.audio,
          effectsVolume: action.payload,
        },
      }

    case "TOGGLE_NARRATION":
      return {
        ...state,
        narration: {
          ...state.narration,
          enabled: !state.narration.enabled,
        },
      }

    case "SET_NARRATION_VOICE":
      return {
        ...state,
        narration: {
          ...state.narration,
          voiceIndex: action.payload,
        },
      }

    case "SET_NARRATION_RATE":
      narrationService.setRate(action.payload)
      return {
        ...state,
        narration: {
          ...state.narration,
          rate: action.payload,
        },
      }

    case "SET_NARRATION_PITCH":
      narrationService.setPitch(action.payload)
      return {
        ...state,
        narration: {
          ...state.narration,
          pitch: action.payload,
        },
      }

    case "SET_NARRATION_VOLUME":
      narrationService.setVolume(action.payload)
      return {
        ...state,
        narration: {
          ...state.narration,
          volume: action.payload,
        },
      }

    case "TOGGLE_NARRATION_AUTOPLAY":
      return {
        ...state,
        narration: {
          ...state.narration,
          autoplay: !state.narration.autoplay,
        },
      }

    default:
      return state
  }
}

export const StoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storyReducer, initialState)

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("storyState")
    if (savedState) {
      dispatch({ type: "LOAD_STATE", payload: JSON.parse(savedState) })
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("storyState", JSON.stringify(state))
  }, [state])

  return <StoryContext.Provider value={{ state, dispatch }}>{children}</StoryContext.Provider>
}

export const useStoryContext = () => {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error("useStoryContext must be used within a StoryProvider")
  }
  return context
}
