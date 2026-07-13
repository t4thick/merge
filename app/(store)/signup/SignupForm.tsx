'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createClient, isSupabaseBrowserConfigured } from '@/lib/supabase/client'
import { useClientSearchParams } from '@/lib/hooks/use-client-search-params'
import { mapSignUpError } from '@/lib/auth/map-auth-error'
import { isPasswordAcceptableForSignup } from '@/lib/auth/password-strength'
import { AuthShell } from '@/components/auth/AuthShell'
import { PasswordField } from '@/components/auth/PasswordField'
import { getAuthSiteOrigin } from '@/lib/site-url-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function isValidOptionalPhone(phone: string): boolean {
  if (!phone) return true
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function SignupForm() {
  const router = useRouter()
  const { next } = useClientSearchParams()
  const firstRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isSupabaseBrowserConfigured()) {
      setError('Sign-up is temporarily unavailable.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')

    if (!termsAccepted) {
      setLoading(false)
      setError('Please accept the Terms and Privacy Policy.')
      return
    }
    if (!isValidOptionalPhone(phone.trim())) {
      setLoading(false)
      setError('Enter a valid phone number, or leave it blank.')
      return
    }
    if (!isPasswordAcceptableForSignup(password)) {
      setLoading(false)
      setError('Use a stronger password (8+ chars, upper, lower, number, special).')
      return
    }

    const supabase = createClient()
    const origin = getAuthSiteOrigin()
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    const { error: signError, data } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          phone: phone.trim() || null,
          marketing_opt_in: marketingOptIn,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    })

    setLoading(false)

    if (signError) {
      setError(mapSignUpError(signError.message))
      return
    }

    if (data.session) {
      router.push(next)
      router.refresh()
      return
    }

    setMessage('Check your email to confirm your account, then sign in.')
  }

  return (
    <AuthShell title="Create account" subtitle="Shop African & Caribbean groceries online">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-first" className="form-label">
              First name
            </label>
            <Input
              ref={firstRef}
              id="signup-first"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="signup-last" className="form-label">
              Last name
            </label>
            <Input
              id="signup-last"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="form-label">
            Email
          </label>
          <Input
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="signup-phone" className="form-label">
            Phone <span className="font-normal text-earth-400">(optional)</span>
          </label>
          <Input
            id="signup-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          disabled={loading}
          showStrengthMeter
        />

        <label className="flex items-start gap-2 text-sm text-earth-600">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-earth-300"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
          />
          Email me deals and restock alerts (optional)
        </label>

        <label className="flex items-start gap-2 text-sm text-earth-600">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-earth-300"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" target="_blank">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank">
              Privacy Policy
            </Link>
          </span>
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="success" role="status">
            {message}
          </p>
        )}

        <Button type="submit" className="h-12 w-full rounded-xl" size="lg" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-earth-500">
        Already have an account?{' '}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
