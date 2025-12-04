'use client';

import FeedCard from '@/components/FeedCard';

const MOCK_FEED_ITEMS = [
  {
    id: '1',
    title: 'Introduction to PDF.js',
    author: 'Mozilla Team',
    duration: '5:00',
    thumbnailUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf', // Using PDF as thumbnail placeholder if possible, or just a placeholder
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    author: 'React Expert',
    duration: '12:30',
  },
  {
    id: '3',
    title: 'Next.js App Router Guide',
    author: 'Vercel',
    duration: '8:45',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Slides</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Discover and listen to tech slides.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_FEED_ITEMS.map((item) => (
            <FeedCard
              key={item.id}
              id={item.id}
              title={item.title}
              author={item.author}
              duration={item.duration}
              // thumbnailUrl={item.thumbnailUrl} // Commented out to use placeholder
            />
          ))}
        </div>
      </div>
    </main>
  );
}
