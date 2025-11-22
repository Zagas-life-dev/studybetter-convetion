import type { UserProfile } from "@/hooks/use-user"

export function buildPersonalizedPrompt(profile: UserProfile | null): string {
  if (!profile || !profile.onboarding_completed) {
    return ""
  }

  const parts: string[] = []

  // Add neurodivergence modifier (already handled separately, but include in context)
  if (profile.neurodivergence_type && profile.neurodivergence_type !== "none") {
    parts.push(`The user has indicated they have ${profile.neurodivergence_type}.`)
  }

  // Add academic level context
  if (profile.academic_level) {
    const levelMap: Record<string, string> = {
      high_school: "high school level",
      undergraduate: "undergraduate/college level",
      graduate: "graduate/postgraduate level",
      professional: "professional level",
      other: "general level",
    }
    parts.push(`The user is at ${levelMap[profile.academic_level] || profile.academic_level} academically.`)
  }

  // Add learning preferences
  if (profile.learning_preferences) {
    const prefs = profile.learning_preferences as Record<string, any>
    if (prefs.preferred_format) {
      parts.push(`The user prefers ${prefs.preferred_format} learning format.`)
    }
    if (prefs.reading_speed) {
      parts.push(`The user reads at ${prefs.reading_speed} speed.`)
    }
    if (prefs.complexity_level) {
      parts.push(`The user prefers ${prefs.complexity_level} complexity level.`)
    }
  }

  // Add subject interests
  if (profile.subject_interests && profile.subject_interests.length > 0) {
    parts.push(
      `The user is particularly interested in: ${profile.subject_interests.join(", ")}.`
    )
  }

  // Add custom fields if any
  if (profile.custom_fields && Object.keys(profile.custom_fields).length > 0) {
    const customInfo = Object.entries(profile.custom_fields)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ")
    parts.push(`Additional user context: ${customInfo}.`)
  }

  if (parts.length === 0) {
    return ""
  }

  return `
PERSONALIZATION CONTEXT:
${parts.join(" ")}
Use this information to tailor your response to the user's learning style, academic level, and interests. Adjust complexity, examples, and explanations accordingly.
`.trim()
}










