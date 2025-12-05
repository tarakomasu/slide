'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';

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
  activePage: number;
  onSubtitleClick?: (subtitle: Subtitle) => void;
  onVisibleChunkChange?: (pageNumber: number) => void;
}

const SubtitleViewer = forwardRef<{ scrollToChunk: (id: string) => void }, SubtitleViewerProps>(
  ({ subtitles, currentTime, activePage, onSubtitleClick, onVisibleChunkChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const isAutoScrolling = useRef(false);

    // Expose scrollToChunk method
    useImperativeHandle(ref, () => ({
      scrollToChunk: (id: string) => {
        const element = itemRefs.current.get(id);
        if (element && containerRef.current) {
          isAutoScrolling.current = true;
          
          // Scroll the element to the top of the container with some padding
          const container = containerRef.current;
          const elementTop = element.offsetTop;
          
          container.scrollTo({
            top: elementTop - 16, // 16px padding
            behavior: 'smooth',
          });

          // Reset auto-scroll flag after animation (approximate)
          setTimeout(() => {
            isAutoScrolling.current = false;
          }, 500);
        }
      },
    }));

    // Auto-scroll to active subtitle based on time (only if not manually scrolling?)
    // Actually, requirement says: "If highlight target is off-screen, slowly scroll to it."
    // For MVP, let's keep it simple: if the active subtitle changes due to time, ensure it's visible.
    useEffect(() => {
      const activeSubtitle = subtitles.find(
        (s) => currentTime >= s.startTime && currentTime < s.endTime
      );

      if (activeSubtitle && !isAutoScrolling.current) {
         const element = itemRefs.current.get(activeSubtitle.id);
         if (element && containerRef.current) {
            // Check if element is visible
            const container = containerRef.current;
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const isVisible = (
                rect.top >= containerRect.top &&
                rect.bottom <= containerRect.bottom
            );

            if (!isVisible) {
                // Scroll into view
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest', // 'center' might be better but 'nearest' is less disruptive
                });
            }
         }
      }
    }, [currentTime, subtitles]);

    // Detect visible chunk on scroll
    const handleScroll = useCallback(() => {
        if (isAutoScrolling.current || !containerRef.current || !onVisibleChunkChange) return;

        const container = containerRef.current;
        const containerTop = container.scrollTop;
        
        // Find the first element that is visible at the top
        // We can iterate through subtitles and check their offsets
        // Optimization: could use IntersectionObserver but simple offset check is fine for small lists
        
        let topVisibleSubtitle: Subtitle | null = null;
        
        for (const subtitle of subtitles) {
            const element = itemRefs.current.get(subtitle.id);
            if (element) {
                // If the element's bottom is below the container top + padding, it's the first visible one
                if (element.offsetTop + element.offsetHeight > containerTop + 20) {
                    topVisibleSubtitle = subtitle;
                    break;
                }
            }
        }

        if (topVisibleSubtitle) {
            onVisibleChunkChange(topVisibleSubtitle.pageNumber);
        }

    }, [subtitles, onVisibleChunkChange]);

    return (
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto bg-white dark:bg-gray-900"
      >
        <div className="p-4 space-y-4 pb-24"> {/* Extra padding at bottom for scrolling */}
            {subtitles.map((subtitle) => {
            const isActiveTime = currentTime >= subtitle.startTime && currentTime < subtitle.endTime;
            const isActivePage = activePage === subtitle.pageNumber;
            
            return (
                <div
                key={subtitle.id}
                ref={(el) => {
                    if (el) itemRefs.current.set(subtitle.id, el);
                    else itemRefs.current.delete(subtitle.id);
                }}
                onClick={() => onSubtitleClick?.(subtitle)}
                className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-l-4 ${
                    isActiveTime
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : isActivePage 
                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                }`}
                >
                {/* Thumbnail Placeholder */}
                <div className={`flex-none w-16 h-16 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 ${isActivePage ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}>
                    <span className="font-mono">P{subtitle.pageNumber}</span>
                </div>

                {/* Text */}
                <div className="flex-1">
                    <p className={`text-base leading-relaxed ${isActiveTime ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                    {subtitle.text}
                    </p>
                    {/* <span className="text-xs text-gray-400 mt-1 block">
                        {subtitle.startTime}s - {subtitle.endTime}s
                    </span> */}
                </div>
                </div>
            );
            })}
        </div>
      </div>
    );
  }
);

SubtitleViewer.displayName = 'SubtitleViewer';

export default SubtitleViewer;
