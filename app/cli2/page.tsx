'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';

// Set worker source once
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function PdfViewerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const pdfUrl = '/slide-demo.pdf';

  const renderPage = useCallback(async (doc: PDFDocumentProxy, pageNum: number) => {
    if (!canvasRef.current) return;
    
    // Cancel previous render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      const page: PDFPageProxy = await doc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1.5 });
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;
      await task.promise;
      renderTaskRef.current = null;

    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    }
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load the PDF file. Please check the file path.');
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);
  
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
    // Cleanup on unmount
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, renderPage]);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(numPages, prev + 1));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 text-white">
          <button 
            onClick={goToPreviousPage} 
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-gray-600 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {numPages || '--'}
          </span>
          <button 
            onClick={goToNextPage} 
            disabled={currentPage >= numPages || numPages === 0}
            className="px-4 py-2 bg-gray-600 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="p-4 bg-gray-100 flex justify-center">
            {loading && <div className="text-center text-gray-500">Loading PDF...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {!loading && !error && (
                <canvas ref={canvasRef} className="shadow-lg" />
            )}
        </div>
      </div>
      <a href="/slide-demo.pdf" download className="mt-4 text-blue-500 hover:underline">
        Download PDF
      </a>
    </div>
  );
}
