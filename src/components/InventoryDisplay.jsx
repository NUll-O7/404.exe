"use client"

import { useStoryContext } from "../context/StoryContext.jsx"
import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown, ChevronUp, Package, Brain } from "lucide-react"

const InventoryDisplay = () => {
  const { state } = useStoryContext()
  const { inventory, variables } = state
  const [isExpanded, setIsExpanded] = useState(false)

  const hasInventory = Object.keys(inventory).length > 0
  const hasVariables = Object.keys(variables).length > 0

  if (!hasInventory && !hasVariables) return null

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6 shadow-md border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleExpand}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <span className="mr-2">Status</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </h3>

        <div className="flex space-x-2">
          {hasInventory && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Package className="h-4 w-4 mr-1" />
              <span>{Object.keys(inventory).length}</span>
            </div>
          )}

          {hasVariables && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Brain className="h-4 w-4 mr-1" />
              <span>{Object.keys(variables).length}</span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <motion.div
          className="mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {hasInventory && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                Inventory
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(inventory).map(([item, value], index) => (
                  <motion.div
                    key={item}
                    className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-300 text-xs font-bold">
                        {item.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {item.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {hasVariables && (
            <div>
              <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-1">
                Attributes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(variables).map(([variable, value], index) => (
                  <motion.div
                    key={variable}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {variable.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                      </span>
                    </div>
                    {typeof value === "number" && (
                      <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-green-500 dark:bg-green-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, value * 10)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default InventoryDisplay
