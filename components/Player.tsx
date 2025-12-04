'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import SubtitleViewer, { Subtitle } from './SubtitleViewer';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

// Mock Data
const MOCK_PDF_URL = '/slide-demo.pdf';
const MOCK_SUBTITLES: Subtitle[] = [
  { id: '1', startTime: 0, endTime: 5, text: 'Hello, world! This is the first slide.', pageNumber: 1 },
  { id: '2', startTime: 5, endTime: 10, text: 'We are learning about PDF.js today.', pageNumber: 1 },
  { id: '3', startTime: 10, endTime: 15, text: 'Moving to the second slide. It is a general-purpose platform.', pageNumber: 2 },
  { id: '4', startTime: 15, endTime: 20, text: 'This is a mock subtitle for the second slide.', pageNumber: 2 },
  { id: '5', startTime: 20, endTime: 25, text: 'And finally, the third slide. End of the presentation.', pageNumber: 3 },
];

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const audioRef = useRef<number | null>(null); // Mock audio timer

  // Mock Audio Player Logic
  useEffect(() => {
    if (isPlaying) {
      audioRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 25) {
            setIsPlaying(false);
            return 25;
          }
          return prev + 0.1;
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
  }, [isPlaying]);

  // Sync Page with Time
  useEffect(() => {
    const currentSubtitle = MOCK_SUBTITLES.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    if (currentSubtitle && currentSubtitle.pageNumber !== pageNumber) {
      setPageNumber(currentSubtitle.pageNumber);
    }
  }, [currentTime, pageNumber]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSubtitleClick = (startTime: number) => {
    setCurrentTime(startTime);
    setIsPlaying(true);
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    // Find start time of the page
    const pageSubtitle = MOCK_SUBTITLES.find((s) => s.pageNumber === newPage);
    if (pageSubtitle) {
      setCurrentTime(pageSubtitle.startTime);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black">
      {/* Slide Area (Fixed Top) */}
      <div className="flex-none w-full bg-black aspect-video relative">
        <PdfViewer
          url={MOCK_PDF_URL}
          pageNumber={pageNumber}
          onDocumentLoadSuccess={(num) => setNumPages(num)}
        />
        {/* <div className="text-white p-4 flex items-center justify-center h-full">
          <p>PDF Viewer (Temporarily Disabled for Debugging)</p>
        </div> */}

      </div>

      {/* Subtitle Area (Scrollable) */}
      <div className="flex-1 overflow-hidden relative">
        <SubtitleViewer
          subtitles={MOCK_SUBTITLES}
          currentTime={currentTime}
          onSubtitleClick={handleSubtitleClick}
        />
      </div>

      {/* Controls (Fixed Bottom) */}
      <div className="flex-none bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 safe-area-bottom">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            onClick={() => handlePageChange(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / 25) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
