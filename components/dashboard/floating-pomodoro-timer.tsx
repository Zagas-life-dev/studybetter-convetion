"use client"

import { useState } from "react"
import { useTimer } from "@/contexts/timer-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, Settings, Check, X, AlarmClock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function FloatingPomodoroTimer() {
  const {
    timeLeft,
    isRunning,
    mode,
    settings,
    workSessions,
    toggleTimer,
    resetTimer,
    setSettings,
    isMinimized,
    toggleMinimized,
  } = useTimer()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState(settings)
  const { toast } = useToast()

  const handleSaveSettings = () => {
    setSettings(tempSettings)
    setIsSettingsOpen(false)
    toast({
      title: "Settings Saved",
      description: "Your timer settings have been updated.",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  
  const getModeLabel = () => {
    switch (mode) {
      case "work": return "Focus Time"
      case "shortBreak": return "Short Break"
      case "longBreak": return "Long Break"
    }
  }

  const progress = () => {
    const total = mode === "work" 
      ? settings.workMinutes * 60 
      : mode === "shortBreak" 
      ? settings.shortBreakMinutes * 60 
      : settings.longBreakMinutes * 60
    if (total === 0) return 0
    return ((total - timeLeft) / total) * 100
  }
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleMinimized}
          className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex flex-col items-center justify-center p-1 gap-0.5 whitespace-nowrap"
        >
          <AlarmClock className="w-4 h-4" />
          <div className="text-xs font-bold leading-tight">{formatTime(timeLeft)}</div>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="p-4 border-2 border-purple-200 rounded-2xl w-72 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Pomodoro Timer</h3>
          <div className="flex items-center">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-7 h-7">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                   <div className="space-y-2">
                    <Label htmlFor="work">Work (minutes)</Label>
                    <Input id="work" type="number" min="1" max="60" value={tempSettings.workMinutes}
                      onChange={(e) => setTempSettings({ ...tempSettings, workMinutes: parseInt(e.target.value) || 1 })}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                    <Input id="shortBreak" type="number" min="1" max="30" value={tempSettings.shortBreakMinutes}
                      onChange={(e) => setTempSettings({ ...tempSettings, shortBreakMinutes: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longBreak">Long Break (minutes)</Label>
                    <Input id="longBreak" type="number" min="1" max="60" value={tempSettings.longBreakMinutes}
                      onChange={(e) => setTempSettings({ ...tempSettings, longBreakMinutes: parseInt(e.target.value) || 1 })}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Long Break After (sessions)</Label>
                    <Input id="interval" type="number" min="2" max="10" value={tempSettings.longBreakInterval}
                      onChange={(e) => setTempSettings({ ...tempSettings, longBreakInterval: parseInt(e.target.value) || 2 })}/>
                  </div>
                  <DialogClose asChild>
                    <Button onClick={handleSaveSettings} className="w-full">
                      <Check className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={toggleMinimized} variant="ghost" size="icon" className="w-7 h-7">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center">
          <div className="w-36 h-36 rounded-full bg-purple-100 mx-auto flex items-center justify-center relative mb-3">
            <div className="absolute inset-0 rounded-full border-8 border-purple-200" />
            <div
              className="absolute inset-0 rounded-full border-8 border-purple-600 transition-all duration-500"
              style={{ clipPath: `inset(0 ${100 - progress()}% 0 0)` }}
            />
            <div className="relative z-10">
              <div className="text-4xl font-black text-purple-800">{formatTime(timeLeft)}</div>
            </div>
          </div>
          <div className="text-md font-semibold text-gray-700 mb-3">{getModeLabel()}</div>
          <div className="text-sm text-gray-500 mb-4">
            Sessions Completed: {workSessions}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button onClick={toggleTimer} size="lg" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
