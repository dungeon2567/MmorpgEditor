'use client';

import dynamic from 'next/dynamic';

const EffectsPage = dynamic(() => import('./EffectsPage').then((mod) => ({ default: mod.EffectsPage })), {
  ssr: false,
});

export function EffectsPageWrapper() {
  return <EffectsPage />;
} 