import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportToPDF(
  elementId: string,
  filename: string = 'invoice.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Wait for fonts/images to be fully ready (just in case)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Capture the element at high resolution
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (documentClone) => {
      const clonedElement = documentClone.getElementById(elementId);
      if (clonedElement) {
        // Isolate the element to avoid parent CSS (overflow, transforms, flex) from breaking the canvas
        documentClone.body.innerHTML = '';
        documentClone.body.appendChild(clonedElement);
        clonedElement.style.transform = 'none';
        clonedElement.style.margin = '0';
        clonedElement.style.boxShadow = 'none'; // Don't render the shadow in the PDF
        // Force exact dimensions on the root
        clonedElement.style.width = `${element.scrollWidth}px`;
        clonedElement.style.height = `${element.scrollHeight}px`;
        
        // html2canvas has severe bugs calculating dynamic flexbox sizes (flex-1, grow).
        // To fix this, we measure the EXACT rendered pixel dimensions in the live DOM
        // and hardcode them onto the cloned elements before html2canvas renders them.
        const originalFlexElements = element.querySelectorAll('.flex-1, .grow');
        const clonedFlexElements = clonedElement.querySelectorAll('.flex-1, .grow');
        
        originalFlexElements.forEach((orig, index) => {
          const cloneNode = clonedFlexElements[index] as HTMLElement;
          if (cloneNode) {
            const rect = orig.getBoundingClientRect();
            // Freeze height
            cloneNode.style.height = `${rect.height}px`;
            cloneNode.style.minHeight = `${rect.height}px`;
            cloneNode.style.maxHeight = `${rect.height}px`;
            // Freeze width
            cloneNode.style.width = `${rect.width}px`;
            cloneNode.style.minWidth = `${rect.width}px`;
            cloneNode.style.maxWidth = `${rect.width}px`;
          }
        });

        // Also freeze the height of the empty stretching row in the table layout
        const emptyRow = element.querySelector('#empty-stretch-row') as HTMLElement;
        const clonedEmptyRow = clonedElement.querySelector('#empty-stretch-row') as HTMLElement;
        if (emptyRow && clonedEmptyRow) {
          const rect = emptyRow.getBoundingClientRect();
          clonedEmptyRow.style.height = `${rect.height}px`;
        }
      }
    }
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  console.log('Canvas dimensions:', { imgWidth, imgHeight });
  if (imgWidth === 0 || imgHeight === 0) {
    throw new Error('html2canvas returned a 0x0 canvas. Please check if the element is visible.');
  }

  // Scale image to fit A4 width
  const ratio = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;
  
  console.log('Scaled height:', scaledHeight);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add a small tolerance (e.g. 1.5mm) to account for pixel-to-mm rounding errors
  // that cause exactly 1-page invoices to spill over by 0.01mm
  const epsilon = 1.5;
  if (scaledHeight <= pdfHeight + epsilon) {
    // Single page, clip to exactly pdfHeight to avoid overflow
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

      // Create a temporary canvas for this page slice
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

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);
      const pageScaledHeight = pageCanvas.height * ratio;
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageScaledHeight);

      yOffset += pageHeightInPx;
      pageIndex++;
    }
  }

  // Generate PDF blob and trigger download manually
  // We intentionally do not revoke the URL to prevent Edge/Chrome from losing the 'download' attribute
  // during async garbage collection, which previously caused the UUID file names.
  const pdfBlob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
