"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mail, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  useEffect(() => {
    // Get email from localStorage if available (from sign-up)
    const savedEmail = localStorage.getItem('signup_email')
    if (savedEmail) {
      setEmail(savedEmail)
    }
  }, [])

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        console.error("Error resending email:", error)
        toast({
          title: "Failed to Resend Email",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setResent(true)
        toast({
          title: "Confirmation Email Sent",
          description: `A new confirmation email has been sent to ${email}. Please check your inbox.`,
        })
      }
    } catch (err) {
      console.error("Error resending email:", err)
      toast({
        title: "Error",
        description: "Failed to resend confirmation email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setResending(false)
    }
  }

  const isExpiredLink = errorCode === 'otp_expired' || error === 'access_denied'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30 flex items-center justify-center p-4">
      <Card className="p-8 bg-white border-2 border-purple-100 shadow-xl rounded-3xl max-w-md w-full">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-black text-black mb-2">
              {isExpiredLink ? "Link Expired" : "Authentication Error"}
            </h1>
            <p className="text-gray-600">
              {isExpiredLink
                ? "This email confirmation link has expired or is invalid."
                : errorDescription || "An error occurred during authentication."}
            </p>
          </div>

          {isExpiredLink && (
            <Alert className="border-2 border-purple-200 bg-purple-50">
              <Mail className="h-5 w-5 text-purple-600" />
              <AlertTitle className="font-bold text-black">Resend Confirmation Email</AlertTitle>
              <AlertDescription className="text-gray-700 mt-2">
                {resent ? (
                  <div>
                    <p className="font-semibold text-green-600 mb-2">✓ Confirmation email sent!</p>
                    <p className="text-sm">Please check your inbox and click the new link to confirm your account.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm">Enter your email address to receive a new confirmation link.</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-md focus:outline-none focus:border-purple-600"
                      />
                      <Button
                        onClick={handleResendEmail}
                        disabled={!email || resending}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {resending ? "Sending..." : "Resend"}
                      </Button>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/auth/sign-in">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-xl">
                Go to Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button variant="outline" className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold py-6 rounded-xl">
                Create New Account
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-gray-600 hover:text-purple-600 font-semibold">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

