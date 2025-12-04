'use client';

import dynamic from 'next/dynamic';

const Player = dynamic(() => import('./Player'), { 
  ssr: false,
  loading: () => (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg flex justify-center items-center h-[calc(100vh-12rem)]">
      <p className="text-gray-500">Loading Player...</p>
    </div>
  )
});

export default function PlayerLoader() {
  return <Player />;
}
