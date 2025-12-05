'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onEnded: () => void;
}

const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  ({ audioUrl, isPlaying, onTimeUpdate, onLoadedMetadata, onEnded }, ref) => {
    const localRef = useRef<HTMLAudioElement>(null);
    
    // Expose the local ref to the parent component.
    useImperativeHandle(ref, () => localRef.current as HTMLAudioElement);

    // Effect to control play/pause
    useEffect(() => {
      if (localRef.current) {
        if (isPlaying) {
          localRef.current.play().catch(e => console.error("Audio play failed", e));
        } else {
          localRef.current.pause();
        }
      }
    }, [isPlaying]);

    // Event listeners setup
    useEffect(() => {
      const audio = localRef.current;
      if (!audio) return;

      const handleTimeUpdate = () => onTimeUpdate(audio.currentTime);
      const handleLoadedMetadata = () => onLoadedMetadata(audio.duration);

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', onEnded);
      };
    }, [onTimeUpdate, onLoadedMetadata, onEnded]);

    return <audio ref={localRef} src={audioUrl} />;
  }
);

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
