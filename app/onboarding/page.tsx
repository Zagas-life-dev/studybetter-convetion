"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import type { OnboardingData } from "@/components/onboarding/onboarding-form"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (!authLoading && !user) {
      router.push("/auth/sign-in")
    }
  }, [user, authLoading, router])

  // Note: We don't redirect away if onboarding is completed
  // Users can access this page anytime to update their profile

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return

    setLoading(true)

    try {
      // Save profile with onboarding data
      const { error: profileError } = await supabase.from("user_profiles").upsert({
        id: user.id,
        neurodivergence_type: data.neurodivergenceType,
        learning_preferences: {
          preferred_format: data.learningPreferences?.preferredFormat,
          reading_speed: data.learningPreferences?.readingSpeed,
          complexity_level: data.learningPreferences?.complexityLevel,
        },
        academic_level: data.academicLevel,
        subject_interests: data.subjectInterests || [],
        custom_fields: data.customFields || {},
        onboarding_completed: true,
      })

      if (profileError) {
        toast({
          title: "Error saving profile",
          description: profileError.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Profile completed",
        description: "Welcome to Study Better AI!",
      })

      // Use window.location for a hard redirect to ensure proper navigation
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Error completing onboarding:", err)
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="p-8 bg-white border-2 border-purple-100 shadow-xl rounded-3xl max-w-2xl w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-black mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us personalize your learning experience</p>
        </div>
        <OnboardingForm onSubmit={handleOnboardingComplete} loading={loading} />
      </Card>
    </div>
  )
}

