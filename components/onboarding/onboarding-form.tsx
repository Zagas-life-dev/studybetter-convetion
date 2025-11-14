"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const onboardingSchema = z.object({
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

export type OnboardingData = z.infer<typeof onboardingSchema>

interface OnboardingFormProps {
  onSubmit: (data: OnboardingData) => Promise<void>
  loading?: boolean
}

export function OnboardingForm({ onSubmit, loading = false }: OnboardingFormProps) {
  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
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

  const [subjectInput, setSubjectInput] = useState("")
  const [subjects, setSubjects] = useState<string[]>([])

  const handleAddSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      const newSubjects = [...subjects, subjectInput.trim()]
      setSubjects(newSubjects)
      form.setValue("subjectInterests", newSubjects)
      setSubjectInput("")
    }
  }

  const handleRemoveSubject = (subject: string) => {
    const newSubjects = subjects.filter((s) => s !== subject)
    setSubjects(newSubjects)
    form.setValue("subjectInterests", newSubjects)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="neurodivergenceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black font-bold">Neurodivergence Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-600">
                    <SelectValue placeholder="Select type" />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-600">
                    <SelectValue placeholder="Select level" />
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
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Completing profile...
            </>
          ) : (
            "Complete Profile"
          )}
        </Button>
      </form>
    </Form>
  )
}

