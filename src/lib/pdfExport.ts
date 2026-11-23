import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface ExportPDFOptions {
  forceShare?: boolean;
}

export interface ExportPDFResult {
  blob: Blob;
  url: string;
  method: 'share' | 'download' | 'view';
}

export async function exportToPDF(
  elementId: string,
  filename: string = 'invoice.pdf',
  options: ExportPDFOptions = {}
): Promise<ExportPDFResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Ensure custom web fonts are fully loaded
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  // Ensure all images (logos, signatures) within element are loaded
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    })
  );

  // Short pause to ensure CSS layout and fonts are completely painted
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Determine standard A4 dimensions (210mm x 297mm in pixels at 96 DPI: 794px x 1123px)
  const targetWidth = 794;
  const targetHeight = Math.max(element.scrollHeight, 1123);

  // Measure current scale factor (on mobile, parent uses transform: scale(autoScale))
  const elementRect = element.getBoundingClientRect();
  const scaleFactor = elementRect.width / (element.offsetWidth || targetWidth) || 1;

  // Safe canvas scale (prevents iOS Safari memory limit crash on multi-page invoices)
  const canvasScale = Math.min(2, Math.floor(4096 / targetHeight) || 1);

  // Capture the element at high resolution
  const canvas = await html2canvas(element, {
    scale: canvasScale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: targetWidth,
    height: targetHeight,
    windowWidth: targetWidth,
    windowHeight: targetHeight,
    scrollX: 0,
    scrollY: 0,
    onclone: (documentClone) => {
      const clonedElement = documentClone.getElementById(elementId);
      if (clonedElement) {
        // Isolate cloned element
        documentClone.body.innerHTML = '';
        documentClone.body.style.width = `${targetWidth}px`;
        documentClone.body.style.minWidth = `${targetWidth}px`;
        documentClone.body.style.margin = '0';
        documentClone.body.style.padding = '0';
        documentClone.documentElement.style.width = `${targetWidth}px`;
        documentClone.documentElement.style.minWidth = `${targetWidth}px`;

        documentClone.body.appendChild(clonedElement);
        clonedElement.style.transform = 'none';
        clonedElement.style.margin = '0';
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.width = `${targetWidth}px`;
        clonedElement.style.minWidth = `${targetWidth}px`;
        clonedElement.style.height = `${targetHeight}px`;

        // Freeze flex items by dividing by scaleFactor to recover unscaled A4 resolution on mobile
        const originalFlexElements = element.querySelectorAll('.flex-1, .grow');
        const clonedFlexElements = clonedElement.querySelectorAll('.flex-1, .grow');

        originalFlexElements.forEach((orig, index) => {
          const cloneNode = clonedFlexElements[index] as HTMLElement;
          if (cloneNode) {
            const rect = orig.getBoundingClientRect();
            const unscaledHeight = Math.round(rect.height / scaleFactor);
            const unscaledWidth = Math.round(rect.width / scaleFactor);

            cloneNode.style.height = `${unscaledHeight}px`;
            cloneNode.style.minHeight = `${unscaledHeight}px`;
            cloneNode.style.maxHeight = `${unscaledHeight}px`;
            cloneNode.style.width = `${unscaledWidth}px`;
            cloneNode.style.minWidth = `${unscaledWidth}px`;
            cloneNode.style.maxWidth = `${unscaledWidth}px`;
          }
        });

        // Also freeze the height of the empty stretching row in the table layout
        const emptyRow = element.querySelector('#empty-stretch-row') as HTMLElement;
        const clonedEmptyRow = clonedElement.querySelector('#empty-stretch-row') as HTMLElement;
        if (emptyRow && clonedEmptyRow) {
          const rect = emptyRow.getBoundingClientRect();
          const unscaledHeight = Math.round(rect.height / scaleFactor);
          clonedEmptyRow.style.height = `${unscaledHeight}px`;
        }
      }
    },
  });

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  if (imgWidth === 0 || imgHeight === 0) {
    throw new Error('Canvas render produced empty dimensions. Please ensure preview is visible.');
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  // Scale image to fit A4 width
  const ratio = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Tolerance for sub-pixel overflow
  const epsilon = 1.5;
  if (scaledHeight <= pdfHeight + epsilon) {
    // Single page, clip to exactly pdfHeight
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(scaledHeight, pdfHeight));
  } else {
    // Multi-page: slice the canvas into page-sized chunks
    let yOffset = 0;
    let pageIndex = 0;
    const pageHeightInPx = pdfHeight / ratio;

    while (yOffset < imgHeight) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidth;
      const remainingHeight = imgHeight - yOffset;
      pageCanvas.height = Math.floor(Math.min(pageHeightInPx, remainingHeight));

      if (pageCanvas.height <= 0) break;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          yOffset,
          imgWidth,
          pageCanvas.height,
          0,
          0,
          imgWidth,
          pageCanvas.height
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      const pageScaledHeight = pageCanvas.height * ratio;
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageScaledHeight);

      yOffset += pageHeightInPx;
      pageIndex++;
    }
  }

  // Generate PDF blob
  const pdfBlob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  // Detect iOS vs Android vs Desktop
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid || (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);

  // 1. Web Share API with Files
  // On iOS Safari, <a download> with blob URLs does NOT trigger file download.
  // navigator.share with files is the official iOS way (opens "Save to Files", WhatsApp, AirDrop).
  // Also used when options.forceShare is requested.
  if (options.forceShare || (isIOS && typeof navigator.share === 'function')) {
    if (typeof navigator.share === 'function') {
      try {
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: filename,
          });
          return { blob: pdfBlob, url: blobUrl, method: 'share' };
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // User closed share sheet intentionally
          return { blob: pdfBlob, url: blobUrl, method: 'share' };
        }
        console.warn('Web Share failed, proceeding to fallback:', err);
      }
    }

    if (isIOS) {
      // iOS Safari fallback: open PDF directly in browser tab so user can view & save via Safari
      const opened = window.open(blobUrl, '_blank');
      if (!opened) {
        window.location.href = blobUrl;
      }
      return { blob: pdfBlob, url: blobUrl, method: 'view' };
    }
  }

  // 2. Android & Desktop standard download via HTML5 <a> tag
  try {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
    }, 500);

    return { blob: pdfBlob, url: blobUrl, method: 'download' };
  } catch (downloadErr) {
    console.warn('Direct download link click failed:', downloadErr);
    // Ultimate fallback: open blob URL in new window/tab
    window.open(blobUrl, '_blank');
    return { blob: pdfBlob, url: blobUrl, method: 'view' };
  }
}
