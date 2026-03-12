'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ChaiBuilder = dynamic(() => import('@chaibuilder/routes/builder'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500 mx-auto"></div>
        <h1 className="text-xl font-bold">Loading PageCrafter v3 Editor...</h1>
        <p className="text-gray-400">Initializing Chai Builder SDK</p>
      </div>
    </div>
  ),
});

export default function ChaiStudio() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Suspense fallback={null}>
        <ChaiBuilder />
      </Suspense>
    </div>
  );
}
