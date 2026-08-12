import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import mammoth from 'mammoth';

// Set up pdf.js worker URL for Vite environment
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch (err) {
  console.warn('Could not set pdf.js workerSrc URL:', err);
}

/**
 * Extract total page count from a PDF file using pdfjs-dist
 */
export async function parsePdfPages(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDocument = await loadingTask.promise;
  return pdfDocument.numPages;
}

/**
 * Extract total page count from a Word (.docx) file.
 * First attempts to read docProps/app.xml inside the zip archive (<Pages>N</Pages>).
 * If not present or 0, parses text length via mammoth and estimates ~350 words per page.
 */
export async function parseDocxPages(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const appXmlFile = zip.file('docProps/app.xml');
    
    if (appXmlFile) {
      const xmlText = await appXmlFile.async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
      const pagesElement = xmlDoc.getElementsByTagName('Pages')[0];

      if (pagesElement && pagesElement.textContent) {
        const pages = parseInt(pagesElement.textContent.trim(), 10);
        if (!isNaN(pages) && pages > 0) {
          return pages;
        }
      }
    }
  } catch (err) {
    console.warn('Error reading docx XML metadata, falling back to mammoth text estimation:', err);
  }

  // Mammoth fallback: Extract raw text & estimate pages (approx 2000 chars or 350 words per page)
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || '';
    const trimmed = text.trim();
    if (trimmed.length === 0) return 1;
    
    // Split into words
    const words = trimmed.split(/\s+/).filter(Boolean);
    const estimatedPages = Math.ceil(words.length / 350);
    return Math.max(1, estimatedPages);
  } catch (err) {
    console.error('Failed to parse docx via mammoth:', err);
    return 1;
  }
}

/**
 * Formats a file size in bytes to human readable format (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats currency in VND (Việt Nam Đồng)
 */
export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats date string to DD/MM/YYYY HH:mm
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}
