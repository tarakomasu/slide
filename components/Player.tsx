'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SubtitleViewer, { Subtitle } from './SubtitleViewer';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings } from 'lucide-react';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

// Mock Data
const MOCK_PDF_URL = '/slide-demo.pdf';
const MOCK_SUBTITLES: Subtitle[] = [
  { id: '1', startTime: 0, endTime: 5, text: 'Hello, world! This is the first slide.', pageNumber: 1 },
  { id: '2', startTime: 5, endTime: 10, text: 'We are learning about PDF.js today.', pageNumber: 1 },
  { id: '3', startTime: 10, endTime: 15, text: 'Moving to the second slide. It is a general-purpose platform.', pageNumber: 2 },
  { id: '4', startTime: 15, endTime: 20, text: 'This is a mock subtitle for the second slide.', pageNumber: 2 },
  { id: '5', startTime: 20, endTime: 25, text: 'And finally, the third slide. End of the presentation.', pageNumber: 3 },
  { id: '6', startTime: 25, endTime: 30, text: 'Just some extra text to test scrolling.', pageNumber: 3 },
  { id: '7', startTime: 30, endTime: 35, text: 'More text for the third slide.', pageNumber: 3 },
];

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const audioRef = useRef<number | null>(null); // Mock audio timer
  const subtitleViewerRef = useRef<{ scrollToChunk: (id: string) => void }>(null);

  // Mock Audio Player Logic
  useEffect(() => {
    if (isPlaying) {
      audioRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 35) {
            setIsPlaying(false);
            return 35;
          }
          return prev + 0.1 * playbackSpeed;
        });
      }, 100);
    } else {
      if (audioRef.current) {
        clearInterval(audioRef.current);
        audioRef.current = null;
      }
    }
    return () => {
      if (audioRef.current) {
        clearInterval(audioRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  // Sync: Time -> Highlight & Page
  useEffect(() => {
    const currentSubtitle = MOCK_SUBTITLES.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    
    if (currentSubtitle) {
      // If page changed due to time, update activePage
      if (currentSubtitle.pageNumber !== activePage) {
        setActivePage(currentSubtitle.pageNumber);
      }
    }
  }, [currentTime, activePage]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSubtitleClick = (subtitle: Subtitle) => {
    setCurrentTime(subtitle.startTime);
    setActivePage(subtitle.pageNumber);
    setIsPlaying(true);
  };

  // Called when user scrolls the subtitle list and a new chunk becomes the top visible one
  const handleVisibleChunkChange = useCallback((pageNumber: number) => {
    setActivePage(pageNumber);
  }, []);

  // Handle Slide Navigation (Swipe/Tap/Buttons)
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > numPages) return;
    
    setActivePage(newPage);
    
    // Find the first subtitle chunk for this page
    const targetSubtitle = MOCK_SUBTITLES.find(s => s.pageNumber === newPage);
    if (targetSubtitle && subtitleViewerRef.current) {
      subtitleViewerRef.current.scrollToChunk(targetSubtitle.id);
      // Optionally seek to that time?
      // setCurrentTime(targetSubtitle.startTime); 
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black overflow-hidden">
      {/* 1. Slide Viewer (Fixed Top) */}
      <div className="flex-none w-full bg-black relative z-10 shadow-md" style={{ aspectRatio: '16/9' }}>
        <PdfViewer
          url={MOCK_PDF_URL}
          pageNumber={activePage}
          onDocumentLoadSuccess={(num) => setNumPages(num)}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 2. Subtitle Component (Scrollable Middle) */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-900">
        <SubtitleViewer
          ref={subtitleViewerRef}
          subtitles={MOCK_SUBTITLES}
          currentTime={currentTime}
          activePage={activePage}
          onSubtitleClick={handleSubtitleClick}
          onVisibleChunkChange={handleVisibleChunkChange}
        />
      </div>

      {/* 3. Controls (Fixed Bottom) */}
      <div className="flex-none bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 safe-area-bottom z-20">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 mb-4 dark:bg-gray-700 cursor-pointer relative group">
           <div
             className="bg-blue-600 h-1 rounded-full absolute top-0 left-0"
             style={{ width: `${(currentTime / 35) * 100}%` }}
           ></div>
           {/* Thumb (visible on hover/drag - simplified for now) */}
           <div 
             className="w-3 h-3 bg-blue-600 rounded-full absolute top-1/2 -translate-y-1/2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
             style={{ left: `${(currentTime / 35) * 100}%` }}
           />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 font-mono w-12">
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
          </div>

          <div className="flex items-center gap-6">
             <button
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage <= 1}
              className="p-2 text-gray-600 dark:text-gray-400 disabled:opacity-30"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>

            <button
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage >= numPages}
              className="p-2 text-gray-600 dark:text-gray-400 disabled:opacity-30"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-12 justify-end">
             <button 
               onClick={() => setPlaybackSpeed(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1)}
               className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded"
             >
               {playbackSpeed}x
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
