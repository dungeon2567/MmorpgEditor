"use client"

import dynamic from 'next/dynamic';

const ActorsPage = dynamic(() => import('./ActorsPage'), {
  ssr: false,
});

export function ActorsPageWrapper() {
  return <ActorsPage />;
} 