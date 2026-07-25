'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createClient, isSupabaseBrowserConfigured } from '@/lib/supabase/client'
import { AuthShell } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email'

/**
 * Email clients / security scanners often prefetch links and burn one-time tokens.
 * This page only verifies when the user clicks Continue (POST), so prefetch GET is safe.
 */
export default function AuthConfirmPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [tokenHash, setTokenHash] = useState('')
  const [type, setType] = useState('')
  const [code, setCode] = useState('')
  const [next, setNext] = useState('/reset-password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    setTokenHash(sp.get('token_hash') ?? '')
    setType(sp.get('type') ?? '')
    setCode(sp.get('code') ?? '')
    const nextRaw = sp.get('next') ?? '/reset-password'
    setNext(nextRaw.startsWith('/') ? nextRaw : '/reset-password')
    setReady(true)
  }, [])

  const actionLabel = useMemo(() => {
    if (type === 'recovery') return 'Continue to reset password'
    if (type === 'signup' || type === 'email') return 'Confirm email and continue'
    return 'Continue'
  }, [type])

  async function handleContinue() {
    if (!isSupabaseBrowserConfigured()) {
      setError('Sign-in is temporarily unavailable.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (tokenHash && type) {
      const { error: otpError } = await supabase.auth.verifyOtp({
        type: type as EmailOtpType,
        token_hash: tokenHash,
      })
      setLoading(false)
      if (otpError) {
        setError(
          'This link is invalid or was already used. Request a new password reset email and open it on this device.'
        )
        return
      }
      router.replace(next)
      router.refresh()
      return
    }

    if (code) {
      const { error: codeError } = await supabase.auth.exchangeCodeForSession(code)
      setLoading(false)
      if (codeError) {
        setError(
          'This link is invalid or was already used. Request a new password reset email and open it on this device.'
        )
        return
      }
      router.replace(next)
      router.refresh()
      return
    }

    setLoading(false)
    setError('Missing reset details. Request a new password reset email.')
  }

  const hasParams = Boolean((tokenHash && type) || code)

  if (!ready) {
    return (
      <AuthShell title="Reset password" subtitle="Loading…">
        <p className="muted text-sm">One moment…</p>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={type === 'recovery' ? 'Reset password' : 'Confirm'}
      subtitle="Click below to continue. This stops email scanners from using your link first."
    >
      {!hasParams ? (
        <div className="space-y-4">
          <p className="error" role="alert">
            This confirmation link is incomplete or expired.
          </p>
          <Link href="/forgot-password" className="inline-flex min-h-11 items-center font-semibold">
            Request a new reset email →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Button
            type="button"
            className="h-12 w-full rounded-xl"
            size="lg"
            disabled={loading}
            onClick={() => void handleContinue()}
          >
            {loading ? 'Working…' : actionLabel}
          </Button>
          {error && (
            <p className="text-center text-sm">
              <Link href="/forgot-password" className="font-semibold">
                Send a new reset email
              </Link>
            </p>
          )}
        </div>
      )}
    </AuthShell>
  )
}
