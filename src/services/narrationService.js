// Narration service to manage text-to-speech functionality
class NarrationService {
  constructor() {
    // Initialize with default values
    this.isSupported = false;
    this.synth = null;
    this.utterance = null;
    this.isNarrating = false;
    this.isPaused = false;
    this.currentText = "";
    this.currentNode = null;
    this.onNarrationEnd = null;
    this.onNarrationStart = null;
    this.onNarrationPause = null;
    this.onNarrationResume = null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Check if speech synthesis is available
      this.isSupported = 'speechSynthesis' in window;
      
      if (this.isSupported) {
        this.synth = window.speechSynthesis;
      } else {
        console.warn("Speech synthesis is not supported in this environment");
      }
    }
  }

  // Initialize the narration service
  initialize() {
    if (!this.isSupported || !this.synth) return;
    
    // Load available voices
    this.loadVoices();

    // Some browsers need a delay to load voices
    const checkVoices = () => {
      if (this.voices.length === 0) {
        this.loadVoices();
        // Try again in a second if still no voices
        if (this.voices.length === 0) {
          setTimeout(checkVoices, 1000);
        }
      }
    };

    // Initial check with a small delay
    setTimeout(checkVoices, 100);

    // Listen for voiceschanged event (for Chrome)
    try {
      this.synth.addEventListener("voiceschanged", () => {
        this.loadVoices();
      });
    } catch (error) {
      console.warn("Error setting up voiceschanged listener:", error);
    }
  }

  // Load available voices
  loadVoices() {
    if (!this.isSupported || !this.synth) return;
    
    try {
      this.voices = this.synth.getVoices();

      // Set default voice (prefer English voices)
      if (this.voices.length > 0) {
        const englishVoices = this.voices.filter((voice) => voice.lang.includes("en-"));

        this.selectedVoice = englishVoices.length > 0 ? englishVoices[0] : this.voices[0];
      }
    } catch (error) {
      console.warn("Error loading voices:", error);
    }
  }

  // Get all available voices
  getVoices() {
    return this.isSupported ? this.voices : [];
  }

  // Set the voice to use for narration
  setVoice(voice) {
    if (!this.isSupported || !this.synth) return;
    
    this.selectedVoice = voice;

    // If currently narrating, update the voice
    if (this.isNarrating && this.utterance) {
      this.stop();
      this.speak(this.currentText, this.currentNode);
    }
  }

  // Set the speech rate (0.1 to 10)
  setRate(rate) {
    if (!this.isSupported || !this.synth) return;
    
    this.rate = rate;

    // If currently narrating, update the rate
    if (this.isNarrating && this.utterance) {
      this.utterance.rate = rate;
    }
  }

  // Set the speech pitch (0 to 2)
  setPitch(pitch) {
    if (!this.isSupported || !this.synth) return;
    
    this.pitch = pitch;

    // If currently narrating, update the pitch
    if (this.isNarrating && this.utterance) {
      this.utterance.pitch = pitch;
    }
  }

  // Set the speech volume (0 to 1)
  setVolume(volume) {
    if (!this.isSupported || !this.synth) return;
    
    this.volume = volume;

    // If currently narrating, update the volume
    if (this.isNarrating && this.utterance) {
      this.utterance.volume = volume;
    }
  }

  // Speak the provided text
  speak(text, node) {
    if (!this.isSupported || !this.synth) {
      console.warn("Speech synthesis is not supported in this environment");
      if (this.onNarrationEnd) this.onNarrationEnd();
      return;
    }

    if (!text) {
      console.warn("No text provided for speech synthesis");
      if (this.onNarrationEnd) this.onNarrationEnd();
      return;
    }
    
    // Save current text and node
    this.currentText = text;
    this.currentNode = node;

    // Cancel any ongoing speech
    this.stop();

    try {
      // Create a new utterance
      this.utterance = new SpeechSynthesisUtterance(text);

      // Set utterance properties
      if (this.selectedVoice) {
        this.utterance.voice = this.selectedVoice;
      }

      this.utterance.rate = this.rate;
      this.utterance.pitch = this.pitch;
      this.utterance.volume = this.volume;

      // Set up event handlers
      this.utterance.onstart = () => {
        this.isNarrating = true;
        this.isPaused = false;
        if (this.onNarrationStart) this.onNarrationStart();
      };

      this.utterance.onend = () => {
        this.isNarrating = false;
        this.isPaused = false;
        if (this.onNarrationEnd) this.onNarrationEnd();
      };

      this.utterance.onerror = (event) => {
        const errorMessage = event.error || 'Unknown error';
        console.error("Speech synthesis error:", errorMessage);
        // Log additional error details if available
        if (event.message) console.error("Error details:", event.message);
        this.isNarrating = false;
        this.isPaused = false;
        if (this.onNarrationEnd) this.onNarrationEnd();
      };

      // Ensure the speech synthesis service is ready
      if (this.synth.speaking) {
        this.synth.cancel();
      }

      // Start speaking with a small delay to ensure proper initialization
      setTimeout(() => {
        try {
          this.synth.speak(this.utterance);
        } catch (error) {
          console.error("Error starting speech synthesis:", error);
          this.isNarrating = false;
          this.isPaused = false;
          if (this.onNarrationEnd) this.onNarrationEnd();
        }
      }, 100);
    } catch (error) {
      console.error("Error in speech synthesis:", error);
      this.isNarrating = false;
      this.isPaused = false;
      if (this.onNarrationEnd) this.onNarrationEnd();
    }
  }

  // Pause the narration
  pause() {
    if (!this.isSupported || !this.synth) return;
    
    if (this.isNarrating && !this.isPaused) {
      try {
        this.synth.pause();
        this.isPaused = true;
        if (this.onNarrationPause) this.onNarrationPause();
      } catch (error) {
        console.error("Error pausing narration:", error);
      }
    }
  }

  // Resume the narration
  resume() {
    if (!this.isSupported || !this.synth) return;
    
    if (this.isNarrating && this.isPaused) {
      try {
        this.synth.resume();
        this.isPaused = false;
        if (this.onNarrationResume) this.onNarrationResume();
      } catch (error) {
        console.error("Error resuming narration:", error);
      }
    }
  }

  // Stop the narration
  stop() {
    if (!this.isSupported || !this.synth) return;
    
    try {
      this.synth.cancel();
      this.isNarrating = false;
      this.isPaused = false;
    } catch (error) {
      console.error("Error stopping narration:", error);
    }
  }

  // Check if speech synthesis is supported
  checkSupport() {
    return this.isSupported;
  }

  // Set callback for when narration ends
  setOnNarrationEnd(callback) {
    this.onNarrationEnd = callback;
  }

  // Set callback for when narration starts
  setOnNarrationStart(callback) {
    this.onNarrationStart = callback;
  }

  // Set callback for when narration is paused
  setOnNarrationPause(callback) {
    this.onNarrationPause = callback;
  }

  // Set callback for when narration is resumed
  setOnNarrationResume(callback) {
    this.onNarrationResume = callback;
  }
}

// Create a singleton instance
const narrationService = new NarrationService();

export default narrationService;
