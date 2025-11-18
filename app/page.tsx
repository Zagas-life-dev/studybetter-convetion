"use client"

import { PdfUploadForm } from "@/components/pdf-upload-form"
import { Sparkles, BookOpen, ArrowRight, FileText, CheckCircle2, Users, TrendingUp, Layers, ClipboardList, MessageSquare, Clock3, Layout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function AuthRedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    
    if (error || errorCode) {
      const errorUrl = new URL('/auth/error', window.location.origin)
      if (error) errorUrl.searchParams.set('error', error)
      if (errorCode) errorUrl.searchParams.set('error_code', errorCode)
      const errorDescription = searchParams.get('error_description')
      if (errorDescription) errorUrl.searchParams.set('error_description', errorDescription)
      
      router.replace(errorUrl.pathname + errorUrl.search)
    }
  }, [searchParams, router])

  return null
}

export default function Home() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-purple-100/50 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-black block leading-none">Study Better</span>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-semibold text-sm">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors font-semibold text-sm">How It Works</a>
              {!loading && (
                user ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-gray-700 hover:text-purple-600 font-semibold">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/profile">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6">
                        Profile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/sign-in">
                      <Button variant="ghost" className="text-gray-700 hover:text-purple-600 font-semibold">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50/30">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-100 rounded-full border border-purple-200">
                <span className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-pulse"></span>
                <span className="text-sm font-bold text-purple-700 uppercase tracking-wide">Neurodivergent-Centered Learning</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-black leading-[1.1]">
                Personalize Education
                <span className="block text-purple-600 mt-2">For Every Mind</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-xl">
                StudyBetterAI blends adaptive design with AI copilots so students—including
                those with ADHD, dyslexia, or other learning differences—can learn faster,
                remember better, and stay focused without forcing their brains into a single mold.
              </p>

              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-2xl text-black">10K+</div>
                    <div className="text-sm text-gray-600 font-medium">Documents</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-2xl text-black">98%</div>
                    <div className="text-sm text-gray-600 font-medium">Accuracy</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-2xl text-black">4.9★</div>
                    <div className="text-sm text-gray-600 font-medium">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-purple-100 rounded"></div>
                    <div className="h-2 bg-purple-100 rounded w-5/6"></div>
                    <div className="h-2 bg-purple-100 rounded w-4/6"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-16 bg-purple-50 rounded-lg border-2 border-purple-200"></div>
                    <div className="flex-1 h-16 bg-purple-50 rounded-lg border-2 border-purple-200"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-200 rounded-2xl blur-xl opacity-50"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-300 rounded-2xl blur-xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-purple-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-200/60 rounded-full border border-purple-300/60">
              <span className="text-sm font-bold text-purple-800 uppercase tracking-wide">Our Vision</span>
            </div>
            <h3 className="text-4xl font-black text-black leading-tight">
              Close the neurodivergent gap in education and redefine personalization for all.
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Traditional systems reward uniformity. StudyBetterAI flips the script so every mind gets the tools, pacing, and sensory environment it needs.
              Students don&apos;t just study harder—they study smarter, in their own way.
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100 space-y-5">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Adaptive pacing</p>
                <p className="text-gray-600">Learning loops that flex with attention spans and cognitive load.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Inclusive design</p>
                <p className="text-gray-600">Readable typography, calming layouts, and sensory-aware interactions.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 text-purple-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Guided mastery</p>
                <p className="text-gray-600">AI copilots that teach the process, not just the answer.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Upload Section */}
      <section id="upload" className="bg-gradient-to-b from-white to-purple-50/30 py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PdfUploadForm />
        </div>
      </section>

      {/* Key Capabilities */}
      <section id="features" className="bg-black text-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">Key Capabilities</h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A neurodivergent-centered learning ecosystem that adapts to every brain and study style
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-600/5 rounded-3xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4">AI Summary & Explanation</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Dynamic models tailor smart summaries and deep explanations to each learner&apos;s pace and comprehension level.
                </p>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-600/5 rounded-3xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4">Flashcards & Adaptive Quizlets</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Instantly convert material into interactive flashcards that track mastery, surface weak spots, and optimize review loops.
                </p>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-600/5 rounded-3xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4">Assignment Handler</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Upload assignments and get guided, step-by-step breakdowns so students learn the &ldquo;how&rdquo; behind every solution.
                </p>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-600/5 rounded-3xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4">Integrated Chat & Study Hub</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Chat with AI tutors, review notes, and manage study sessions inside one unified workspace to maintain focus.
                </p>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-600/5 rounded-3xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4">Primodo Pomodoro Timer</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  An adaptive Pomodoro system that detects fatigue patterns and adjusts breaks to help ADHD minds stay consistent.
                </p>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl p-10 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-600/5 rounded-3xl transition-all duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Layout className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4">Dynamic UI Adaptation</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Fonts, spacing, and layouts shift based on neurotype to reduce cognitive overload and make content effortless to parse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-gray-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
            <span className="text-sm font-bold text-purple-700 uppercase tracking-wide">Our Story</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-black leading-tight">
            Built for learners who don&apos;t fit a one-size-fits-all classroom
          </h2>
          <p className="text-xl leading-relaxed">
            StudyBetterAI started as a simple personalized study tool. Within our first year, user interviews and real-world performance made one truth obvious:
            many struggling students weren&apos;t unmotivated, they were neurodivergent. ADHD, dyslexia, and other learning differences weren&apos;t outliers—they were
            the pattern. So we rebuilt the platform around those minds first, combining adaptive design with AI guidance.
          </p>
          <p className="text-xl leading-relaxed">
            Today, StudyBetterAI is a neurodivergent-centered learning ecosystem that helps every learner—regardless of focus, comprehension speed, or sensory needs—
            stay engaged, master assignments, and actually enjoy the process.
          </p>
        </div>
      </section>

      {/* How It Works - Asymmetric Layout */}
      <section id="how-it-works" className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-8">
                <span className="text-sm font-bold text-purple-700 uppercase tracking-wide">Process</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-black mb-6 leading-tight">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Simple, fast, and powerful PDF processing in three easy steps
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-black text-black mb-3">Upload Your PDF</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Simply drag and drop or select your PDF document. We support documents up to 10MB with instant processing.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-black text-black mb-3">Choose Your Task</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Select whether you want a summary or detailed explanation, and optionally optimize for your learning style.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-black text-black mb-3">Get Your Results</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Receive AI-powered content optimized for your needs, with options to download as PDF or markdown.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-xl md:text-2xl text-purple-100 mb-10 leading-relaxed">
            Start processing your PDFs today and experience the power of AI-powered learning
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 font-bold text-lg px-8 py-6 shadow-2xl">
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black block leading-none">Study Better</span>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI</span>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors font-medium">How It Works</a>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Study Better AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}>
        <AuthRedirectHandler />
      </Suspense>
      </div>
  )
}
