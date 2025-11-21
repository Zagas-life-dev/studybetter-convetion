"use client"

import { useAuth } from './use-auth'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  neurodivergence_type: string | null
  learning_preferences: Record<string, any> | null
  academic_level: string | null
  subject_interests: string[] | null
  custom_fields: Record<string, any> | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export function useUser() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }

      setProfile(data)
      setLoading(false)
    }

    fetchProfile()
  }, [user, supabase])

  return { user, profile, loading: authLoading || loading }
}









