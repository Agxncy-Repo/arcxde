'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useVerifySignupToken } from '@/lib/hooks/useAuth';
import { SlantEgg } from '@/components/slant-egg';

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

export default function VerifyLandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token'); // Grab token from URL query string

  const verifyTokenMutation = useVerifySignupToken();

  const handleConfirmVerification = () => {
    if (!token) return;

    verifyTokenMutation.mutate(
      { token },
      {
        onSuccess: (response: any) => {
          const registrationToken = response.registrationToken;

          router.push(`/signup/finalize?token=${registrationToken}`);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-[#222] flex flex-col items-center justify-center px-4">
      <div style={{ marginBottom: 48 }}>
        <SlantEgg size="lg" showText />
      </div>

      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1
          style={{
            fontFamily: FONT,
            fontSize: 32,
            fontWeight: 450,
            color: 'white',
            marginBottom: 16,
          }}
        >
          Verify your email address
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 300,
            color: '#a3a3a3',
            lineHeight: '150%',
            marginBottom: 32,
          }}
        >
          Click the button below to confirm your account creation and continue setting up your
          profile workspace.
        </p>

        <button
          disabled={!token || verifyTokenMutation.isPending}
          onClick={handleConfirmVerification}
          style={{
            width: 240,
            height: 48,
            borderRadius: 24,
            border: 'none',
            background: '#fff',
            color: '#222',
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 500,
            cursor: token && !verifyTokenMutation.isPending ? 'pointer' : 'default',
            opacity: token && !verifyTokenMutation.isPending ? 1 : 0.5,
            transition: 'opacity 0.2s ease',
          }}
        >
          {verifyTokenMutation.isPending ? 'Verifying...' : 'Confirm Verification'}
        </button>

        {verifyTokenMutation.isError && (
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#ff6b6b', marginTop: 24 }}>
            {verifyTokenMutation.error?.message ||
              'This verification link is invalid or has expired.'}
          </p>
        )}
      </div>
    </div>
  );
}
