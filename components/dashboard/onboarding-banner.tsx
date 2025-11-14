"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, UserPlus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function OnboardingBanner() {
  const { user, loading: authLoading } = useAuth()
  const [showBanner, setShowBanner] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    if (!user || authLoading) {
      setChecking(false)
      return
    }

    const checkOnboarding = async () => {
      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single()

        // Show banner if profile doesn't exist or onboarding is not completed
        setShowBanner(!profile || !profile.onboarding_completed)
      } catch (error) {
        // If error, assume onboarding not completed
        setShowBanner(true)
      } finally {
        setChecking(false)
      }
    }

    checkOnboarding()
  }, [user, authLoading, supabase, pathname]) // Re-check when pathname changes (e.g., after completing onboarding)

  if (checking || !showBanner) {
    return null
  }

  return (
    <Alert className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100 rounded-none m-0">
      <UserPlus className="h-5 w-5 text-purple-600" />
      <AlertTitle className="font-bold text-black flex items-center justify-between">
        <span>Complete Your Profile</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBanner(false)}
          className="h-6 w-6 p-0 hover:bg-purple-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-gray-700 mt-2">
        <p className="mb-3">
          Help us personalize your learning experience by completing your profile. This will improve AI responses tailored to your needs.
        </p>
        <Button
          onClick={() => router.push("/onboarding")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
        >
          Complete Profile
        </Button>
      </AlertDescription>
    </Alert>
  )
}

