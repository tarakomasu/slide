'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';

// Set worker source to the file in public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  url: string;
  pageNumber: number;
  onDocumentLoadSuccess?: (numPages: number) => void;
  onPageChange?: (newPage: number) => void;
}

export default function PdfViewer({ url, pageNumber, onDocumentLoadSuccess, onPageChange }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);
  
  // Touch handling state
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
        // Next page
        onPageChange?.(pageNumber + 1);
    } else if (isRightSwipe) {
        // Prev page
        onPageChange?.(pageNumber - 1);
    }
  };

  // Load PDF Document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadingTask = pdfjsLib.getDocument(url);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        if (onDocumentLoadSuccess) {
          onDocumentLoadSuccess(doc.numPages);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    loadPdf();
  }, [url, onDocumentLoadSuccess]);

  // Render Page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      // Cancel previous render task
      if (renderTaskRef.current) {
        try {
          await renderTaskRef.current.cancel();
        } catch (error) {
          // Ignore cancel error
        }
      }

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1.0 });

        const scale = containerWidth / viewport.width;
        const displaySize = {
          width: Math.floor(viewport.width * scale),
          height: Math.floor(viewport.height * scale),
        };

        // Get the device pixel ratio to render at high resolution
        const devicePixelRatio = window.devicePixelRatio || 1;

        // Adjust canvas size for high-DPI screens
        canvas.width = displaySize.width * devicePixelRatio;
        canvas.height = displaySize.height * devicePixelRatio;

        // Adjust canvas style to fit the container
        canvas.style.width = `${displaySize.width}px`;
        canvas.style.height = `${displaySize.height}px`;

        // Scale the canvas context to match the high-DPI rendering
        context.scale(devicePixelRatio, devicePixelRatio);

        const scaledViewport = page.getViewport({ scale: scale });

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;

      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div 
        className="w-full h-full flex justify-center items-center bg-gray-100 overflow-hidden touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      {loading && <div className="text-gray-500">Loading PDF...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <canvas ref={canvasRef} className="block max-w-full shadow-lg" />
    </div>
  );
}
