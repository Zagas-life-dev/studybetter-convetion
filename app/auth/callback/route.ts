import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle errors from Supabase (expired links, etc.)
  if (error || errorCode) {
    const errorUrl = new URL('/auth/error', requestUrl.origin)
    errorUrl.searchParams.set('error', error || 'unknown_error')
    errorUrl.searchParams.set('error_code', errorCode || '')
    errorUrl.searchParams.set('error_description', errorDescription || '')
    return NextResponse.redirect(errorUrl)
  }

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Success - redirect to onboarding or dashboard
      const redirectUrl = new URL(next, requestUrl.origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If no token or error, redirect to sign-in
  return NextResponse.redirect(new URL('/auth/sign-in', requestUrl.origin))
}




