# 404.exe - Interactive Story Engine

An interactive story engine that allows users to navigate through a narrative with choices that affect the outcome. The application features AI-powered story generation using Google's Gemini AI.

## Features

- Interactive story navigation with multiple choices
- AI-powered story generation using Gemini AI
- Visual background scenes that change based on the story context
- Inventory system for collecting and using items
- Narration controls for text-to-speech
- Dark mode support
- Responsive design for various screen sizes

## Technologies Used

- React
- Vite
- React Router
- Tailwind CSS
- Google Generative AI (Gemini)
- Web Speech API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API key from Google AI Studio

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Usage

- Navigate to the home page to start a new story
- Make choices to progress through the narrative
- Collect items in your inventory
- Use the narration controls to have the story read aloud
- Toggle dark mode for a different visual experience

## Project Structure

- `src/components/` - UI components
- `src/context/` - React context for state management
- `src/data/` - Story data in JSON format
- `src/pages/` - Page components
- `src/services/` - API and service integrations

## License

MIT
