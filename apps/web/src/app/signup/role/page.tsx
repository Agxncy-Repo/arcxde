'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SlantEgg } from '@/components/slant-egg';
import { RoleCard } from '@/components/role-card';
import { useUserStore } from '@/store/user-store';

const FONT = "'Suisse Int\\'l', system-ui, sans-serif";

const ROLES = [
  {
    id: 'developer',
    title: 'Developer',
    description: 'Those building AI-enabled products, systems and technical workflows.',
  },
  {
    id: 'strategist',
    title: 'Strategist',
    description: 'Those shaping AI direction, opportunities and organisational priorities.',
  },
  {
    id: 'designer',
    title: 'Designer',
    description: 'Those designing AI-enabled experiences, interfaces and interactions.',
  },
  {
    id: 'manager',
    title: 'Manager',
    description: 'Those leading teams, delivery and the operational use of AI.',
  },
  {
    id: 'analyst',
    title: 'Analyst',
    description: 'Those using AI to interpret data, generate insight and support decision-making.',
  },
  {
    id: 'executive',
    title: 'Executive',
    description: 'Senior leaders responsible for AI governance, oversight and business impact.',
  },
];

const HYBRID = {
  id: 'hybrid',
  title: 'Hybrid',
  description:
    'Multidisciplinary professionals working across strategy, product, design, technology and operations.',
};

export default function RoleSelectionPage() {
  const router = useRouter();
  const setRole = useUserStore((s) => s.setRole);
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      setRole(selected);
      router.push(`/onboarding/questions?role=${selected}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#222] overflow-hidden relative" style={{ minHeight: 1024 }}>
      <div style={{ position: 'absolute', top: 38, left: 47 }}>
        <SlantEgg size="sm" />
      </div>

      {/* Back arrow — top 151, left 178 */}
      <Link
        href="/signup/individual"
        style={{
          position: 'absolute',
          top: 151,
          left: 178,
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 100,
          lineHeight: '100%',
          color: 'white',
          textDecoration: 'none',
        }}
      >
        ←
      </Link>

      <h1
        style={{
          position: 'absolute',
          top: 185,
          left: 466,
          width: 453,
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 450,
          lineHeight: '100%',
          color: 'white',
          margin: 0,
        }}
      >
        Select the role that best reflects how you work with AI.
      </h1>

      {[
        [ROLES[0], ROLES[1]],
        [ROLES[2], ROLES[3]],
        [ROLES[4], ROLES[5]],
      ].map((pair, row) => {
        const rowTop = [303, 441, 581][row];
        return pair.map((role, col) => (
          <div
            key={role.id}
            style={{ position: 'absolute', top: rowTop, left: col === 0 ? 307 : 733, width: 399.1 }}
          >
            <RoleCard
              title={role.title}
              description={role.description}
              name="role"
              value={role.id}
              checked={selected === role.id}
              onChange={() => setSelected(role.id)}
              cardSize="sm"
            />
          </div>
        ));
      })}

      <div style={{ position: 'absolute', top: 721, left: 490, width: 467.2 }}>
        <RoleCard
          title={HYBRID.title}
          description={HYBRID.description}
          name="role"
          value={HYBRID.id}
          checked={selected === HYBRID.id}
          onChange={() => setSelected(HYBRID.id)}
          cardSize="md"
        />
      </div>

      <button
        disabled={!selected}
        onClick={handleContinue}
        style={{
          position: 'absolute',
          top: 913,
          left: 966,
          width: 166,
          height: 38,
          borderRadius: 20,
          border: '1px solid #6b6b6b',
          background: selected ? '#fff' : 'transparent',
          color: selected ? '#222' : '#6b6b6b',
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 300,
          lineHeight: '100%',
          cursor: selected ? 'pointer' : 'default',
          transition: 'all 0.15s',
        }}
      >
        continue
      </button>
    </div>
  );
}
