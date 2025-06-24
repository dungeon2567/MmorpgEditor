"use client"

import dynamic from 'next/dynamic';

const AttributesPage = dynamic(() => import('./AttributesPage'), {
  ssr: false,
});

export default function Page() {
  return <AttributesPage />;
} 