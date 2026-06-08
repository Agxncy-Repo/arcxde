'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SlantEgg } from '@/components/slant-egg';
import { useGoogleAuth, useSendVerificationEmail, useVerifySignupToken } from '@/lib/hooks/useAuth';

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

const GoogleLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function IndividualSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [verificationToken, setVerificationToken] = useState('');

  const { redirectToGoogle, isRedirecting } = useGoogleAuth();
  const sendVerificationEmailMutation = useSendVerificationEmail();
  const verifyTokenMutation = useVerifySignupToken();

  // Action 1: Handle Email Submission
  const handleSendEmail = () => {
    sendVerificationEmailMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setStep('code'); // Clean page change to the code input screen
        },
      },
    );
  };

  if (step === 'code') {
    return (
      <div className="min-h-screen bg-[#222] overflow-hidden flex">
        {/* ── LEFT: branding ─────────────────────────────── */}
        <div className="relative flex flex-1 items-center justify-center">
          <SlantEgg size="lg" showText />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 1,
              height: '69%',
              borderRight: '1px solid #6b6b6b',
            }}
          />
        </div>

        {/* ── RIGHT: verification message ────────────────────────────────── */}
        <div className="flex flex-1 flex-col justify-center px-16 py-16">
          <h1
            style={{
              fontFamily: FONT,
              fontSize: 32,
              fontWeight: 450,
              lineHeight: '100%',
              color: 'white',
              marginBottom: 24,
            }}
          >
            Check your email
          </h1>

          <p
            style={{
              fontFamily: FONT,
              fontSize: 18,
              fontWeight: 300,
              lineHeight: '150%',
              color: '#a3a3a3',
              maxWidth: 602,
              marginBottom: 48,
            }}
          >
            We&apos;ve sent a verification link to{' '}
            <strong style={{ color: 'white' }}>{email}</strong>. Click the link in the email to
            verify your account and continue.
          </p>

          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 300,
              lineHeight: '150%',
              color: '#6b6b6b',
              maxWidth: 602,
            }}
          >
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setStep('email')}
              style={{
                background: 'none',
                border: 'none',
                color: '#a3a3a3',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: FONT,
                fontSize: 14,
              }}
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222] overflow-hidden flex">
      {/* ── LEFT: branding ─────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center">
        <SlantEgg size="lg" showText />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 1,
            height: '69%',
            borderRight: '1px solid #6b6b6b',
          }}
        />
      </div>

      {/* ── RIGHT: form ────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-16 py-16">
        {/* Back arrow — in flow, above heading */}

        <Link
          href="/signup"
          style={{
            fontFamily: FONT,
            fontSize: 32,
            fontWeight: 100,
            lineHeight: '100%',
            color: 'white',
            textDecoration: 'none',
            marginBottom: 24,
            display: 'block',
          }}
        >
          ←
        </Link>

        {/* Heading */}
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 32,
            fontWeight: 450,
            lineHeight: '100%',
            color: 'white',
            marginBottom: 18,
          }}
        >
          Create an individual account
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 100,
            lineHeight: '100%',
            color: 'white',
            marginBottom: 48,
          }}
        >
          Sign up with the Google account you use for work or with your work email address.
        </p>

        {/* Google button — height 54, padding top/bottom 15px, left/right 47.5px */}
        <button
          onClick={redirectToGoogle}
          disabled={isRedirecting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            width: 345,
            height: 54,
            borderRadius: 10,
            background: '#fff',
            border: 'none',
            paddingTop: 15,
            paddingBottom: 15,
            paddingLeft: 47.5,
            paddingRight: 47.5,
            boxShadow: '0px 0px 3px rgba(0,0,0,0.08), 0px 2px 3px rgba(0,0,0,0.17)',
            cursor: 'pointer',
            marginBottom: 48,
            boxSizing: 'border-box',
          }}
        >
          <GoogleLogo />
          <span
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 20,
              fontWeight: 500,
              color: 'rgba(0,0,0,0.54)',
            }}
          >
            {isRedirecting ? 'Connecting...' : 'Sign Up with Google'}
          </span>
        </button>

        {/* — or — divider */}
        <div style={{ display: 'flex', alignItems: 'center', width: 460, marginBottom: 48 }}>
          <div style={{ flex: 1, borderTop: '1px solid #626262' }} />
          <span
            style={{
              fontFamily: FONT,
              fontSize: 18,
              fontWeight: 300,
              lineHeight: '100%',
              color: 'white',
              padding: '0 16px',
            }}
          >
            or
          </span>
          <div style={{ flex: 1, borderTop: '1px solid #626262' }} />
        </div>

        {/* Email input wrapper */}
        <div style={{ position: 'relative', width: 377, height: 71, marginBottom: 20 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 20,
              border: '1px solid #6b6b6b',
            }}
          />
          <input
            type="email"
            placeholder="work email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sendVerificationEmailMutation.isPending}
            style={{
              position: 'absolute',
              top: 27,
              left: 27,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: FONT,
              fontSize: 18,
              fontWeight: 300,
              lineHeight: '100%',
              color: '#fff', // Changed to white so text is visible when typing
              width: 'calc(100% - 54px)',
            }}
          />
        </div>

        {sendVerificationEmailMutation.isError && (
          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 300,
              lineHeight: '100%',
              color: '#ff6b6b',
              marginBottom: 32,
            }}
          >
            {sendVerificationEmailMutation.error?.message ||
              'Failed to send verification email. Please try again.'}
          </p>
        )}

        {verifyTokenMutation.isError && (
          <p
            style={{
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 300,
              lineHeight: '100%',
              color: '#ff6b6b',
              marginBottom: 32,
            }}
          >
            {verifyTokenMutation.error?.message || 'Verification failed. Please try again.'}
          </p>
        )}

        {/* Continue button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: 377, marginBottom: 48 }}>
          <button
            disabled={!email || sendVerificationEmailMutation.isPending}
            onClick={handleSendEmail}
            style={{
              width: 166,
              height: 38,
              borderRadius: 20,
              border: '1px solid #6b6b6b',
              background: 'transparent',
              color: email && !sendVerificationEmailMutation.isPending ? '#fff' : '#6b6b6b', // Text turns white when active
              fontFamily: FONT,
              fontSize: 18,
              fontWeight: 300,
              lineHeight: '100%',
              cursor: email && !sendVerificationEmailMutation.isPending ? 'pointer' : 'default',
              opacity: email && !sendVerificationEmailMutation.isPending ? 1 : 0.5,
            }}
          >
            {sendVerificationEmailMutation.isPending ? 'sending...' : 'continue'}
          </button>
        </div>

        {/* Legal */}
        <p
          style={{
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 300,
            lineHeight: '100%',
            color: '#a3a3a3',
            maxWidth: 602,
          }}
        >
          By continuing you agree to our{' '}
          <a href="#" style={{ color: '#a3a3a3', textDecoration: 'underline' }}>
            Terms &amp; Conditions
          </a>
          {' & '}
          <a href="#" style={{ color: '#a3a3a3', textDecoration: 'underline' }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
