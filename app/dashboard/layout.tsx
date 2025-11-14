import { Sidebar } from "@/components/dashboard/sidebar"
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner"
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav"
import { TimerProvider } from "@/contexts/timer-context"
import { FloatingPomodoroTimer } from "@/components/dashboard/floating-pomodoro-timer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TimerProvider>
      <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-gray-50 flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <OnboardingBanner />
          <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
            <div className="pb-20 md:pb-0">
              {children}
            </div>
          </main>
        </div>
        <MobileBottomNav />
        <FloatingPomodoroTimer />
      </div>
    </TimerProvider>
  )
}


