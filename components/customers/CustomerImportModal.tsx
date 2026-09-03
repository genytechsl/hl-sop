"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";

interface CustomerImportModalProps {
  open: boolean;
  onClose: () => void;
}

interface ImportResult {
  row: number;
  success: boolean;
  customerId?: string;
  customerName?: string;
  properties?: number;
  error?: string;
}

export default function CustomerImportModal({
  open,
  onClose,
}: CustomerImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [error, setError] = useState("");

  if (!open) return null;

  const successful = results.filter((result) => result.success).length;
  const failed = results.filter((result) => !result.success).length;

  const importCompleted = results.length > 0;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      setError("Please select an Excel file (.xlsx or .xls).");
      setFile(null);
      return;
    }

    setError("");
    setResults([]);
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select an Excel file first.");
      return;
    }

    try {
      setIsImporting(true);
      setError("");
      setResults([]);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/customers/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to import customers.");
      }

      setResults(data.results || []);
    } catch (error: any) {
      console.error("Customer import error:", error);

      setError(error.message || "Failed to import customers.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setResults([]);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isImporting) return;

    resetImport();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Import Customers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload an Excel spreadsheet to add multiple customer records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-6">
            {/* Compact template / format row */}
            {!importCompleted && (
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet
                      size={19}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Spreadsheet format
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Required: Customer Name, NIC, Email, Mobile, Property 1
                        Name and Property 1 Address. Add further properties as
                        Property 2 Name / Address, Property 3 Name / Address,
                        and so on.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/templates/customer-import-template.xlsx";
                  }}
                  className="inline-flex h-full min-h-12 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>
            )}

            {/* Small format note */}
            {!importCompleted && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-2.5">
                <p className="text-xs leading-5 text-slate-500">
                  If additional contact columns are used, separate multiple
                  values with semicolons, for example{" "}
                  <span className="font-medium text-slate-700">
                    office@example.com; personal@example.com
                  </span>
                  .
                </p>
              </div>
            )}

            {/* File upload */}
            {!importCompleted && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!file ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="flex min-h-[145px] w-full items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center transition hover:border-blue-400 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Upload size={21} />
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-700">
                        Select an Excel file
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Supported formats: .xlsx and .xls
                      </p>
                    </div>
                  </button>
                ) : (
                  /* Selected file highlight */
                  <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <FileSpreadsheet size={21} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {file.name}
                          </p>

                          <p className="mt-1 text-xs text-emerald-700">
                            File selected · {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="shrink-0 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Change File
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error */}
            {error && (
              <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                <AlertCircle size={20} className="shrink-0 text-red-500" />

                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Results */}
            {importCompleted && (
              <div className="space-y-4">
                {/* Result overview stays visible */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={20}
                          className={
                            failed === 0 ? "text-emerald-500" : "text-amber-500"
                          }
                        />

                        <h3 className="font-semibold text-slate-800">
                          Import complete
                        </h3>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {file?.name}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <div className="rounded-xl bg-emerald-50 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-emerald-700">
                          {successful}
                        </p>
                        <p className="text-[11px] font-medium text-emerald-600">
                          Imported
                        </p>
                      </div>

                      <div className="rounded-xl bg-red-50 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-red-700">
                          {failed}
                        </p>
                        <p className="text-[11px] font-medium text-red-600">
                          Failed
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 px-4 py-2 text-center">
                        <p className="text-lg font-bold text-slate-700">
                          {results.length}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          Total
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable imported people */}
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Imported Records
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Review individual import results below.
                      </p>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      {results.length} records
                    </span>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto">
                    {results.map((result) => (
                      <div
                        key={result.row}
                        className="border-b border-slate-100 px-5 py-3 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          {result.success ? (
                            <CheckCircle2
                              size={17}
                              className="mt-0.5 shrink-0 text-emerald-500"
                            />
                          ) : (
                            <AlertCircle
                              size={17}
                              className="mt-0.5 shrink-0 text-red-500"
                            />
                          )}

                          <div className="min-w-0 flex-1 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium text-slate-700">
                                Row {result.row}
                                {result.customerName &&
                                  ` — ${result.customerName}`}
                              </p>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  result.success
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {result.success ? "Imported" : "Failed"}
                              </span>
                            </div>

                            {result.success ? (
                              <p className="mt-1 text-xs text-slate-500">
                                {result.customerId} · {result.properties}{" "}
                                {result.properties === 1
                                  ? "property"
                                  : "properties"}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-red-500">
                                {result.error}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            {importCompleted && (
              <p className="hidden text-xs text-slate-500 sm:block">
                Importing another file will start a new import session.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isImporting}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importCompleted ? "Done" : "Cancel"}
            </button>

            {importCompleted ? (
              <button
                type="button"
                onClick={resetImport}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <RotateCcw size={17} />
                Import Another File
              </button>
            ) : (
              <button
                type="button"
                onClick={handleImport}
                disabled={!file || isImporting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={17} />
                    Import Customers
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
