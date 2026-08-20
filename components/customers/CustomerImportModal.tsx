"use client";

import { useRef, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Upload,
  X,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
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

  if (!open) {
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

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

  const handleClose = () => {
    if (isImporting) {
      return;
    }

    setFile(null);
    setResults([]);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onClose();
  };

  const successful = results.filter((result) => result.success).length;

  const failed = results.filter((result) => !result.success).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Import Customers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add multiple customers using an Excel spreadsheet.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Template */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-4">
              <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                <FileSpreadsheet size={22} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">
                  Don't have the Excel format?
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Download the customer import template and fill in your
                  customer information.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/templates/customer-import-template.xlsx";
                  }}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Excel File
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                border-2
                border-dashed
                border-slate-300
                px-6
                py-10
                text-center
                transition
                hover:border-blue-400
                hover:bg-blue-50/40
              "
            >
              <Upload size={24} className="text-slate-400" />

              <div>
                {file ? (
                  <>
                    <p className="font-medium text-slate-700">{file.name}</p>

                    <p className="mt-1 text-xs text-slate-400">
                      Click to select another file
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-700">
                      Click to select an Excel file
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      .xlsx and .xls files only
                    </p>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
              <AlertCircle size={20} className="shrink-0 text-red-500" />

              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="rounded-2xl border border-slate-200">
              <div className="flex items-center gap-6 border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 size={17} />
                  <span>
                    Imported: <strong>{successful}</strong>
                  </span>
                </div>

                {failed > 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle size={17} />
                    <span>
                      Failed: <strong>{failed}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="max-h-52 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.row}
                    className="border-b border-slate-100 px-5 py-3 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 text-emerald-500"
                        />
                      ) : (
                        <AlertCircle
                          size={17}
                          className="mt-0.5 text-red-500"
                        />
                      )}

                      <div className="text-sm">
                        <p className="font-medium text-slate-700">
                          Row {result.row}
                          {result.customerName && ` — ${result.customerName}`}
                        </p>

                        {result.success ? (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {result.customerId} · {result.properties}{" "}
                            {result.properties === 1
                              ? "property"
                              : "properties"}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-red-500">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={!file || isImporting}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
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
        </div>
      </div>
    </div>
  );
}
