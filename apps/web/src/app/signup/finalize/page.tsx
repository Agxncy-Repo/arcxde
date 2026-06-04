'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useFinalizeSignup } from '../../../lib/hooks/useAuth';
import { SlantEgg } from '@/components/slant-egg';
import Link from 'next/link';

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

function FinalizeSignupContent() {
  const searchParams = useSearchParams();

  // Grab the secure temporary session token directly out of the URL string
  const token = searchParams.get('token');

  // Consume the clean, typed custom hook capabilities
  const { finalizeSignup, isFinalizing, finalizeError, clearFinalizeError } = useFinalizeSignup();

  // Keep local UI form state minimal
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearFinalizeError();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setLocalError('All fields are required. Please fill in all missing information.');
      return;
    }
    if (!token) {
      setLocalError('Registration token missing. Please re-verify your email address link.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    finalizeSignup({
      token,
      firstName: form.firstName,
      lastName: form.lastName,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });
  };

  const activeDisplayError = finalizeError || localError;

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

      {/* ── RIGHT: profile finalization form ─────────────── */}
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
          Complete your profile
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 100,
            lineHeight: '100%',
            color: '#aaa',
            marginBottom: 48,
          }}
        >
          Please provide your details below to activate your account.
        </p>

        {/* Server/Validation Error Banner */}
        {activeDisplayError && (
          <div className="p-3 mb-6 text-sm text-red-400 bg-red-950/50 rounded-md border border-red-900/50 flex justify-between items-start">
            <span>{activeDisplayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
          {/* First & Last Name Inputs side-by-side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                disabled={isFinalizing}
                placeholder="John"
                className="w-full bg-[#1a1a1a] border border-[#444] p-3 text-sm rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-white disabled:bg-neutral-900 disabled:text-neutral-600 transition-colors"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                disabled={isFinalizing}
                placeholder="Doe"
                className="w-full bg-[#1a1a1a] border border-[#444] p-3 text-sm rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-white disabled:bg-neutral-900 disabled:text-neutral-600 transition-colors"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* New Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              disabled={isFinalizing}
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] border border-[#444] p-3 text-sm rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-white disabled:bg-neutral-900 disabled:text-neutral-600 transition-colors"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              disabled={isFinalizing}
              placeholder="••••••••"
              className="w-full bg-[#1a1a1a] border border-[#444] p-3 text-sm rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-white disabled:bg-neutral-900 disabled:text-neutral-600 transition-colors"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          {/* Submit Button Action */}
          <button
            type="submit"
            disabled={isFinalizing}
            className="w-full bg-white text-black p-3 rounded-md font-medium text-sm hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:text-gray-400 mt-4 flex items-center justify-center"
          >
            {isFinalizing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Setting up account...
              </span>
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FinalizeSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#222] flex items-center justify-center">
          <p style={{ fontFamily: "'Suisse Int\\'l', system-ui, sans-serif", color: 'white', fontSize: 18 }}>Loading...</p>
        </div>
      }
    >
      <FinalizeSignupContent />
    </Suspense>
  );
}
