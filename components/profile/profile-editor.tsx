"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { UserProfile } from "@/hooks/use-user"

const profileSchema = z.object({
  neurodivergenceType: z.enum(["none", "adhd", "dyslexia", "autism", "audhd"]),
  learningPreferences: z.object({
    preferredFormat: z.string().optional(),
    readingSpeed: z.string().optional(),
    complexityLevel: z.string().optional(),
  }).optional(),
  academicLevel: z.enum(["high_school", "undergraduate", "graduate", "professional", "other"]),
  subjectInterests: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subjectInput, setSubjectInput] = useState("")
  const { toast } = useToast()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      neurodivergenceType: "none",
      academicLevel: "undergraduate",
      learningPreferences: {
        preferredFormat: "",
        readingSpeed: "",
        complexityLevel: "",
      },
      subjectInterests: [],
      customFields: {},
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()
      if (data.profile) {
        const profile = data.profile as UserProfile
        form.reset({
          neurodivergenceType: (profile.neurodivergence_type as any) || "none",
          academicLevel: (profile.academic_level as any) || "undergraduate",
          learningPreferences: {
            preferredFormat: profile.learning_preferences?.preferred_format || "",
            readingSpeed: profile.learning_preferences?.reading_speed || "",
            complexityLevel: profile.learning_preferences?.complexity_level || "",
          },
          subjectInterests: profile.subject_interests || [],
          customFields: profile.custom_fields || {},
        })
        setSubjectInput("")
        if (profile.subject_interests) {
          // This will be handled by the form state
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load your profile. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const subjects = form.watch("subjectInterests") || []

  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      const newSubjects = [...subjects, subjectInput.trim()]
      form.setValue("subjectInterests", newSubjects)
      setSubjectInput("")
    }
  }

  const handleRemoveSubject = (subject: string) => {
    const newSubjects = subjects.filter((s) => s !== subject)
    form.setValue("subjectInterests", newSubjects)
  }

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          neurodivergence_type: data.neurodivergenceType,
          learning_preferences: {
            preferred_format: data.learningPreferences?.preferredFormat,
            reading_speed: data.learningPreferences?.readingSpeed,
            complexity_level: data.learningPreferences?.complexityLevel,
          },
          academic_level: data.academicLevel,
          subject_interests: data.subjectInterests || [],
          custom_fields: data.customFields || {},
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <Card className="p-8 border-2 border-purple-100 rounded-3xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="neurodivergenceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black font-bold">Neurodivergence Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-2 border-purple-200 focus:border-purple-600">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None (Standard)</SelectItem>
                    <SelectItem value="adhd">ADHD</SelectItem>
                    <SelectItem value="dyslexia">Dyslexia</SelectItem>
                    <SelectItem value="autism">Autism</SelectItem>
                    <SelectItem value="audhd">AUDHD (Autism + ADHD)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="academicLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black font-bold">Academic Level</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-2 border-purple-200 focus:border-purple-600">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Label className="text-black font-bold">Learning Preferences</Label>
            
            <FormField
              control={form.control}
              name="learningPreferences.preferredFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Format</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., visual, auditory, reading/writing"
                      {...field}
                      value={field.value || ""}
                      className="border-2 border-purple-200 focus:border-purple-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="learningPreferences.readingSpeed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reading Speed</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="border-2 border-purple-200 focus:border-purple-600">
                        <SelectValue placeholder="Select speed" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="learningPreferences.complexityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Complexity Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="border-2 border-purple-200 focus:border-purple-600">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-black font-bold">Subject Interests</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a subject (e.g., Mathematics, Biology)"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSubject()
                  }
                }}
                className="border-2 border-purple-200 focus:border-purple-600"
              />
              <Button
                type="button"
                onClick={handleAddSubject}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Add
              </Button>
            </div>
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map((subject) => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject)}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  )
}

