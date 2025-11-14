"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react"

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loading) return
    
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!data.user) {
        toast({
          title: "Sign up failed",
          description: "Account creation failed. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Check if user has a session (logged in immediately - email confirmation disabled)
      if (data.session) {
        // User is immediately logged in
        // Wait a moment for session to be set in cookies
        await new Promise(resolve => setTimeout(resolve, 100))

        window.location.href = '/dashboard'
      } else {
        // Email confirmation required - show confirmation message
        // Save email to localStorage for error page resend functionality
        if (typeof window !== 'undefined') {
          localStorage.setItem('signup_email', email)
        }
        
        setEmailSent(true)
        toast({
          title: "Email confirmation sent",
          description: "Please check your email to confirm your account, then sign in.",
        })
        setLoading(false)
      }
    } catch (err) {
      console.error("Sign up error:", err)
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="p-8 bg-white border-2 border-purple-100 shadow-xl rounded-3xl max-w-md w-full">
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-black mb-2">Check Your Email</h1>
            <p className="text-gray-600">
              We've sent a confirmation email to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Please click the link in the email to confirm your account, then sign in to complete your profile setup.
            </p>
          </div>
          <div className="pt-4">
            <a
              href="/auth/sign-in"
              className="text-purple-600 hover:text-purple-700 font-semibold underline"
            >
              Go to Sign In
            </a>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-8 bg-white border-2 border-purple-100 shadow-xl rounded-3xl max-w-md w-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-black mb-2">Sign Up</h1>
          <p className="text-gray-600">Create your Study Better AI account</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-black font-bold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-2 border-purple-200 focus:border-purple-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-black font-bold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="border-2 border-purple-200 focus:border-purple-600"
            />
            <p className="text-xs text-gray-500">Minimum 6 characters</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/auth/sign-in"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Sign in
          </a>
        </div>
      </div>
    </Card>
  )
}


