'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Table,
  Info,
  Trash2,
} from 'lucide-react';
import { UploadedDataset, UploadedDataRow } from '@/lib/types';

export const DataUploadTab: React.FC = () => {
  const [pastedText, setPastedText] = useState('');
  const [dataset, setDataset] = useState<UploadedDataset | null>(null);
  const [parsingError, setParsingError] = useState('');

  // Normalize column name helpers
  const normalizeCol = (header: string): string => {
    const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (h.includes('pm2') || h.includes('pm25')) return 'pm2_5';
    if (h.includes('pm10')) return 'pm10';
    if (h.includes('no2') || h.includes('nitrogen')) return 'no2';
    if (h.includes('so2') || h.includes('sulphur')) return 'so2';
    if (h.includes('co') || h.includes('carbon')) return 'co';
    if (h.includes('o3') || h.includes('ozone')) return 'o3';
    if (h.includes('aqi') || h.includes('index')) return 'aqi';
    if (h.includes('time') || h.includes('date')) return 'timestamp';
    if (h.includes('loc') || h.includes('city') || h.includes('station')) return 'location';
    return header;
  };

  const parseTabularData = (rawText: string, filename = 'pasted_data.csv') => {
    setParsingError('');
    const lines = rawText.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setParsingError('Dataset must contain a header row and at least one data row.');
      return;
    }

    // Determine delimiter (comma, tab, semicolon)
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const headers = firstLine.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const normalizedHeaders = headers.map(normalizeCol);

    const rows: UploadedDataRow[] = [];
    const warnings: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const rowObj: Record<string, any> = {};
      const parsedRow: UploadedDataRow = { raw: {} };

      headers.forEach((h, idx) => {
        const val = parts[idx] ?? '';
        rowObj[h] = val;
        const norm = normalizedHeaders[idx];

        if (norm === 'location') parsedRow.location = val;
        else if (norm === 'timestamp') parsedRow.timestamp = val;
        else if (['pm2_5', 'pm10', 'no2', 'so2', 'co', 'o3', 'aqi'].includes(norm)) {
          const num = parseFloat(val);
          if (!isNaN(num)) {
            (parsedRow as any)[norm] = num;
          } else if (val) {
            warnings.push(`Row ${i}: Could not parse numeric value for "${h}": "${val}"`);
          }
        }
      });

      parsedRow.raw = rowObj;
      rows.push(parsedRow);
    }

    if (rows.length === 0) {
      setParsingError('Could not parse valid records.');
      return;
    }

    const uniqueWarnings = Array.from(new Set(warnings)).slice(0, 5);

    setDataset({
      filename,
      uploadedAt: new Date().toISOString(),
      rowCount: rows.length,
      columnsDetected: headers,
      rows,
      warnings: uniqueWarnings,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseTabularData(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const loadSampleCSV = () => {
    const sample = `City,Station_Name,PM2.5 (ug/m3),PM10 (ug/m3),NO2 (ug/m3),AQI,Timestamp
Bhopal,TT Nagar CAAQMS,58.4,112.0,34.2,142,2026-11-14 09:00
Indore,Chhoti Gwaltoli,64.1,130.5,41.0,158,2026-11-14 09:00
Delhi,Anand Vihar,182.5,310.2,78.6,340,2026-11-14 09:00
Mumbai,Bandra Kurla,44.2,88.1,28.4,110,2026-11-14 09:00`;
    setPastedText(sample);
    parseTabularData(sample, 'sample_civic_air_data.csv');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            External Data Ingestion & Tabular Audit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Secondary workflow for analyzing municipal CSV dumps and external monitoring files
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          Secondary Workflow (Independent from Live API)
        </span>
      </div>

      {/* Non-mixing disclosure */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold">DATA INTEGRITY & ISOLATION RULE</div>
          <p className="text-amber-900 leading-relaxed">
            Uploaded CSV readings are analyzed strictly in isolation and tagged with an explicit <strong>"Uploaded Data (Non-API)"</strong> classification. AirSathi never silently mixes external uploaded files with live Open-Meteo public API streams.
          </p>
        </div>
      </div>

      {/* Upload & Paste Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Upload CSV or TSV File
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select any local air pollution dataset. Handles messy column titles and missing values automatically.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Click to choose a CSV file</span>
              <span className="text-[11px] text-slate-400 mt-1">.csv, .tsv or .txt</span>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={loadSampleCSV}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              Load Sample Municipal Dataset
            </button>
          </div>
        </div>

        {/* Paste Area Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600" />
              Paste Raw CSV or Tabular Data
            </h3>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste comma or tab-delimited values here with header row..."
              rows={6}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={() => parseTabularData(pastedText, 'pasted_dataset.csv')}
              disabled={!pastedText.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              Parse & Ingest Data
            </button>
            {pastedText && (
              <button
                onClick={() => {
                  setPastedText('');
                  setDataset(null);
                }}
                className="text-xs text-slate-400 hover:text-rose-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {parsingError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{parsingError}</span>
        </div>
      )}

      {/* Dataset Preview */}
      {dataset && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{dataset.filename}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {dataset.rowCount} Rows Ingested
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Columns detected: {dataset.columnsDetected.join(', ')}
              </p>
            </div>

            <button
              onClick={() => setDataset(null)}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {dataset.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
              <span className="font-bold block">Data-Quality Warnings:</span>
              {dataset.warnings.map((w, i) => (
                <div key={i} className="text-[11px] leading-tight">• {w}</div>
              ))}
            </div>
          )}

          {/* Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5">AQI</th>
                  <th className="p-2.5">PM2.5 (µg/m³)</th>
                  <th className="p-2.5">PM10 (µg/m³)</th>
                  <th className="p-2.5">NO2 (µg/m³)</th>
                  <th className="p-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {dataset.rows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="p-2.5 text-slate-400">{i + 1}</td>
                    <td className="p-2.5 font-sans font-medium text-slate-900">
                      {r.location || r.raw[dataset.columnsDetected[0]] || 'N/A'}
                    </td>
                    <td className="p-2.5 font-bold text-emerald-800">{r.aqi ?? 'N/A'}</td>
                    <td className="p-2.5">{r.pm2_5 ?? 'N/A'}</td>
                    <td className="p-2.5">{r.pm10 ?? 'N/A'}</td>
                    <td className="p-2.5">{r.no2 ?? 'N/A'}</td>
                    <td className="p-2.5 text-slate-500 font-sans">{r.timestamp ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
