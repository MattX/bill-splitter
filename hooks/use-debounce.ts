import { useEffect, useRef, useCallback } from "react"

export function useDebounce(
  callback: () => void,
  delay: number,
  dependencies: any[]
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback()
    }, delay)
  }, [callback, delay])

  useEffect(() => {
    reset()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, dependencies)

  return { reset }
} 