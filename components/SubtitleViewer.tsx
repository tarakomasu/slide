'use client';

import { useEffect, useRef } from 'react';

export interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  pageNumber: number;
}

interface SubtitleViewerProps {
  subtitles: Subtitle[];
  currentTime: number;
  onSubtitleClick?: (startTime: number) => void;
}

export default function SubtitleViewer({ subtitles, currentTime, onSubtitleClick }: SubtitleViewerProps) {
  const activeSubtitleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active subtitle
  useEffect(() => {
    if (activeSubtitleRef.current) {
      activeSubtitleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime]);

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
      {subtitles.map((subtitle) => {
        const isActive = currentTime >= subtitle.startTime && currentTime < subtitle.endTime;
        return (
          <div
            key={subtitle.id}
            ref={isActive ? activeSubtitleRef : null}
            onClick={() => onSubtitleClick?.(subtitle.startTime)}
            className={`cursor-pointer transition-colors duration-200 p-2 rounded ${
              isActive
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <p className="text-lg leading-relaxed">{subtitle.text}</p>
          </div>
        );
      })}
    </div>
  );
}
