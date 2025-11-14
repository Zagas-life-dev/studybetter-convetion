"use client"

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

type TimerMode = "work" | "shortBreak" | "longBreak"

interface TimerSettings {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
}

interface TimerState {
  timeLeft: number
  isRunning: boolean
  mode: TimerMode
  workSessions: number
  settings: TimerSettings
  isMinimized: boolean
}

interface TimerContextProps extends TimerState {
  toggleTimer: () => void
  resetTimer: () => void
  setMode: (mode: TimerMode) => void
  setSettings: (settings: TimerSettings) => void
  toggleMinimized: () => void
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined)

const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
}

// Always return the same default state for SSR consistency
const getDefaultState = (): TimerState => ({
  timeLeft: DEFAULT_SETTINGS.workMinutes * 60,
  isRunning: false,
  mode: "work",
  workSessions: 0,
  settings: DEFAULT_SETTINGS,
  isMinimized: true,
})

export function TimerProvider({ children }: { children: ReactNode }) {
  // Always start with default state to ensure SSR/client consistency
  const [
    { timeLeft, isRunning, mode, workSessions, settings, isMinimized },
    setState,
  ] = useState<TimerState>(getDefaultState)
  
  // Load from localStorage only after mount (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem("timerState")
      if (item) {
        const savedState = JSON.parse(item)
        let timeLeft = savedState.timeLeft
        
        // If timer was running, calculate elapsed time
        if (savedState.isRunning && savedState.timestamp) {
          const elapsed = Math.floor((Date.now() - savedState.timestamp) / 1000)
          timeLeft = Math.max(0, savedState.timeLeft - elapsed)
          
          // If timer completed while away, stop it
          if (timeLeft === 0) {
            savedState.isRunning = false
          }
        }
        
        setState({
          ...savedState,
          timeLeft,
        })
      }
    } catch (error) {
      console.error("Error reading from localStorage", error)
    }
  }, []) // Only run once on mount
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<{ oscillator: OscillatorNode; gainNode: GainNode; audioContext: AudioContext } | null>(null)
  const { toast } = useToast()
  
  // Save state to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        timeLeft,
        isRunning,
        mode,
        workSessions,
        settings,
        isMinimized,
        timestamp: Date.now(),
      }
      window.localStorage.setItem("timerState", JSON.stringify(stateToSave))
    } catch (error) {
      console.error("Error writing to localStorage", error)
    }
  }, [timeLeft, isRunning, mode, workSessions, settings, isMinimized])

  // Countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }, 1000)
    } else if (!isRunning || timeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft])

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0) {
      handleTimerComplete()
    }
  }, [timeLeft])

  const stopAlarmSound = () => {
    if (audioRef.current) {
      try {
        audioRef.current.oscillator.stop()
        audioRef.current.gainNode.disconnect()
        audioRef.current.oscillator.disconnect()
        if (audioRef.current.audioContext.state !== "closed") {
          audioRef.current.audioContext.close()
        }
        audioRef.current = null
      } catch (error) {
        console.error("Error stopping alarm sound:", error)
      }
    }
  }

  const handleTimerComplete = () => {
    // Play continuous looping alarm sound
    if (typeof window !== "undefined" && "AudioContext" in window) {
      try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        // Create a pleasant, gentle bell-like tone with harmonics for richer sound
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        
        // Create a continuous pulsing effect that loops
        const pulseFrequency = 1.5 // pulses per second
        const pulseGain = gainNode.gain
        const startTime = audioContext.currentTime
        
        // Function to schedule continuous pulses
        const schedulePulses = () => {
          const pulseDuration = 1 / pulseFrequency
          let currentTime = startTime + 0.1
          
          // Schedule many pulses (effectively infinite)
          for (let i = 0; i < 1000; i++) {
            const peakTime = currentTime
            const fadeTime = currentTime + pulseDuration / 2
            
            pulseGain.setValueAtTime(0.2, peakTime)
            pulseGain.linearRampToValueAtTime(0.1, fadeTime)
            pulseGain.linearRampToValueAtTime(0.2, currentTime + pulseDuration)
            
            currentTime += pulseDuration
          }
        }
        
        pulseGain.setValueAtTime(0, startTime)
        pulseGain.linearRampToValueAtTime(0.2, startTime + 0.1)
        schedulePulses()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.start()
        
        // Store reference so we can stop it later
        audioRef.current = { oscillator, gainNode, audioContext }
      } catch (error) {
        console.error("Error playing alarm sound:", error)
      }
    }

    let newMode: TimerMode = "work"
    let newWorkSessions = workSessions
    if (mode === "work") {
      newWorkSessions = workSessions + 1
      newMode = newWorkSessions % settings.longBreakInterval === 0 ? "longBreak" : "shortBreak"
      toast({
        title: "Work Session Complete! 🎉",
        description: `Time for a ${newMode === "longBreak" ? settings.longBreakMinutes : settings.shortBreakMinutes}-minute break.`,
      })
    } else {
      newMode = "work"
      toast({
        title: "Break's Over! ⏰",
        description: "Time to get back to work!",
      })
    }
    
    let newTimeLeft = 0;
    if (newMode === "work") newTimeLeft = settings.workMinutes * 60
    else if (newMode === "shortBreak") newTimeLeft = settings.shortBreakMinutes * 60
    else newTimeLeft = settings.longBreakMinutes * 60

    setState(prev => ({
      ...prev,
      mode: newMode,
      workSessions: newWorkSessions,
      isRunning: false,
      timeLeft: newTimeLeft
    }))
  }

  const toggleTimer = () => {
    // Stop alarm if running
    if (audioRef.current) {
      stopAlarmSound()
    }
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }))
  }

  const toggleMinimized = () => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }))
  }

  const resetTimer = () => {
    // Stop alarm if running
    if (audioRef.current) {
      stopAlarmSound()
    }
    let newTimeLeft = 0;
    if (mode === "work") newTimeLeft = settings.workMinutes * 60
    else if (mode === "shortBreak") newTimeLeft = settings.shortBreakMinutes * 60
    else newTimeLeft = settings.longBreakMinutes * 60
    setState(prev => ({ ...prev, isRunning: false, timeLeft: newTimeLeft }))
  }
  
  const setMode_ = (newMode: TimerMode) => {
     let newTimeLeft = 0;
    if (newMode === "work") newTimeLeft = settings.workMinutes * 60
    else if (newMode === "shortBreak") newTimeLeft = settings.shortBreakMinutes * 60
    else newTimeLeft = settings.longBreakMinutes * 60
    setState(prev => ({ ...prev, mode: newMode, isRunning: false, timeLeft: newTimeLeft }))
  }

  const setSettings_ = (newSettings: TimerSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }))
  }

  const value = {
    timeLeft,
    isRunning,
    mode,
    settings,
    workSessions,
    isMinimized,
    toggleTimer,
    resetTimer,
    setMode: setMode_,
    setSettings: setSettings_,
    toggleMinimized,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
