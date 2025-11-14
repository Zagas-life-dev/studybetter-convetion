"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loading) return
    
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!data.user || !data.session) {
        toast({
          title: "Sign in failed",
          description: "No session created. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Signed In Successfully",
        description: "Welcome back! Redirecting to your dashboard...",
      })

      // Wait a moment for session to be set in cookies
      await new Promise(resolve => setTimeout(resolve, 100))

      window.location.href = '/dashboard'
    } catch (err) {
      console.error("Sign in error:", err)
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 bg-white border-2 border-purple-100 shadow-xl rounded-3xl max-w-md w-full">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-black mb-2">Sign In</h1>
          <p className="text-gray-600">Welcome back to Study Better AI</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
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
              className="border-2 border-purple-200 focus:border-purple-600"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/auth/sign-up"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Sign up
          </a>
        </div>
      </div>
    </Card>
  )
}


