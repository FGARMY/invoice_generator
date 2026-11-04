import { Client, LineItem } from '@/types/invoice';
import { generateId } from './defaults';

export interface ParsedSheet {
  name: string;
  rows: string[][];
}

export type MappedField =
  | 'invoiceNumber'
  | 'documentTitle'
  | 'invoiceDate'
  | 'dueDate'
  | 'clientName'
  | 'clientCompany'
  | 'clientAddress'
  | 'clientGstin'
  | 'clientEmail'
  | 'clientPhone'
  | 'shippingAddress'
  | 'description'
  | 'hsnSac'
  | 'quantity'
  | 'unitPrice'
  | 'taxRate';

export type ColumnMapping = Partial<Record<MappedField, number>>;

export interface ExtractedInvoiceOption {
  id: string;
  label: string;
  invoiceNumber?: string;
  documentTitle?: string;
  invoiceDate?: string;
  dueDate?: string;
  client: Partial<Client>;
  lineItems: LineItem[];
  taxRate?: number;
  gstType?: 'intraState' | 'interState';
  shipping?: number;
}

export interface ExcelParseResult {
  sheets: ParsedSheet[];
  activeSheetIndex: number;
  headerRowIndex: number;
  headers: string[];
  dataRows: string[][];
  mapping: ColumnMapping;
  keyValueMetadata: Partial<Record<MappedField, string>>;
  invoices: ExtractedInvoiceOption[];
  isFormattedInvoiceLayout?: boolean;
}

export const FIELD_LABELS: { key: MappedField; label: string; group: 'Invoice' | 'Client' | 'Product / Line Item' }[] = [
  { key: 'invoiceNumber', label: 'Invoice Number', group: 'Invoice' },
  { key: 'documentTitle', label: 'Invoice Name / Title', group: 'Invoice' },
  { key: 'invoiceDate', label: 'Invoice Date', group: 'Invoice' },
  { key: 'dueDate', label: 'Due Date', group: 'Invoice' },
  { key: 'clientName', label: 'Client Name', group: 'Client' },
  { key: 'clientCompany', label: 'Client Company', group: 'Client' },
  { key: 'clientAddress', label: 'Client Address', group: 'Client' },
  { key: 'clientGstin', label: 'Client GSTIN / Tax ID', group: 'Client' },
  { key: 'clientEmail', label: 'Client Email', group: 'Client' },
  { key: 'clientPhone', label: 'Client Phone', group: 'Client' },
  { key: 'shippingAddress', label: 'Shipping Address', group: 'Client' },
  { key: 'description', label: 'Product Description', group: 'Product / Line Item' },
  { key: 'hsnSac', label: 'HSN / SAC Code', group: 'Product / Line Item' },
  { key: 'quantity', label: 'Quantity', group: 'Product / Line Item' },
  { key: 'unitPrice', label: 'Unit Price / Rate', group: 'Product / Line Item' },
  { key: 'taxRate', label: 'Tax / GST Rate (%)', group: 'Product / Line Item' },
];

const HEADER_SYNONYMS: Record<MappedField, string[]> = {
  invoiceNumber: [
    'invoice number',
    'invoice no',
    'invoice no.',
    'inv no',
    'inv number',
    'inv #',
    'invoice #',
    'invoice id',
    'bill no',
    'bill number',
    'invoice_number',
    'invoiceno',
  ],
  documentTitle: [
    'invoice name',
    'document title',
    'invoice title',
    'invoice type',
    'doc title',
    'document name',
    'bill title',
  ],
  invoiceDate: [
    'invoice date',
    'inv date',
    'bill date',
    'date',
    'dated',
    'invoice_date',
  ],
  dueDate: [
    'due date',
    'payment due',
    'due on',
    'due_date',
  ],
  clientName: [
    'client name',
    'customer name',
    'client',
    'customer',
    'party name',
    'party',
    'buyer name',
    'buyer',
    'bill to',
    'billed to',
    'consignee',
    'client_name',
    'name',
  ],
  clientCompany: [
    'client company',
    'customer company',
    'company name',
    'company',
    'organization',
    'firm name',
    'business name',
  ],
  clientAddress: [
    'client address',
    'customer address',
    'billing address',
    'bill to address',
    'party address',
    'buyer address',
    'address',
    'location',
  ],
  clientGstin: [
    'client gstin',
    'customer gstin',
    'buyer gstin',
    'party gstin',
    'gstin',
    'gst no',
    'gst number',
    'gstin/uin',
    'tax id',
    'gst',
  ],
  clientEmail: [
    'client email',
    'customer email',
    'email',
    'e-mail',
    'email id',
    'email address',
  ],
  clientPhone: [
    'client phone',
    'customer phone',
    'phone',
    'phone number',
    'phone no',
    'mobile',
    'mobile no',
    'contact',
    'contact no',
    'contact number',
    'tel',
  ],
  shippingAddress: [
    'shipping address',
    'ship to',
    'ship to address',
    'delivery address',
    'consignee address',
  ],
  description: [
    'product description',
    'item description',
    'description of goods',
    'description of services',
    'description',
    'product name',
    'product',
    'products',
    'item name',
    'item',
    'items',
    'particulars',
    'service',
    'services',
    'goods',
    'material',
  ],
  hsnSac: [
    'hsn/sac',
    'hsn / sac',
    'hsn code',
    'sac code',
    'hsn',
    'sac',
    'hsnsac',
    'hsn_sac',
  ],
  quantity: [
    'quantity',
    'qty',
    'qty.',
    'units',
    'nos',
    'pcs',
    'pieces',
    'count',
  ],
  unitPrice: [
    'unit price',
    'unit rate',
    'price',
    'rate',
    'unit cost',
    'cost',
    'mrp',
    'price per unit',
    'rate per unit',
    'amount',
  ],
  taxRate: [
    'tax rate',
    'tax %',
    'gst %',
    'gst rate',
    'igst %',
    'igst rate',
    'tax',
  ],
};

function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/[^a-z0-9#/%\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchHeaderToField(header: string): { field: MappedField; score: number } | null {
  const norm = normalizeHeader(header);
  if (!norm) return null;

  let bestMatch: { field: MappedField; score: number } | null = null;

  for (const [fieldKey, synonyms] of Object.entries(HEADER_SYNONYMS) as [MappedField, string[]][]) {
    for (const syn of synonyms) {
      if (norm === syn) {
        const score = 100 + syn.length;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { field: fieldKey, score };
        }
      } else if (norm.includes(syn) || (syn.length >= 5 && syn.includes(norm) && norm.length >= 4)) {
        const score = 50 + syn.length;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { field: fieldKey, score };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Decompress raw deflate bytes using Web Streams DecompressionStream
 */
async function inflateRaw(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressed as unknown as BufferSource);
  writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let totalLen = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      totalLen += value.byteLength;
    }
  }

  const out = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

/**
 * Extract files from a ZIP archive (such as .xlsx)
 */
async function unzipBuffer(buffer: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const files = new Map<string, Uint8Array>();
  const decoder = new TextDecoder('utf-8');

  // Locate End of Central Directory (EOCD) record (0x06054b50)
  let eocdOffset = -1;
  const minEocdSearch = Math.max(0, bytes.length - 65557);
  for (let i = bytes.length - 22; i >= minEocdSearch; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Invalid .xlsx file (ZIP Central Directory not found).');
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const cdOffset = view.getUint32(eocdOffset + 16, true);

  let ptr = cdOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (ptr + 46 > bytes.length || view.getUint32(ptr, true) !== 0x02014b50) {
      break;
    }

    const compressionMethod = view.getUint16(ptr + 10, true);
    const compressedSize = view.getUint32(ptr + 20, true);
    const fileNameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localHeaderOffset = view.getUint32(ptr + 42, true);

    const fileName = decoder.decode(bytes.subarray(ptr + 46, ptr + 46 + fileNameLen));
    ptr += 46 + fileNameLen + extraLen + commentLen;

    if (fileName.endsWith('/')) continue;

    if (localHeaderOffset + 30 > bytes.length) continue;
    const localSig = view.getUint32(localHeaderOffset, true);
    if (localSig !== 0x04034b50) continue;

    const localNameLen = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const rawData = bytes.subarray(dataStart, dataStart + compressedSize);

    if (compressionMethod === 0) {
      files.set(fileName, rawData);
    } else if (compressionMethod === 8) {
      const inflated = await inflateRaw(rawData);
      files.set(fileName, inflated);
    }
  }

  return files;
}

/**
 * Convert Excel column letters (e.g. "A", "BC") from cell reference "BC12" to 0-based index
 */
function colRefToIndex(cellRef: string): number {
  const match = cellRef.match(/^[A-Za-z]+/);
  if (!match) return -1;
  const letters = match[0].toUpperCase();
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

/**
 * Parse XML worksheet into 2D string array
 */
function parseWorksheetXml(xmlText: string, sharedStrings: string[]): string[][] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const rowNodes = Array.from(doc.getElementsByTagName('row'));
  const rows: string[][] = [];

  for (const rowNode of rowNodes) {
    const cellNodes = Array.from(rowNode.getElementsByTagName('c'));
    const rowValues: string[] = [];
    let currentCol = 0;

    for (const cell of cellNodes) {
      const ref = cell.getAttribute('r');
      if (ref) {
        const colIdx = colRefToIndex(ref);
        if (colIdx >= 0) currentCol = colIdx;
      }

      const cellType = cell.getAttribute('t');
      let val = '';

      if (cellType === 'inlineStr') {
        const tNodes = Array.from(cell.getElementsByTagName('t'));
        val = tNodes.map((t) => t.textContent || '').join('');
      } else {
        const vNode = cell.getElementsByTagName('v')[0];
        const rawVal = vNode?.textContent ?? '';
        if (cellType === 's') {
          const sIdx = parseInt(rawVal, 10);
          val = !isNaN(sIdx) && sharedStrings[sIdx] !== undefined ? sharedStrings[sIdx] : rawVal;
        } else {
          val = rawVal;
        }
      }

      while (rowValues.length < currentCol) {
        rowValues.push('');
      }
      rowValues[currentCol] = val.trim();
      currentCol++;
    }

    // Only include rows that have at least one non-empty cell
    if (rowValues.some((c) => c !== '')) {
      rows.push(rowValues);
    }
  }

  return rows;
}

/**
 * Parse CSV text into 2D string array
 */
function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (ch === '\r' || ch === '\n') {
        if (ch === '\r' && next === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Read an uploaded .xlsx or .csv file into ParsedSheet[]
 */
export async function readSpreadsheetFile(file: File): Promise<ParsedSheet[]> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.csv')) {
    const text = await file.text();
    return [{ name: 'Sheet1', rows: parseCsvText(text) }];
  }

  const buffer = await file.arrayBuffer();
  const zipFiles = await unzipBuffer(buffer);
  const decoder = new TextDecoder('utf-8');

  // 1. Parse sharedStrings.xml if present
  const sharedStrings: string[] = [];
  const sharedStringsBytes = zipFiles.get('xl/sharedStrings.xml');
  if (sharedStringsBytes) {
    const ssXml = decoder.decode(sharedStringsBytes);
    const parser = new DOMParser();
    const doc = parser.parseFromString(ssXml, 'application/xml');
    const siNodes = Array.from(doc.getElementsByTagName('si'));
    for (const si of siNodes) {
      // Ignore phonetic <rPh> elements
      const tNodes = Array.from(si.getElementsByTagName('t')).filter(
        (t) => t.parentElement?.tagName !== 'rPh'
      );
      sharedStrings.push(tNodes.map((t) => t.textContent || '').join(''));
    }
  }

  // 2. Discover sheet names from xl/workbook.xml and xl/_rels/workbook.xml.rels
  const sheets: ParsedSheet[] = [];
  const wbBytes = zipFiles.get('xl/workbook.xml');
  const relsBytes = zipFiles.get('xl/_rels/workbook.xml.rels');

  if (wbBytes && relsBytes) {
    const parser = new DOMParser();
    const wbDoc = parser.parseFromString(decoder.decode(wbBytes), 'application/xml');
    const relsDoc = parser.parseFromString(decoder.decode(relsBytes), 'application/xml');

    const relMap = new Map<string, string>();
    for (const rel of Array.from(relsDoc.getElementsByTagName('Relationship'))) {
      const id = rel.getAttribute('Id');
      const target = rel.getAttribute('Target');
      if (id && target) {
        const cleanTarget = target.startsWith('/')
          ? target.slice(1)
          : target.startsWith('xl/')
          ? target
          : `xl/${target}`;
        relMap.set(id, cleanTarget);
      }
    }

    for (const sheetNode of Array.from(wbDoc.getElementsByTagName('sheet'))) {
      const sheetName = sheetNode.getAttribute('name') || 'Sheet';
      const rId =
        sheetNode.getAttribute('r:id') ||
        sheetNode.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      const targetPath = rId ? relMap.get(rId) : undefined;
      if (targetPath && zipFiles.has(targetPath)) {
        const xmlText = decoder.decode(zipFiles.get(targetPath)!);
        const rows = parseWorksheetXml(xmlText, sharedStrings);
        if (rows.length > 0) {
          sheets.push({ name: sheetName, rows });
        }
      }
    }
  }

  // Fallback: scan any xl/worksheets/sheet*.xml
  if (sheets.length === 0) {
    for (const [path, content] of zipFiles.entries()) {
      if (path.startsWith('xl/worksheets/sheet') && path.endsWith('.xml')) {
        const rows = parseWorksheetXml(decoder.decode(content), sharedStrings);
        if (rows.length > 0) {
          sheets.push({ name: path.replace('xl/worksheets/', '').replace('.xml', ''), rows });
        }
      }
    }
  }

  if (sheets.length === 0) {
    throw new Error('No data found in the uploaded spreadsheet.');
  }

  return sheets;
}

/**
 * Convert Excel serial date or date string into YYYY-MM-DD
 */
function parseExcelDate(val: string): string | undefined {
  if (!val) return undefined;
  const trimmed = val.trim();

  // Check if Excel serial number (e.g., 45000 - 50000)
  if (/^\d{5}(\.\d+)?$/.test(trimmed)) {
    const serial = parseFloat(trimmed);
    if (serial > 25569 && serial < 70000) {
      const utcDays = Math.floor(serial - 25569);
      const date = new Date(utcDays * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
  }

  // Check YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Check DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY
  const dmy = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return undefined;
}

function parseNumber(val: string | undefined, fallback = 0): number {
  if (!val) return fallback;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
}

/**
 * Check if a cell value belongs to our own company (ADBPACK / ADE D BHARTY'S ENTERPRISES)
 * so we never overwrite client fields with our own seller details.
 */
function isOwnCompanyValue(val: string): boolean {
  const lower = val.toLowerCase();
  return (
    lower.includes('adbpack') ||
    lower.includes('d bharty') ||
    lower.includes('07adzpu4004') ||
    lower.includes('adzpu4004g') ||
    lower.includes('trilok puri')
  );
}

/**
 * Detect and parse formatted Tax Invoice blocks (like D Bharty's Enterprises Tax Invoice Excel layout)
 * Supports multiple stacked invoices in a single worksheet as well as multiple worksheets.
 */
function parseFormattedTaxInvoiceBlocks(
  rows: string[][],
  sheetName = 'Sheet'
): ExtractedInvoiceOption[] {
  // Find all rows containing "Consignee" or "Invoice No" to identify invoice blocks
  const consigneeRowIndices: number[] = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (row.some((c) => /^consignee\b/i.test(c.trim()))) {
      consigneeRowIndices.push(r);
    }
  }

  if (consigneeRowIndices.length === 0) {
    return [];
  }

  const results: ExtractedInvoiceOption[] = [];

  for (let idx = 0; idx < consigneeRowIndices.length; idx++) {
    const rCons = consigneeRowIndices[idx];
    const blockStart = idx === 0 ? 0 : Math.max(consigneeRowIndices[idx - 1] + 5, rCons - 10);
    const nextCons = idx + 1 < consigneeRowIndices.length ? consigneeRowIndices[idx + 1] : rows.length;
    const blockEnd = idx + 1 < consigneeRowIndices.length ? Math.max(rCons + 5, nextCons - 8) : rows.length;

    let documentTitle = 'TAX INVOICE';
    let invoiceNumber = '';
    let invoiceDate: string | undefined;

    // 1. Scan header area (blockStart..rCons) for Document Title, Invoice No.-, and Dated :
    for (let r = blockStart; r < rCons; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const cell = row[c].trim();
        if (!cell) continue;

        if (/^(tax\s*invoice|proforma\s*invoice|commercial\s*invoice|retail\s*invoice)$/i.test(cell)) {
          documentTitle = cell.toUpperCase();
        }

        // Match "Invoice No.-" or "Invoice No:"
        if (/^invoice\s*no/i.test(cell)) {
          // Check if value is inside the same cell after colon/dash
          const inlineMatch = cell.replace(/^invoice\s*no\.?\s*[-:]?\s*/i, '').trim();
          if (inlineMatch && /[0-9]/.test(inlineMatch)) {
            invoiceNumber = inlineMatch;
          } else {
            // Look in nearby rows (r..r+4) around column c (c-1..c+2)
            for (let nr = r; nr <= Math.min(rCons - 1, r + 4); nr++) {
              const nrow = rows[nr] || [];
              for (let nc = Math.max(0, c - 1); nc <= c + 2; nc++) {
                if (nr === r && nc === c) continue;
                const cand = (nrow[nc] || '').trim();
                if (
                  cand &&
                  /[0-9]/.test(cand) &&
                  !/^(dated|p\.?o|gstin|pan|state|3rd\s*floor|east\s*delhi)/i.test(cand) &&
                  !parseExcelDate(cand)
                ) {
                  invoiceNumber = cand;
                  break;
                }
              }
              if (invoiceNumber) break;
            }
          }
        }

        // Match "Dated :"
        if (/^dated\b/i.test(cell)) {
          const inlineDate = cell.replace(/^dated\s*[-:]?\s*/i, '').trim();
          const parsedInline = parseExcelDate(inlineDate);
          if (parsedInline) {
            invoiceDate = parsedInline;
          } else {
            for (let nr = r; nr <= Math.min(rCons - 1, r + 4); nr++) {
              const nrow = rows[nr] || [];
              for (let nc = Math.max(0, c - 1); nc <= c + 3; nc++) {
                if (nr === r && nc === c) continue;
                const cand = (nrow[nc] || '').trim();
                if (!cand) continue;
                const parsed = parseExcelDate(cand);
                if (parsed) {
                  invoiceDate = parsed;
                  break;
                }
              }
              if (invoiceDate) break;
            }
          }
        }
      }
    }

    // 2. Locate "Consignee" and "Shipping Address" columns on row rCons
    const consRow = rows[rCons] || [];
    let cCons = consRow.findIndex((c) => /^consignee\b/i.test(c.trim()));
    if (cCons === -1) cCons = 0;
    const cShip = consRow.findIndex((c) => /^shipping\s*address/i.test(c.trim()));

    // Find the Line Items table header row below rCons
    let rTable = -1;
    for (let r = rCons + 1; r < blockEnd; r++) {
      const row = rows[r];
      const hasDescHeader = row.some((c) => /description\s*of\s*goods/i.test(c) || /^description$/i.test(c.trim()));
      const hasSnoOrHsn = row.some((c) => /^s\.?\s*no/i.test(c.trim()) || /hsn\s*\/?\s*sac/i.test(c));
      if (hasDescHeader || hasSnoOrHsn) {
        rTable = r;
        break;
      }
    }

    const consigneeEndRow = rTable !== -1 ? rTable : Math.min(blockEnd, rCons + 8);
    const consigneeLines: string[] = [];
    const shippingLines: string[] = [];

    for (let r = rCons + 1; r < consigneeEndRow; r++) {
      const row = rows[r] || [];
      // Gather Consignee text (between cCons and cShip)
      const consEndCol = cShip > cCons ? cShip : row.length;
      const cText = row
        .slice(cCons, consEndCol)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(' ');
      if (cText && !isOwnCompanyValue(cText)) {
        consigneeLines.push(cText.replace(/,\s*$/, ''));
      }

      if (cShip !== -1) {
        const sText = row
          .slice(cShip)
          .map((s) => s.trim())
          .filter(Boolean)
          .join(' ');
        if (sText && !isOwnCompanyValue(sText)) {
          shippingLines.push(sText.replace(/,\s*$/, ''));
        }
      }
    }

    const clientName = consigneeLines[0] || '';
    const clientAddress = consigneeLines.slice(1).join('\n');

    let shippingAddress = '';
    if (shippingLines.length > 0) {
      const shipLinesFiltered =
        shippingLines[0].toLowerCase() === clientName.toLowerCase()
          ? shippingLines.slice(1)
          : shippingLines;
      shippingAddress = shipLinesFiltered.join('\n');
    }

    // 3. Extract Line Items starting after rTable
    const lineItems: LineItem[] = [];
    let gstType: 'intraState' | 'interState' | undefined;
    let shippingAdjustment: number | undefined;

    if (rTable !== -1) {
      const headerRow = rows[rTable] || [];
      let cDesc = headerRow.findIndex((c) => /description/i.test(c));
      let cHsn = headerRow.findIndex((c) => /hsn|sac/i.test(c));
      let cQty = headerRow.findIndex((c) => /quantity|qty/i.test(c));
      let cRate = headerRow.findIndex((c) => /^rate\b|price/i.test(c.trim()));
      let cAmt = headerRow.findIndex((c) => /^amount\b|total/i.test(c.trim()));

      if (cDesc === -1) cDesc = 1;
      if (cHsn === -1) cHsn = 7;
      if (cQty === -1) cQty = 8;
      if (cRate === -1) cRate = 9;
      if (cAmt === -1) cAmt = 11;

      let inFooter = false;
      for (let r = rTable + 1; r < blockEnd; r++) {
        const row = rows[r] || [];
        const joinedRow = row.join(' ').trim();
        if (!joinedRow) continue;

        // Check if we reached another invoice block or bank details
        if (/^(original\s*copy|bank\s*details|declaration)/i.test(joinedRow)) {
          break;
        }

        // Check for tax / adjustment rows
        if (row.some((c) => /igst\s*tax\s*output|^igst\b/i.test(c.trim()))) {
          gstType = 'interState';
          inFooter = true;
          continue;
        }
        if (row.some((c) => /(cgst|sgst)\s*tax\s*output|^(cgst|sgst)\b/i.test(c.trim()))) {
          gstType = 'intraState';
          inFooter = true;
          continue;
        }
        const shortIdx = row.findIndex((c) => /short\s*&\s*(excess|access)/i.test(c.trim()));
        if (shortIdx !== -1) {
          inFooter = true;
          for (let sc = shortIdx + 1; sc < row.length; sc++) {
            if (row[sc]?.trim()) {
              shippingAdjustment = parseNumber(row[sc], 0);
              break;
            }
          }
          continue;
        }
        if (row.some((c) => /grand\s*total|amount\s*\(in\s*words\)|e\.\s*&\s*o\.e/i.test(c.trim()))) {
          inFooter = true;
          continue;
        }

        if (inFooter) continue;

        const desc = (row[cDesc] || '').trim();
        const hsnSac = (row[cHsn] || '').trim();
        const qtyRaw = (row[cQty] || '').trim();
        const rateRaw = (row[cRate] || '').trim();
        const amtRaw = (row[cAmt] || '').trim();

        // Ignore subtotal-only rows where description is empty
        if (!desc) continue;

        const quantity = qtyRaw ? parseNumber(qtyRaw, 1) : 1;
        const unitPrice = rateRaw
          ? parseNumber(rateRaw, 0)
          : amtRaw && quantity
          ? parseNumber(amtRaw, 0) / quantity
          : 0;

        lineItems.push({
          id: generateId(),
          description: desc,
          hsnSac: hsnSac || undefined,
          quantity,
          unitPrice,
          taxRate: 18,
          total: quantity * unitPrice,
        });
      }
    }

    const labelParts: string[] = [];
    if (sheetName && sheetName !== 'Sheet1') labelParts.push(`[${sheetName}]`);
    if (invoiceNumber) labelParts.push(`#${invoiceNumber}`);
    if (clientName) labelParts.push(clientName);
    if (lineItems.length > 0) {
      labelParts.push(`(${lineItems.length} item${lineItems.length !== 1 ? 's' : ''})`);
    }

    results.push({
      id: `formatted-${sheetName}-${idx}`,
      label: labelParts.join(' — ') || `Invoice ${idx + 1}`,
      invoiceNumber: invoiceNumber || undefined,
      documentTitle,
      invoiceDate,
      client: {
        name: clientName,
        company: '', // Leave company empty so clientName isn't printed twice
        address: clientAddress,
        shippingAddress: shippingAddress || undefined,
      },
      lineItems,
      taxRate: 18,
      gstType,
      shipping: shippingAdjustment,
    });
  }

  return results;
}

/**
 * Analyze rows of a sheet to find the best header row, column mapping, key-value metadata, and invoice options
 */
export function analyzeSheetData(
  sheets: ParsedSheet[],
  sheetIndex = 0,
  customMapping?: ColumnMapping
): ExcelParseResult {
  const sheet = sheets[sheetIndex] || sheets[0];
  const rows = sheet?.rows || [];

  // 0. First check if the sheet(s) use the formatted D Bharty's Enterprises Tax Invoice layout
  if (!customMapping) {
    const formattedInvoices: ExtractedInvoiceOption[] = [];
    for (const s of sheets) {
      const blocks = parseFormattedTaxInvoiceBlocks(s.rows, s.name);
      formattedInvoices.push(...blocks);
    }
    if (formattedInvoices.length > 0) {
      return {
        sheets,
        activeSheetIndex: sheetIndex,
        headerRowIndex: 0,
        headers: [],
        dataRows: rows,
        mapping: {},
        keyValueMetadata: {},
        invoices: formattedInvoices,
        isFormattedInvoiceLayout: true,
      };
    }
  }

  // 1. Find the row that matches the most column headers
  let bestHeaderRowIdx = 0;
  let bestScore = -1;

  const searchLimit = Math.min(rows.length, 20);
  for (let r = 0; r < searchLimit; r++) {
    const row = rows[r];
    let rowScore = 0;
    const matchedFields = new Set<MappedField>();
    for (const cell of row) {
      const m = matchHeaderToField(cell);
      if (m && !matchedFields.has(m.field)) {
        matchedFields.add(m.field);
        rowScore += m.score;
      }
    }
    if (rowScore > bestScore) {
      bestScore = rowScore;
      bestHeaderRowIdx = r;
    }
  }

  // 2. Extract Key-Value metadata from rows above the table header (or in 2-column key-value sheets)
  const keyValueMetadata: Partial<Record<MappedField, string>> = {};
  const kvRowsLimit = bestHeaderRowIdx > 0 ? bestHeaderRowIdx : rows.length;
  for (let r = 0; r < kvRowsLimit; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length - 1; c++) {
      const keyCell = row[c];
      const valCell = row[c + 1];
      if (!keyCell || !valCell) continue;
      // Only treat as KV if we are above header row or if row has <= 4 non-empty cells
      if (r < bestHeaderRowIdx || row.filter(Boolean).length <= 4) {
        const m = matchHeaderToField(keyCell.replace(/:$/, ''));
        if (m && !keyValueMetadata[m.field] && !isOwnCompanyValue(valCell)) {
          keyValueMetadata[m.field] = valCell;
        }
      }
    }
  }

  // 3. Build headers & auto-detect column mapping
  const maxCols = rows.reduce((max, r) => Math.max(max, r.length), 0);
  const rawHeaders = rows[bestHeaderRowIdx] || [];
  const headers: string[] = [];
  for (let c = 0; c < maxCols; c++) {
    headers.push(rawHeaders[c] || `Column ${String.fromCharCode(65 + (c % 26))}`);
  }

  const autoMapping: ColumnMapping = {};
  if (!customMapping) {
    // Score each (column, field) pair and assign greedily
    const candidates: { col: number; field: MappedField; score: number }[] = [];
    headers.forEach((h, colIdx) => {
      const m = matchHeaderToField(h);
      if (m) {
        candidates.push({ col: colIdx, field: m.field, score: m.score });
      }
    });
    candidates.sort((a, b) => b.score - a.score);
    const usedCols = new Set<number>();
    for (const cand of candidates) {
      if (autoMapping[cand.field] === undefined && !usedCols.has(cand.col)) {
        autoMapping[cand.field] = cand.col;
        usedCols.add(cand.col);
      }
    }
  }

  const mapping: ColumnMapping = customMapping ? { ...customMapping } : autoMapping;
  const dataRows = rows.slice(bestHeaderRowIdx + 1).filter((r) => r.some((cell) => cell.trim() !== ''));

  const invoices = buildInvoicesFromMapping(dataRows, mapping, keyValueMetadata);

  return {
    sheets,
    activeSheetIndex: sheetIndex,
    headerRowIndex: bestHeaderRowIdx,
    headers,
    dataRows,
    mapping,
    keyValueMetadata,
    invoices,
  };
}

export function buildInvoicesFromMapping(
  dataRows: string[][],
  mapping: ColumnMapping,
  keyValueMetadata: Partial<Record<MappedField, string>>
): ExtractedInvoiceOption[] {
  const getCell = (row: string[], field: MappedField): string => {
    const col = mapping[field];
    if (col !== undefined && col >= 0 && row[col] !== undefined) {
      return row[col].trim();
    }
    return '';
  };

  // Group rows into invoices:
  // If multiple distinct invoice numbers (or client names when invoice number isn't repeated) exist,
  // group consecutive or matching rows by invoice key; otherwise treat all rows as a single invoice.
  const groups = new Map<string, string[][]>();
  let lastInvoiceKey = 'default';

  for (const row of dataRows) {
    const invNo = getCell(row, 'invoiceNumber');
    const clientName = getCell(row, 'clientName');
    const desc = getCell(row, 'description');

    // Skip summary/total rows at the bottom of a sheet
    if (
      !invNo &&
      !clientName &&
      /^(sub\s*total|total|grand\s*total|cgst|sgst|igst|amount in words)$/i.test(desc)
    ) {
      continue;
    }

    let key = lastInvoiceKey;
    if (invNo) {
      key = `inv:${invNo}`;
      lastInvoiceKey = key;
    } else if (clientName && groups.size === 0 && lastInvoiceKey === 'default') {
      key = `client:${clientName}`;
      lastInvoiceKey = key;
    } else if (clientName && mapping.invoiceNumber === undefined) {
      key = `client:${clientName}`;
      lastInvoiceKey = key;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  }

  const options: ExtractedInvoiceOption[] = [];

  const createOptionFromRows = (groupRows: string[][], id: string, customLabel?: string): ExtractedInvoiceOption => {
    const firstRow = groupRows[0] || [];
    const pickFirstNonEmpty = (field: MappedField): string => {
      const isClientField = field.startsWith('client') || field === 'shippingAddress';
      for (const r of groupRows) {
        const val = getCell(r, field);
        if (val && !(isClientField && isOwnCompanyValue(val))) return val;
      }
      const kvVal = keyValueMetadata[field] || '';
      return isClientField && isOwnCompanyValue(kvVal) ? '' : kvVal;
    };

    const invoiceNumber = pickFirstNonEmpty('invoiceNumber');
    const documentTitle = pickFirstNonEmpty('documentTitle');
    const rawInvoiceDate = pickFirstNonEmpty('invoiceDate');
    const rawDueDate = pickFirstNonEmpty('dueDate');

    const clientName = pickFirstNonEmpty('clientName');
    const clientCompany = pickFirstNonEmpty('clientCompany') || clientName;
    let clientAddress = pickFirstNonEmpty('clientAddress');
    const clientGstin = pickFirstNonEmpty('clientGstin');
    if (clientGstin && !clientAddress.toLowerCase().includes(clientGstin.toLowerCase())) {
      clientAddress = clientAddress
        ? `${clientAddress}\nGST: ${clientGstin}`
        : `GST: ${clientGstin}`;
    }
    const clientEmail = pickFirstNonEmpty('clientEmail');
    const clientPhone = pickFirstNonEmpty('clientPhone');
    const shippingAddress = pickFirstNonEmpty('shippingAddress');

    const lineItems: LineItem[] = [];
    let detectedTaxRate: number | undefined;

    for (const r of groupRows) {
      const description = getCell(r, 'description');
      const hsnSac = getCell(r, 'hsnSac');
      const qtyRaw = getCell(r, 'quantity');
      const priceRaw = getCell(r, 'unitPrice');
      const taxRaw = getCell(r, 'taxRate');

      if (!description && !priceRaw && !qtyRaw) continue;

      const quantity = qtyRaw ? parseNumber(qtyRaw, 1) : 1;
      const unitPrice = priceRaw ? parseNumber(priceRaw, 0) : 0;
      const taxRate = taxRaw ? parseNumber(taxRaw, 0) : 0;
      if (taxRaw && detectedTaxRate === undefined && taxRate > 0) {
        detectedTaxRate = taxRate;
      }

      lineItems.push({
        id: generateId(),
        description: description || 'Item',
        hsnSac: hsnSac || undefined,
        quantity,
        unitPrice,
        taxRate,
        total: quantity * unitPrice,
      });
    }

    const labelParts: string[] = [];
    if (invoiceNumber) labelParts.push(`#${invoiceNumber}`);
    if (clientName) labelParts.push(clientName);
    if (lineItems.length > 0) {
      labelParts.push(`(${lineItems.length} item${lineItems.length > 1 ? 's' : ''})`);
    }

    return {
      id,
      label: customLabel || labelParts.join(' — ') || `Row ${dataRows.indexOf(firstRow) + 1}`,
      invoiceNumber: invoiceNumber || undefined,
      documentTitle: documentTitle || undefined,
      invoiceDate: parseExcelDate(rawInvoiceDate),
      dueDate: parseExcelDate(rawDueDate),
      client: {
        name: clientName,
        company: clientCompany,
        address: clientAddress,
        email: clientEmail,
        phone: clientPhone,
        ...(shippingAddress ? { shippingAddress } : {}),
      },
      lineItems,
      taxRate: detectedTaxRate,
    };
  };

  let idx = 0;
  for (const [, groupRows] of groups.entries()) {
    options.push(createOptionFromRows(groupRows, `group-${idx++}`));
  }

  // If no data rows matched (e.g., pure key-value sheet), still create an option from keyValueMetadata
  if (options.length === 0 && Object.keys(keyValueMetadata).length > 0) {
    options.push(createOptionFromRows([], 'kv-only', 'Extracted Invoice Data'));
  }

  return options;
}

/**
 * Generate a valid .xlsx file (uncompressed ZIP with OpenXML worksheet) for sample template download
 */
export function downloadSampleXlsx(): void {
  const sampleRows = [
    [
      'Invoice Number',
      'Invoice Name',
      'Invoice Date',
      'Client Name',
      'Company',
      'Client Address',
      'Client GSTIN',
      'Client Email',
      'Client Phone',
      'Product Description',
      'HSN/SAC',
      'Quantity',
      'Unit Price',
      'Tax Rate (%)',
    ],
    [
      'DB/26-27/007',
      'TAX INVOICE',
      '2026-11-04',
      'HAPDCO Herbals Pvt Ltd',
      'HAPDCO Herbals Pvt Ltd',
      'Dasauli, Kursi Road, Near Integral University, Lucknow - 226026, Uttar Pradesh - 09',
      '09AACCH0480Q1Z6',
      'accounts@hapdco.com',
      '+91 98765 43210',
      'Respro Forte 120ml Labels 65 x 135mm',
      '48211020',
      '24800',
      '0.92',
      '18',
    ],
    [
      'DB/26-27/007',
      'TAX INVOICE',
      '2026-11-04',
      'HAPDCO Herbals Pvt Ltd',
      'HAPDCO Herbals Pvt Ltd',
      'Dasauli, Kursi Road, Near Integral University, Lucknow - 226026, Uttar Pradesh - 09',
      '09AACCH0480Q1Z6',
      'accounts@hapdco.com',
      '+91 98765 43210',
      'Plate Charges Respro Forte',
      '84425090',
      '5',
      '1000',
      '18',
    ],
  ];

  const escapeXml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const colLetter = (idx: number): string => {
    let s = '';
    let n = idx + 1;
    while (n > 0) {
      const rem = (n - 1) % 26;
      s = String.fromCharCode(65 + rem) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  };

  const sheetRowsXml = sampleRows
    .map((row, rIdx) => {
      const cellsXml = row
        .map((val, cIdx) => {
          const ref = `${colLetter(cIdx)}${rIdx + 1}`;
          if (rIdx > 0 && (cIdx === 11 || cIdx === 12 || cIdx === 13)) {
            return `<c r="${ref}"><v>${escapeXml(val)}</v></c>`;
          }
          return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
        })
        .join('');
      return `<row r="${rIdx + 1}">${cellsXml}</row>`;
    })
    .join('');

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Invoice Data" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetRowsXml}</sheetData>
</worksheet>`;

  const zipBlob = buildStoredZip([
    { name: '[Content_Types].xml', content: contentTypesXml },
    { name: '_rels/.rels', content: relsXml },
    { name: 'xl/_rels/workbook.xml.rels', content: wbRelsXml },
    { name: 'xl/workbook.xml', content: workbookXml },
    { name: 'xl/worksheets/sheet1.xml', content: sheetXml },
  ]);

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'invoice-template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c ^= bytes[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildStoredZip(entries: { name: string; content: string }[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes = encoder.encode(entry.content);
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true); // stored
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    const cdHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cdHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    cdHeader.set(nameBytes, 46);

    centralParts.push(cdHeader);
    offset += localHeader.length + dataBytes.length;
  }

  const cdSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, eocd] as unknown as BlobPart[], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
