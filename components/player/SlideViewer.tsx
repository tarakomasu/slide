'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { ChevronLeft, ChevronRight } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface SlideViewerProps {
  pdfUrl: string;
  activePage: number;
  onPageChange: (page: number) => void;
  numPages: number;
}

export default function SlideViewer({ pdfUrl, activePage, onPageChange, numPages }: SlideViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const renderTaskRef = useRef<RenderTask | null>(null);

  // Load the PDF document
  useEffect(() => {
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
      setIsLoading(false);
    };
    loadPdf();
  }, [pdfUrl]);

  // Render a page
  const renderPage = useCallback(async (doc: PDFDocumentProxy, pageNum: number) => {
    if (!canvasRef.current) return;
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      const page: PDFPageProxy = await doc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale: 1.0 });
      const containerWidth = canvas.parentElement?.clientWidth || viewport.width;
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      canvas.style.width = `${scaledViewport.width / (window.devicePixelRatio || 1)}px`;
      canvas.style.height = `${scaledViewport.height / (window.devicePixelRatio || 1)}px`;
      
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    }
  }, []);

  useEffect(() => {
    if (pdfDoc && activePage) {
      renderPage(pdfDoc, activePage);
    }
  }, [pdfDoc, activePage, renderPage]);

  const handlePrev = () => {
    if (activePage > 1) {
      onPageChange(activePage - 1);
    }
  };

  const handleNext = () => {
    if (activePage < numPages) {
      onPageChange(activePage + 1);
    }
  };

  return (
    <div className="w-full h-full bg-gray-900 flex justify-center items-center relative group">
      {isLoading ? (
        <div className="text-white">Loading slides...</div>
      ) : (
        <canvas ref={canvasRef} className="max-w-full max-h-full" />
      )}

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handlePrev}
          disabled={activePage <= 1}
          className="h-full w-1/5 text-white/50 hover:bg-black/20 disabled:opacity-20"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
        <button
          onClick={handleNext}
          disabled={activePage >= numPages}
          className="h-full w-1/5 text-white/50 hover:bg-black/20 disabled:opacity-20 flex justify-end"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>

      {/* Page Indicator */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {activePage} / {numPages}
      </div>
    </div>
  );
}
