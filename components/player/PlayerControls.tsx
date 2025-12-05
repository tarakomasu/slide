'use client';

import { Play, Pause } from 'lucide-react';
import { ChangeEvent } from 'react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const floorSeconds = Math.floor(seconds);
  const min = Math.floor(floorSeconds / 60);
  const sec = floorSeconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onSeek,
}: PlayerControlsProps) {
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  return (
    <div className="bg-gray-900 text-white p-3 flex items-center space-x-4">
      <button onClick={onPlayPause} className="p-2 rounded-full bg-white text-gray-900">
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <span className="text-sm w-12 text-center">{formatTime(currentTime)}</span>

      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #4F46E5 ${
            (currentTime / duration) * 100
          }%, #4B5563 ${(currentTime / duration) * 100}%)`,
        }}
      />

      <span className="text-sm w-12 text-center">{formatTime(duration)}</span>
    </div>
  );
}
