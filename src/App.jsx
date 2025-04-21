import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./pages/Home.jsx"
import StoryPage from "./pages/StoryPage.jsx"
import { useStoryContext } from "./context/StoryContext.jsx"
import { useEffect } from "react"

const App = () => {
  const { state, dispatch } = useStoryContext()

  // Load state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem("storyState")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        dispatch({ type: "LOAD_STATE", payload: parsedState })
      } catch (error) {
        console.error("Failed to parse saved state:", error)
      }
    }
  }, [dispatch])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("storyState", JSON.stringify(state))
  }, [state])

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/story/:nodeId",
      element: <StoryPage />,
    },
  ])

  return <RouterProvider router={router} />
}

export default App
