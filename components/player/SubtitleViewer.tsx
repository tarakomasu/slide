'use client';

import { useEffect, useRef, useMemo } from 'react';
import { SubtitleChunk } from '@/data/mock-presentation';

interface SubtitleViewerProps {
  subtitles: SubtitleChunk[];
  activePage: number;
  onPageChange: (page: number) => void;
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function SubtitleViewer({ subtitles, activePage, onPageChange, currentTime, onSeek }: SubtitleViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingProgrammatically = useRef(false);

  const pageNumberToFirstIndex = useMemo(() => {
    const map = new Map<number, number>();
    subtitles.forEach((subtitle, index) => {
      if (!map.has(subtitle.pageNumber)) {
        map.set(subtitle.pageNumber, index);
      }
    });
    return map;
  }, [subtitles]);

  const currentSubtitleIndex = useMemo(() => {
    return subtitles.findIndex(s => currentTime >= s.startTime && currentTime < s.endTime);
  }, [currentTime, subtitles]);
  
  // Effect for IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;
        const intersectingEntries = entries.filter(e => e.isIntersecting);
        if (intersectingEntries.length > 0) {
          const topmostEntry = intersectingEntries.reduce((prev, current) => 
            (prev.boundingClientRect.top < current.boundingClientRect.top) ? prev : current
          );
          const pageStr = (topmostEntry.target as HTMLElement).dataset.page;
          if (pageStr) {
            const pageNum = parseInt(pageStr, 10);
            if (activePage !== pageNum) onPageChange(pageNum);
          }
        }
      },
      { root: scrollRef.current, rootMargin: '0px 0px -90% 0px', threshold: 0.1 }
    );
    const refs = itemRefs.current;
    refs.forEach(ref => { if (ref) observer.observe(ref); });
    return () => refs.forEach(ref => { if (ref) observer.unobserve(ref); });
  }, [onPageChange, activePage]);

  // Effect to scroll to active page
  useEffect(() => {
    const index = pageNumberToFirstIndex.get(activePage);
    if (index !== undefined && itemRefs.current[index]) {
      isScrollingProgrammatically.current = true;
      itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isScrollingProgrammatically.current = false; }, 1000);
    }
  }, [activePage, pageNumberToFirstIndex]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-2 bg-gray-50">
      {subtitles.map((subtitle, index) => (
        <div
          key={index}
          ref={el => itemRefs.current[index] = el}
          data-page={subtitle.pageNumber}
          onClick={() => onSeek(subtitle.startTime)}
          className={`flex items-start space-x-3 p-3 rounded-lg transition-colors duration-200 cursor-pointer ${
            index === currentSubtitleIndex ? 'bg-blue-100' : 'bg-white'
          } hover:bg-gray-100`}
        >
          <div className={`flex-shrink-0 w-16 h-12 flex items-center justify-center rounded-md border-2 ${subtitle.pageNumber === activePage ? 'border-blue-500' : 'border-gray-200'}`}>
            <span className="text-gray-500 text-xs font-semibold">P.{subtitle.pageNumber}</span>
          </div>
          <p className="text-gray-800 leading-relaxed pt-1">
            {subtitle.text}
          </p>
        </div>
      ))}
    </div>
  );
}
