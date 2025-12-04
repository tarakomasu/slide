'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Play, ZoomIn, Maximize, Text } from 'lucide-react';

export default function Player() {
  // Configure the PDF.js worker inside the component to ensure it runs only in the browser
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToNextSlide = () => {
    if (numPages === null) return;
    setCurrentSlide((prev) => (prev + 1) % numPages);
  };

  const goToPrevSlide = () => {
    if (numPages === null) return;
    setCurrentSlide((prev) => (prev - 1 + numPages) % numPages);
  };

  const toggleZoom = () => setIsZoomed(!isZoomed);
  const toggleTextMode = () => setIsTextMode(!isTextMode);

  // Gesture handler for swiping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const distance = touchStart - currentTouch;
    if (distance > minSwipeDistance) {
      goToNextSlide();
      setTouchStart(null);
    } else if (distance < -minSwipeDistance) {
      goToPrevSlide();
      setTouchStart(null);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-12rem)]">
      <PanelGroup direction="vertical">
        <Panel defaultSize={isTextMode ? 20 : 65} collapsible>
          <div 
            className="relative h-full bg-gray-800 flex items-center justify-center overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          >
            <Document
              file="/slide-demo.pdf"
              onLoadSuccess={onDocumentLoadSuccess}
              className={`flex items-center justify-center w-full h-full ${isZoomed ? 'scale-125' : 'scale-100'} transition-transform duration-300`}
            >
              <Page 
                pageNumber={currentSlide + 1} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={800} // This can be adjusted based on container size
              />
            </Document>

            {/* Navigation Overlays */}
            <div
              className="absolute left-0 top-0 h-full w-1/4 cursor-pointer"
              onClick={goToPrevSlide}
            />
            <div
              className="absolute right-0 top-0 h-full w-1/4 cursor-pointer"
              onClick={goToNextSlide}
            />

            <div className="absolute top-2 right-2 flex items-center gap-2 text-white">
                <button onClick={toggleZoom} className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all">
                    <ZoomIn size={20} />
                </button>
                <button onClick={toggleTextMode} className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all">
                    <Text size={20} />
                </button>
                <button className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all">
                    <Maximize size={20} />
                </button>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="h-2 bg-gray-200 hover:bg-blue-500 transition-colors duration-200 data-[resize-handle-active]:bg-blue-600" />
        <Panel defaultSize={isTextMode ? 80 : 35} collapsible>
          <div className="h-full flex flex-col">
            <div className="flex-grow p-4 md:p-6 overflow-y-auto text-gray-700 leading-relaxed">
              <p className="text-lg">
                字幕はここに表示されます (現在 {currentSlide + 1}ページ目を表示中)。
              </p>
            </div>
            <div className="flex-shrink-0 px-4 py-2 space-y-2 border-t">
              {numPages !== null && (
                <div 
                  className="w-full bg-gray-200 rounded-full h-1.5 cursor-pointer"
                  onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percent = clickX / rect.width;
                      const targetSlide = Math.floor(percent * numPages);
                      setCurrentSlide(targetSlide);
                  }}
                >
                    <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${((currentSlide + 1) / numPages) * 100}%` }}
                    ></div>
                </div>
              )}
              <div className="flex items-center justify-center gap-4">
                  <button className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Play size={28} />
                  </button>
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
