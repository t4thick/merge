import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const typeRaw = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'
  const safeNext = next.startsWith('/') ? next : '/'

  const supabase = await createClient()

  // 1) PKCE flow (same device that initiated login / signup / reset). Used by `signInWithOAuth`,
  //    `signUp`, and `resetPasswordForEmail` when the same browser holds the code_verifier.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
    console.warn('[auth/callback] exchangeCodeForSession failed:', error.message)
  }

  // 2) Cross-device email link (token_hash). Works when the user opens the reset / verify
  //    email on a different device than the one that requested it (PKCE has no verifier
  //    there). This is the modern Supabase recommendation for password recovery emails.
  if (tokenHash && typeRaw) {
    const type = typeRaw as EmailOtpType
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
    console.warn('[auth/callback] verifyOtp failed:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
