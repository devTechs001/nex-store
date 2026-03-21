// src/utils/validators.js
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidVersion = (version) => {
  const re = /^\d+\.\d+\.\d+$/
  return re.test(version)
}