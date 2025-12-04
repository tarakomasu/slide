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
}

export default function PdfViewer({ url, pageNumber, onDocumentLoadSuccess }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const renderTaskRef = useRef<any>(null);

  // Render Page
  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      // Cancel previous render task if it exists
      if (renderTaskRef.current) {
        try {
          await renderTaskRef.current.cancel();
        } catch (error) {
          // Ignore cancel error
        }
      }

      if (isCancelled) return;

      try {
        const page = await pdfDoc.getPage(pageNumber);
        
        if (isCancelled) return;

        const containerWidth = canvasRef.current.parentElement?.clientWidth || window.innerWidth || 800;
        
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
          canvas: canvas,
        };

        // If there's a pending render task, cancel it again just in case
        if (renderTaskRef.current) {
            try {
                await renderTaskRef.current.cancel();
            } catch (e) { /* ignore */ }
        }

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div className="w-full flex justify-center items-center bg-gray-100 min-h-[300px] overflow-hidden">
      {loading && <div className="text-gray-500">Loading PDF...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <canvas ref={canvasRef} className="block max-w-full shadow-lg" />
    </div>
  );
}
