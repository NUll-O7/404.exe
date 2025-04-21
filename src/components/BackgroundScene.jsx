"use client"

import { useEffect, useRef, useState } from "react"
import { useStoryContext } from "../context/StoryContext"

const BackgroundScene = ({ node }) => {
  const canvasRef = useRef(null)
  const requestRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const { state } = useStoryContext()
  const { darkMode } = state

  // Scene elements
  const [sceneElements, setSceneElements] = useState({
    backgroundImage: null,
    particles: [],
    ambientElements: [],
  })

  // Initialize scene based on node properties
  useEffect(() => {
    if (!node) return

    const newElements = {
      backgroundImage: null,
      particles: [],
      ambientElements: [],
    }

    // Create background image
    if (node.image) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = node.image
      img.onload = () => {
        newElements.backgroundImage = img
        setSceneElements((prev) => ({ ...prev, backgroundImage: img }))
        setLoaded(true)
      }
    } else {
      // Create a default background based on node type/description
      const sceneType = getSceneTypeFromNode(node)
      createDefaultBackground(newElements, sceneType)
      setSceneElements(newElements)
      setLoaded(true)
    }

    // Clean up animation frame on unmount
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [node])

  // Animation loop
  useEffect(() => {
    if (!loaded || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Resize canvas to fit container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      canvas.width = container.clientWidth
      canvas.height = 300 // Fixed height for background
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      if (sceneElements.backgroundImage) {
        drawBackground(ctx, canvas, sceneElements.backgroundImage)
      } else {
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        if (darkMode) {
          gradient.addColorStop(0, "#0f172a")
          gradient.addColorStop(1, "#1e293b")
        } else {
          gradient.addColorStop(0, "#e0f2fe")
          gradient.addColorStop(1, "#bae6fd")
        }
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Update and draw particles
      updateParticles(sceneElements.particles, canvas)
      drawParticles(ctx, sceneElements.particles, darkMode)

      // Draw ambient elements
      drawAmbientElements(ctx, sceneElements.ambientElements, canvas, darkMode)

      // Continue animation loop
      requestRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(requestRef.current)
    }
  }, [loaded, sceneElements, darkMode])

  // Helper function to determine scene type from node content
  const getSceneTypeFromNode = (node) => {
    const text = node.text.toLowerCase()

    if (text.includes("forest") || text.includes("tree") || text.includes("wood")) {
      return "forest"
    } else if (text.includes("cave") || text.includes("cavern") || text.includes("underground")) {
      return "cave"
    } else if (text.includes("river") || text.includes("stream") || text.includes("water")) {
      return "water"
    } else if (text.includes("mountain") || text.includes("hill") || text.includes("cliff")) {
      return "mountain"
    } else if (text.includes("village") || text.includes("town") || text.includes("house")) {
      return "village"
    } else {
      return "default"
    }
  }

  // Create default background elements based on scene type
  const createDefaultBackground = (elements, sceneType) => {
    // Add particles based on scene type
    switch (sceneType) {
      case "forest":
        // Add falling leaves
        for (let i = 0; i < 20; i++) {
          elements.particles.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 5,
            speedX: Math.random() * 0.3 - 0.15,
            speedY: 0.1 + Math.random() * 0.2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 2 - 1,
            type: "leaf",
            color: Math.random() > 0.5 ? "#4ade80" : "#a3e635",
          })
        }

        // Add trees to ambient elements
        for (let i = 0; i < 8; i++) {
          elements.ambientElements.push({
            x: i * 12.5,
            y: 70 + Math.random() * 10,
            type: "tree",
            size: 30 + Math.random() * 40,
          })
        }
        break

      case "cave":
        // Add floating dust particles
        for (let i = 0; i < 30; i++) {
          elements.particles.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1 + Math.random() * 2,
            speedX: Math.random() * 0.1 - 0.05,
            speedY: -0.05 - Math.random() * 0.1,
            type: "dust",
            color: "#94a3b8",
          })
        }

        // Add stalactites
        for (let i = 0; i < 10; i++) {
          elements.ambientElements.push({
            x: i * 10 + Math.random() * 5,
            y: 0,
            type: "stalactite",
            size: 20 + Math.random() * 40,
          })
        }
        break

      case "water":
        // Add water ripples
        for (let i = 0; i < 15; i++) {
          elements.particles.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 5 + Math.random() * 15,
            speedX: Math.random() * 0.2 - 0.1,
            speedY: 0,
            type: "ripple",
            color: "#0ea5e9",
            age: Math.random() * 100,
            maxAge: 100 + Math.random() * 100,
          })
        }
        break

      case "mountain":
        // Add flying birds
        for (let i = 0; i < 8; i++) {
          elements.particles.push({
            x: Math.random() * 100,
            y: 10 + Math.random() * 40,
            size: 3 + Math.random() * 5,
            speedX: 0.2 + Math.random() * 0.3,
            speedY: Math.sin(Math.random() * Math.PI) * 0.1,
            type: "bird",
            wingPhase: Math.random() * Math.PI * 2,
          })
        }

        // Add mountains
        for (let i = 0; i < 5; i++) {
          elements.ambientElements.push({
            x: i * 25,
            y: 60 + Math.random() * 10,
            type: "mountain",
            size: 50 + Math.random() * 50,
          })
        }
        break

      case "village":
        // Add smoke particles
        for (let i = 0; i < 10; i++) {
          elements.particles.push({
            x: 20 + Math.random() * 60,
            y: 40 + Math.random() * 30,
            size: 5 + Math.random() * 10,
            speedX: Math.random() * 0.1 - 0.05,
            speedY: -0.1 - Math.random() * 0.1,
            type: "smoke",
            color: "#cbd5e1",
            age: Math.random() * 100,
            maxAge: 100 + Math.random() * 100,
          })
        }

        // Add houses
        for (let i = 0; i < 6; i++) {
          elements.ambientElements.push({
            x: 10 + i * 15,
            y: 70,
            type: "house",
            size: 20 + Math.random() * 15,
          })
        }
        break

      default:
        // Add generic floating particles
        for (let i = 0; i < 20; i++) {
          elements.particles.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1 + Math.random() * 3,
            speedX: Math.random() * 0.2 - 0.1,
            speedY: Math.random() * 0.2 - 0.1,
            type: "particle",
            color: "#60a5fa",
          })
        }
    }
  }

  // Draw background image with proper scaling
  const drawBackground = (ctx, canvas, image) => {
    const canvasRatio = canvas.width / canvas.height
    const imgRatio = image.width / image.height

    let drawWidth, drawHeight, offsetX, offsetY

    if (canvasRatio > imgRatio) {
      // Canvas is wider than image
      drawWidth = canvas.width
      drawHeight = canvas.width / imgRatio
      offsetX = 0
      offsetY = (canvas.height - drawHeight) / 2
    } else {
      // Canvas is taller than image
      drawHeight = canvas.height
      drawWidth = canvas.height * imgRatio
      offsetX = (canvas.width - drawWidth) / 2
      offsetY = 0
    }

    // Apply a slight darkening effect in dark mode
    if (darkMode) {
      ctx.filter = "brightness(0.7)"
    } else {
      ctx.filter = "none"
    }

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
    ctx.filter = "none"
  }

  // Update particle positions
  const updateParticles = (particles, canvas) => {
    particles.forEach((particle) => {
      // Update position
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Handle rotation if applicable
      if (particle.rotationSpeed) {
        particle.rotation += particle.rotationSpeed
      }

      // Handle age if applicable
      if (particle.age !== undefined) {
        particle.age++
        if (particle.age > particle.maxAge) {
          // Reset particle
          particle.age = 0
          particle.x = Math.random() * 100
          particle.y = Math.random() * 100
          particle.size = particle.type === "ripple" ? 5 + Math.random() * 15 : 5 + Math.random() * 10
        }
      }

      // Handle special particle behaviors
      switch (particle.type) {
        case "leaf":
          // Add slight wobble to leaf movement
          particle.x += Math.sin(particle.y * 0.1) * 0.1

          // Reset if out of bounds
          if (particle.y > 100) {
            particle.y = -5
            particle.x = Math.random() * 100
          }
          break

        case "bird":
          // Update wing flapping animation
          particle.wingPhase += 0.1

          // Reset if out of bounds
          if (particle.x > 100) {
            particle.x = -5
            particle.y = 10 + Math.random() * 40
          }
          break

        case "ripple":
          // Ripples grow and fade
          if (particle.age > particle.maxAge * 0.5) {
            particle.size *= 0.99
          } else {
            particle.size *= 1.01
          }
          break

        default:
          // Wrap around screen edges
          if (particle.x < 0) particle.x = 100
          if (particle.x > 100) particle.x = 0
          if (particle.y < 0) particle.y = 100
          if (particle.y > 100) particle.y = 0
      }
    })
  }

  // Draw particles
  const drawParticles = (ctx, particles, darkMode) => {
    particles.forEach((particle) => {
      // Convert percentage positions to canvas coordinates
      const x = (particle.x / 100) * ctx.canvas.width
      const y = (particle.y / 100) * ctx.canvas.height

      ctx.save()

      // Handle different particle types
      switch (particle.type) {
        case "leaf":
          // Draw a leaf shape
          ctx.translate(x, y)
          ctx.rotate((particle.rotation * Math.PI) / 180)

          ctx.fillStyle = darkMode ? adjustColorForDarkMode(particle.color) : particle.color

          ctx.beginPath()
          ctx.ellipse(0, 0, particle.size, particle.size / 2, 0, 0, Math.PI * 2)
          ctx.fill()

          // Add leaf vein
          ctx.strokeStyle = darkMode ? "#1e293b" : "#065f46"
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(-particle.size, 0)
          ctx.lineTo(particle.size, 0)
          ctx.stroke()
          break

        case "dust":
          // Draw dust particle with glow
          ctx.globalAlpha = 0.7
          ctx.fillStyle = darkMode ? "#94a3b8" : "#cbd5e1"

          // Add glow effect
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size * 2)
          gradient.addColorStop(0, darkMode ? "rgba(148, 163, 184, 0.7)" : "rgba(203, 213, 225, 0.7)")
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2)
          ctx.fill()

          // Draw center
          ctx.fillStyle = darkMode ? "#e2e8f0" : "#f8fafc"
          ctx.beginPath()
          ctx.arc(x, y, particle.size / 2, 0, Math.PI * 2)
          ctx.fill()

          ctx.globalAlpha = 1
          break

        case "ripple":
          // Draw water ripple
          ctx.strokeStyle = darkMode
            ? `rgba(56, 189, 248, ${0.8 - (particle.age / particle.maxAge) * 0.8})`
            : `rgba(14, 165, 233, ${0.8 - (particle.age / particle.maxAge) * 0.8})`
          ctx.lineWidth = 1.5

          ctx.beginPath()
          ctx.arc(x, y, particle.size, 0, Math.PI * 2)
          ctx.stroke()
          break

        case "bird":
          // Draw a simple bird
          ctx.fillStyle = darkMode ? "#94a3b8" : "#1e293b"

          // Draw wings
          const wingY = Math.sin(particle.wingPhase) * particle.size

          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x - particle.size, y + wingY)
          ctx.lineTo(x, y)
          ctx.lineTo(x + particle.size, y + wingY)
          ctx.fill()
          break

        case "smoke":
          // Draw smoke particle
          ctx.globalAlpha = Math.max(0, 1 - particle.age / particle.maxAge)

          ctx.fillStyle = darkMode ? "#475569" : particle.color
          ctx.beginPath()
          ctx.arc(x, y, particle.size * (0.5 + (particle.age / particle.maxAge) * 0.5), 0, Math.PI * 2)
          ctx.fill()

          ctx.globalAlpha = 1
          break

        default:
          // Draw generic particle
          ctx.fillStyle = darkMode ? adjustColorForDarkMode(particle.color) : particle.color

          ctx.beginPath()
          ctx.arc(x, y, particle.size, 0, Math.PI * 2)
          ctx.fill()
      }

      ctx.restore()
    })
  }

  // Draw ambient elements like trees, mountains, houses
  const drawAmbientElements = (ctx, elements, canvas, darkMode) => {
    elements.forEach((element) => {
      // Convert percentage positions to canvas coordinates
      const x = (element.x / 100) * canvas.width
      const y = (element.y / 100) * canvas.height

      ctx.save()

      switch (element.type) {
        case "tree":
          // Draw a tree
          // Tree trunk
          ctx.fillStyle = darkMode ? "#78350f" : "#92400e"
          ctx.fillRect(x - element.size / 10, y - element.size / 3, element.size / 5, element.size / 2)

          // Tree foliage
          ctx.fillStyle = darkMode ? "#166534" : "#16a34a"
          ctx.beginPath()
          ctx.moveTo(x, y - element.size)
          ctx.lineTo(x + element.size / 2, y - element.size / 3)
          ctx.lineTo(x - element.size / 2, y - element.size / 3)
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(x, y - element.size * 0.9)
          ctx.lineTo(x + element.size / 1.7, y - element.size / 5)
          ctx.lineTo(x - element.size / 1.7, y - element.size / 5)
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(x, y - element.size * 0.8)
          ctx.lineTo(x + element.size / 1.5, y)
          ctx.lineTo(x - element.size / 1.5, y)
          ctx.fill()
          break

        case "mountain":
          // Draw a mountain
          ctx.fillStyle = darkMode ? "#334155" : "#64748b"
          ctx.beginPath()
          ctx.moveTo(x - element.size, y)
          ctx.lineTo(x, y - element.size)
          ctx.lineTo(x + element.size, y)
          ctx.fill()

          // Snow cap
          ctx.fillStyle = darkMode ? "#cbd5e1" : "#f8fafc"
          ctx.beginPath()
          ctx.moveTo(x - element.size / 4, y - element.size * 0.7)
          ctx.lineTo(x, y - element.size)
          ctx.lineTo(x + element.size / 4, y - element.size * 0.7)
          ctx.fill()
          break

        case "house":
          // Draw a simple house
          // House body
          ctx.fillStyle = darkMode ? "#475569" : "#cbd5e1"
          ctx.fillRect(x - element.size / 2, y - element.size / 2, element.size, element.size / 2)

          // Roof
          ctx.fillStyle = darkMode ? "#1e293b" : "#94a3b8"
          ctx.beginPath()
          ctx.moveTo(x - element.size / 1.8, y - element.size / 2)
          ctx.lineTo(x, y - element.size)
          ctx.lineTo(x + element.size / 1.8, y - element.size / 2)
          ctx.fill()

          // Door
          ctx.fillStyle = darkMode ? "#78350f" : "#92400e"
          ctx.fillRect(x - element.size / 10, y - element.size / 4, element.size / 5, element.size / 4)

          // Window
          ctx.fillStyle = darkMode ? "#0c4a6e" : "#7dd3fc"
          ctx.fillRect(x + element.size / 5, y - element.size / 3, element.size / 5, element.size / 6)
          break

        case "stalactite":
          // Draw a stalactite
          ctx.fillStyle = darkMode ? "#334155" : "#64748b"
          ctx.beginPath()
          ctx.moveTo(x - element.size / 6, y)
          ctx.lineTo(x, y + element.size)
          ctx.lineTo(x + element.size / 6, y)
          ctx.fill()
          break
      }

      ctx.restore()
    })
  }

  // Helper function to adjust colors for dark mode
  const adjustColorForDarkMode = (color) => {
    // Simple implementation - could be more sophisticated
    if (color.startsWith("#")) {
      return color // For now, return the same color
    }
    return color
  }

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden mb-4 relative">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

export default BackgroundScene
