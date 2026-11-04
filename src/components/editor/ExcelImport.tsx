'use client';

import { useState, useRef, useCallback } from 'react';
import { useInvoiceStore } from '@/store/invoiceStore';
import {
  readSpreadsheetFile,
  analyzeSheetData,
  buildInvoicesFromMapping,
  downloadSampleXlsx,
  ExcelParseResult,
  ExtractedInvoiceOption,
  FIELD_LABELS,
  MappedField,
  ColumnMapping,
} from '@/lib/xlsxParser';

export default function ExcelImport() {
  const {
    setInvoiceNumber,
    setDocumentTitle,
    setInvoiceDate,
    setDueDate,
    updateClient,
    setLineItems,
    setTax,
    setShipping,
  } = useInvoiceStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [selectedInvoiceIdx, setSelectedInvoiceIdx] = useState<number>(0);
  const [combineAllRows, setCombineAllRows] = useState<boolean>(false);
  const [showMapper, setShowMapper] = useState<boolean>(false);

  const applyInvoiceOption = useCallback(
    (option: ExtractedInvoiceOption | undefined) => {
      if (!option) return;

      if (option.invoiceNumber) {
        setInvoiceNumber(option.invoiceNumber);
      }
      if (option.documentTitle) {
        setDocumentTitle(option.documentTitle);
      }
      if (option.invoiceDate) {
        setInvoiceDate(option.invoiceDate);
      }
      if (option.dueDate) {
        setDueDate(option.dueDate);
      }

      const clientUpdates: Record<string, string> = {};
      if (option.client.name !== undefined) clientUpdates.name = option.client.name;
      if (option.client.company !== undefined) clientUpdates.company = option.client.company;
      if (option.client.address !== undefined) clientUpdates.address = option.client.address;
      if (option.client.email !== undefined) clientUpdates.email = option.client.email;
      if (option.client.phone !== undefined) clientUpdates.phone = option.client.phone;
      if (option.client.shippingAddress !== undefined) {
        clientUpdates.shippingAddress = option.client.shippingAddress;
      }

      if (Object.keys(clientUpdates).length > 0) {
        updateClient(clientUpdates);
      }

      if (option.lineItems.length > 0) {
        setLineItems(option.lineItems);
      }

      if (option.taxRate !== undefined && option.taxRate > 0) {
        setTax({
          rate: option.taxRate,
          ...(option.gstType ? { isGST: true, gstType: option.gstType } : {}),
        });
      }

      if (option.shipping !== undefined) {
        setShipping(option.shipping);
      }
    },
    [
      setInvoiceNumber,
      setDocumentTitle,
      setInvoiceDate,
      setDueDate,
      updateClient,
      setLineItems,
      setTax,
      setShipping,
    ]
  );

  const buildCombinedOption = useCallback(
    (invoices: ExtractedInvoiceOption[]): ExtractedInvoiceOption | undefined => {
      if (invoices.length === 0) return undefined;
      const first = invoices[0];
      return {
        ...first,
        id: 'combined-all',
        label: `All Rows Combined (${invoices.reduce((sum, i) => sum + i.lineItems.length, 0)} items)`,
        lineItems: invoices.flatMap((inv) => inv.lineItems),
      };
    },
    []
  );

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const lower = file.name.toLowerCase();
      if (!lower.endsWith('.xlsx') && !lower.endsWith('.csv')) {
        setError('Please upload a valid .xlsx or .csv file.');
        return;
      }

      try {
        const sheets = await readSpreadsheetFile(file);
        const result = analyzeSheetData(sheets, 0);
        setFileName(file.name);
        setParseResult(result);
        setSelectedInvoiceIdx(0);
        setCombineAllRows(false);

        if (result.invoices.length > 0) {
          applyInvoiceOption(result.invoices[0]);
        } else {
          setShowMapper(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse Excel file.');
      }
    },
    [applyInvoiceOption]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSheetChange = (sheetIdx: number) => {
    if (!parseResult) return;
    const updated = analyzeSheetData(parseResult.sheets, sheetIdx);
    setParseResult(updated);
    setSelectedInvoiceIdx(0);
    if (updated.invoices.length > 0) {
      applyInvoiceOption(
        combineAllRows ? buildCombinedOption(updated.invoices) : updated.invoices[0]
      );
    }
  };

  const handleMappingChange = (field: MappedField, colIdxStr: string) => {
    if (!parseResult) return;
    const newMapping: ColumnMapping = { ...parseResult.mapping };
    if (colIdxStr === '') {
      delete newMapping[field];
    } else {
      newMapping[field] = parseInt(colIdxStr, 10);
    }

    const updatedInvoices = buildInvoicesFromMapping(
      parseResult.dataRows,
      newMapping,
      parseResult.keyValueMetadata
    );

    const updatedResult: ExcelParseResult = {
      ...parseResult,
      mapping: newMapping,
      invoices: updatedInvoices,
    };

    setParseResult(updatedResult);
    const targetOption = combineAllRows
      ? buildCombinedOption(updatedInvoices)
      : updatedInvoices[Math.min(selectedInvoiceIdx, Math.max(0, updatedInvoices.length - 1))];
    applyInvoiceOption(targetOption);
  };

  const handleSelectInvoice = (idx: number) => {
    setSelectedInvoiceIdx(idx);
    if (parseResult && parseResult.invoices[idx]) {
      applyInvoiceOption(parseResult.invoices[idx]);
    }
  };

  const handleToggleCombine = (checked: boolean) => {
    setCombineAllRows(checked);
    if (!parseResult) return;
    if (checked) {
      applyInvoiceOption(buildCombinedOption(parseResult.invoices));
    } else {
      applyInvoiceOption(parseResult.invoices[selectedInvoiceIdx] || parseResult.invoices[0]);
    }
  };

  const clearUpload = () => {
    setFileName('');
    setParseResult(null);
    setError(null);
    setShowMapper(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeInvoice = parseResult
    ? combineAllRows
      ? buildCombinedOption(parseResult.invoices)
      : parseResult.invoices[selectedInvoiceIdx] || parseResult.invoices[0]
    : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Import from Excel (.xlsx)
          </h3>
        </div>

        <button
          type="button"
          onClick={downloadSampleXlsx}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          title="Download sample .xlsx template"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Sample .xlsx
        </button>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10'
            : fileName
            ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60'
            : 'border-slate-700/80 bg-slate-800/30 hover:border-blue-500/50 hover:bg-slate-800/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {!fileName ? (
          <div className="space-y-1.5">
            <div className="mx-auto w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-300">
              Click to upload or drag &amp; drop your <span className="text-emerald-400">.xlsx</span> or{' '}
              <span className="text-emerald-400">.csv</span> file
            </p>
            <p className="text-[11px] text-slate-500">
              Auto-fills Invoice Number &amp; Name, Client Details, and Product Descriptions
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{fileName}</p>
                {activeInvoice && (
                  <p className="text-[11px] text-emerald-400 truncate">
                    Loaded: {activeInvoice.invoiceNumber ? `#${activeInvoice.invoiceNumber} • ` : ''}
                    {activeInvoice.client.name || 'Client'} ({activeInvoice.lineItems.length} item
                    {activeInvoice.lineItems.length !== 1 ? 's' : ''})
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={clearUpload}
                className="p-1 text-slate-400 hover:text-red-400 rounded-md transition-colors"
                title="Clear uploaded file"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Controls after file is parsed */}
      {parseResult && (
        <div className="space-y-3 pt-1">
          {/* Sheet selector if workbook has multiple sheets */}
          {parseResult.sheets.length > 1 && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Worksheet
              </label>
              <select
                value={parseResult.activeSheetIndex}
                onChange={(e) => handleSheetChange(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {parseResult.sheets.map((s, idx) => (
                  <option key={s.name + idx} value={idx}>
                    {s.name} ({s.rows.length} rows)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Invoice / Row selector when multiple distinct invoices/rows are detected */}
          {parseResult.invoices.length > 1 && (
            <div className="space-y-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/60">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-slate-300">
                  Select Invoice / Row ({parseResult.invoices.length} found)
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={combineAllRows}
                    onChange={(e) => handleToggleCombine(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-0"
                  />
                  Combine all rows
                </label>
              </div>

              {!combineAllRows && (
                <select
                  value={selectedInvoiceIdx}
                  onChange={(e) => handleSelectInvoice(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {parseResult.invoices.map((inv, idx) => (
                    <option key={inv.id} value={idx}>
                      {inv.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Toggle Column Mapping */}
          {!parseResult.isFormattedInvoiceLayout ? (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {Object.keys(parseResult.mapping).length} columns auto-mapped
              </span>
              <button
                type="button"
                onClick={() => setShowMapper(!showMapper)}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showMapper ? 'Hide Column Mapping' : 'Customize Column Mapping'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-400/90 font-medium">
                ✓ Tax Invoice layout auto-detected ({parseResult.invoices.length} invoice
                {parseResult.invoices.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {showMapper && (
            <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg space-y-2.5 max-h-64 overflow-y-auto">
              <p className="text-[11px] text-slate-400">
                Match your Excel columns to Invoice fields:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {FIELD_LABELS.map((field) => {
                  const mappedCol = parseResult.mapping[field.key];
                  return (
                    <div key={field.key} className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-5 text-[11px] text-slate-300 truncate" title={field.label}>
                        {field.label}
                      </label>
                      <select
                        value={mappedCol !== undefined ? String(mappedCol) : ''}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className="col-span-7 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Not Mapped --</option>
                        {parseResult.headers.map((h, cIdx) => (
                          <option key={cIdx} value={String(cIdx)}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
