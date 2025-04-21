import axios from "axios"

// Use Next.js environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export const fetchNode = async (nodeId) => {
  try {
    // For development, if no API URL is provided, use local data
    if (API_URL === "/api") {
      // Import the local story data
      const { default: storyData } = await import("../data/story.json")

      // Find the node with the matching ID
      const node = storyData.find((node) => node.id === nodeId)

      if (!node) {
        throw new Error(`Node with ID ${nodeId} not found in local data`)
      }

      // Simulate network delay for development
      await new Promise((resolve) => setTimeout(resolve, 300))

      return node
    }

    // If API URL is provided, fetch from the API
    const response = await axios.get(`${API_URL}/story/${nodeId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching node:", error)
    throw error
  }
}
