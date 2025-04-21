// Audio service to manage background music and sound effects
class AudioService {
  constructor() {
    this.backgroundMusic = null
    this.currentMusicSrc = null
    this.soundEffects = new Map()
    this.volume = 0.5
    this.musicVolume = 0.3
    this.effectsVolume = 0.7
    this.isMuted = false
    this.isInitialized = false
  }

  // Initialize audio context (must be called after user interaction)
  initialize() {
    if (this.isInitialized) return

    // Create background music element
    this.backgroundMusic = new Audio()
    this.backgroundMusic.loop = true
    this.backgroundMusic.volume = this.musicVolume * this.volume

    this.isInitialized = true
  }

  // Play background music with crossfade
  playBackgroundMusic(src) {
    if (!this.isInitialized) this.initialize()
    if (this.currentMusicSrc === src) return

    // Create new audio element for crossfade
    const newMusic = new Audio(src)
    newMusic.loop = true
    newMusic.volume = 0

    // Start playing new track
    newMusic.play().catch((err) => console.error("Error playing music:", err))

    // Crossfade
    const fadeInterval = setInterval(() => {
      // Fade out current music if it exists
      if (this.backgroundMusic && this.backgroundMusic.volume > 0.02) {
        this.backgroundMusic.volume = Math.max(0, this.backgroundMusic.volume - 0.05)
      }

      // Fade in new music
      if (newMusic.volume < this.musicVolume * this.volume - 0.05) {
        newMusic.volume = Math.min(this.musicVolume * this.volume, newMusic.volume + 0.05)
      } else {
        // Crossfade complete
        if (this.backgroundMusic) {
          this.backgroundMusic.pause()
        }
        this.backgroundMusic = newMusic
        this.currentMusicSrc = src
        clearInterval(fadeInterval)
      }
    }, 100)
  }

  // Play a sound effect
  playSoundEffect(src, volume = 1.0) {
    if (!this.isInitialized) this.initialize()
    if (this.isMuted) return

    // Reuse existing audio elements to avoid creating too many
    let sound = this.soundEffects.get(src)

    if (!sound || !sound.paused) {
      sound = new Audio(src)
      this.soundEffects.set(src, sound)
    }

    sound.volume = volume * this.effectsVolume * this.volume
    sound.currentTime = 0
    sound.play().catch((err) => console.error("Error playing sound effect:", err))
  }

  // Set master volume
  setVolume(volume) {
    this.volume = volume

    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume * this.volume
    }
  }

  // Set music volume
  setMusicVolume(volume) {
    this.musicVolume = volume

    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume * this.volume
    }
  }

  // Set effects volume
  setEffectsVolume(volume) {
    this.effectsVolume = volume
  }

  // Mute/unmute all audio
  toggleMute() {
    this.isMuted = !this.isMuted

    if (this.backgroundMusic) {
      this.backgroundMusic.muted = this.isMuted
    }

    return this.isMuted
  }

  // Stop all audio
  stopAll() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
    }

    this.soundEffects.forEach((sound) => {
      sound.pause()
    })
  }
}

// Create a singleton instance
const audioService = new AudioService()

export default audioService
