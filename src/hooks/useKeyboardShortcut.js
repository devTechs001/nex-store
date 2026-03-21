import { useState, useEffect } from 'react'

export const useKeyboardShortcut = (key, callback, options = {}) => {
  const { ctrl = false, shift = false, alt = false, preventDefault = true } = options

  useEffect(() => {
    const handleKeyDown = (event) => {
      const keyMatch = event.key.toLowerCase() === key.toLowerCase()
      const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : true
      const shiftMatch = shift ? event.shiftKey : true
      const altMatch = alt ? event.altKey : true

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (preventDefault) {
          event.preventDefault()
        }
        callback(event)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, ctrl, shift, alt, preventDefault])
}

export default useKeyboardShortcut
