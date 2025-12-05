'use client';

import { useState, useEffect, useRef } from 'react';
import { mockPresentation, PresentationData } from '@/data/mock-presentation';
import SlideViewer from '@/components/player/SlideViewer';
import SubtitleViewer from '@/components/player/SubtitleViewer';
import PlayerControls from '@/components/player/PlayerControls';
import AudioPlayer from '@/components/player/AudioPlayer';

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [activePage, setActivePage] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPresentation(mockPresentation);
    if (mockPresentation.duration) {
      setDuration(mockPresentation.duration);
    }
  }, [params.id]);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (!presentation) {
    return <div>Loading presentation...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="relative w-full aspect-[16/9] flex-shrink-0">
        <SlideViewer 
          pdfUrl={presentation.pdfUrl}
          activePage={activePage}
          onPageChange={setActivePage}
          numPages={presentation.subtitles.at(-1)?.pageNumber ?? 1}
        />
      </div>

      <div className="flex-grow overflow-y-auto bg-gray-100">
        <SubtitleViewer 
          subtitles={presentation.subtitles}
          activePage={activePage}
          onPageChange={setActivePage}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      </div>

      <div className="flex-shrink-0">
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
      </div>
      
      <AudioPlayer
        ref={audioRef}
        audioUrl={presentation.audioUrl}
        isPlaying={isPlaying}
        onTimeUpdate={setCurrentTime}
        onLoadedMetadata={(d) => setDuration(d)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}