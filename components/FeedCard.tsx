import Link from 'next/link';
import { Clock, User } from 'lucide-react';

interface FeedCardProps {
  id: string;
  title: string;
  author: string;
  duration: string;
  thumbnailUrl?: string;
}

export default function FeedCard({ id, title, author, duration, thumbnailUrl }: FeedCardProps) {
  return (
    <Link href={`/player/${id}`} className="block group">
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800">
        {/* Thumbnail Area */}
        <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Thumbnail
            </div>
          )}
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{author}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
