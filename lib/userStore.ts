"use client"

import { useSyncExternalStore } from "react"

// User profile interface for localStorage-based state management
export interface UserStats {
  totalQuizzes: number
  accuracyScore: number
  hoursStudied: number
  dailyStreak: number
  currentLevel: number
  xpEarned: number
  xpToNextLevel: number
}

export interface UserProfile {
  name: string
  email: string
  image?: string
  agreedToTerms: boolean
  onboardingComplete: boolean
  tutorialComplete: boolean
  createdAt: string
  lastActivityDate?: string // ISO date string (YYYY-MM-DD)
  stats: UserStats
  language?: string // Added language preference
}

const STORAGE_KEY = "studyflow_user_profile"

// Module-level cache to avoid redundant localStorage access and JSON parsing
let cachedProfile: UserProfile | null = null
let isInitialized = false

// Listeners for reactive updates
const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

function notify() {
  listeners.forEach((listener) => listener())
}

// Sync with other tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      cachedProfile = null
      isInitialized = false
      notify()
    }
  })
}

// Default stats for new users
const defaultStats: UserStats = {
  totalQuizzes: 0,
  accuracyScore: 0,
  hoursStudied: 0,
  dailyStreak: 0,
  currentLevel: 1,
  xpEarned: 0,
  xpToNextLevel: 100,
}

/**
 * Get user profile from localStorage (with caching)
 */
export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null

  if (isInitialized) {
    return cachedProfile
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      cachedProfile = null
      isInitialized = true
      return null
    }
    cachedProfile = JSON.parse(data) as UserProfile
    isInitialized = true
    return cachedProfile
  } catch {
    cachedProfile = null
    isInitialized = true
    return null
  }
}

const getServerSnapshot = () => null

/**
 * Reactive hook for user profile using useSyncExternalStore
 */
export function useUserProfile() {
  return useSyncExternalStore(
    subscribe,
    getUserProfile,
    getServerSnapshot
  )
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: Partial<UserProfile> & { email: string }): UserProfile {
  const existing = getUserProfile()

  const newProfile: UserProfile = {
    name: profile.name || existing?.name || "",
    email: profile.email,
    image: profile.image || existing?.image,
    agreedToTerms: profile.agreedToTerms ?? existing?.agreedToTerms ?? false,
    onboardingComplete: profile.onboardingComplete ?? existing?.onboardingComplete ?? false,
    tutorialComplete: profile.tutorialComplete ?? existing?.tutorialComplete ?? false,
    createdAt: existing?.createdAt || new Date().toISOString(),
    stats: profile.stats || existing?.stats || { ...defaultStats },
    language: profile.language || existing?.language || "English",
    lastActivityDate: profile.lastActivityDate || existing?.lastActivityDate,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile))
    cachedProfile = newProfile
    isInitialized = true
    notify()
  }

  return newProfile
}

/**
 * Clear user profile from localStorage
 */
export function clearUserProfile(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
    cachedProfile = null
    isInitialized = true
    notify()
  }
}

/**
 * Check if user has completed onboarding
 */
export function isOnboardingComplete(email?: string): boolean {
  const profile = getUserProfile()
  if (!profile) return false

  // If email is provided, verify it matches
  if (email && profile.email !== email) return false

  return profile.onboardingComplete && profile.agreedToTerms
}

/**
 * Update user stats
 */
export function updateUserStats(stats: Partial<UserStats>): void {
  const profile = getUserProfile()
  if (!profile) return

  const updatedProfile = {
    ...profile,
    stats: { ...profile.stats, ...stats }
  }
  saveUserProfile(updatedProfile)
}

/**
 * Check if user has completed tutorial
 */
export function isTutorialComplete(email?: string): boolean {
  const profile = getUserProfile()
  if (!profile) return false

  if (email && profile.email !== email) return false

  return profile.tutorialComplete
}

/**
 * Mark tutorial as complete
 */
export function markTutorialComplete(email: string): void {
  const profile = getUserProfile()
  if (!profile || profile.email !== email) return

  saveUserProfile({ ...profile, tutorialComplete: true })
}

/**
 * Add XP and handle level ups
 */
export function addXP(amount: number): void {
  const profile = getUserProfile()
  if (!profile) return

  const stats = { ...profile.stats }
  stats.xpEarned += amount

  while (stats.xpEarned >= stats.xpToNextLevel) {
    stats.xpEarned -= stats.xpToNextLevel
    stats.currentLevel += 1
    // Increase difficulty for next level
    stats.xpToNextLevel = stats.currentLevel * 100
  }

  saveUserProfile({ ...profile, stats })
}

/**
 * Record activity and update streak
 */
export function recordActivity(): void {
  const profile = getUserProfile()
  if (!profile) return

  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const lastDate = profile.lastActivityDate

  if (lastDate === today) {
    // Already recorded today
    return
  }

  const stats = { ...profile.stats }

  if (lastDate) {
    const last = new Date(lastDate)
    const diffTime = Math.abs(now.getTime() - last.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      stats.dailyStreak += 1
    } else {
      stats.dailyStreak = 1
    }
  } else {
    stats.dailyStreak = 1
  }

  saveUserProfile({
    ...profile,
    lastActivityDate: today,
    stats
  })
}
