
import React, { useState } from 'react';
import { ScanQuery, Business } from '../types';
import { scanBusinesses } from '../services/geminiService';

interface ScannerUIProps {
  onResults: (results: Business[]) => void;
  onLoading: (isLoading: boolean) => void;
}

export const ScannerUI: React.FC<ScannerUIProps> = ({ onResults, onLoading }) => {
  const [query, setQuery] = useState<ScanQuery>({ category: '', location: '' });
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.category || !query.location) return;

    setError(null);
    onLoading(true);
    try {
      const results = await scanBusinesses(query);
      if (results.length === 0) {
        setError('Zero nodes detected. Try broadening your category or territory.');
      } else {
        onResults(results);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown system failure.';
      setError(`Critical Failure: ${errorMsg}`);
      console.error(err);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <form onSubmit={handleScan} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg relative overflow-hidden scanner-glow">
        <div className="absolute top-0 left-0 w-1 bg-green-500 h-full opacity-50"></div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-500 uppercase tracking-widest">
          <i className="fas fa-radar text-sm"></i> Extraction Parameters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Business Sector</label>
            <input 
              type="text"
              placeholder="e.g. Solar Manufacturers"
              className="w-full bg-black border border-zinc-800 p-3 rounded text-sm focus:border-green-500 outline-none transition-all placeholder:text-zinc-700"
              value={query.category}
              onChange={e => setQuery({ ...query, category: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Target Territory</label>
            <input 
              type="text"
              placeholder="e.g. San Francisco, CA"
              className="w-full bg-black border border-zinc-800 p-3 rounded text-sm focus:border-green-500 outline-none transition-all placeholder:text-zinc-700"
              value={query.location}
              onChange={e => setQuery({ ...query, location: e.target.value })}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="mt-8 w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-6 rounded uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
        >
          <i className="fas fa-crosshairs"></i> Initiate Scan
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-950/30 border border-red-900 text-red-400 text-xs rounded-sm font-mono flex items-start gap-3">
            <i className="fas fa-terminal mt-0.5"></i>
            <div>
              <span className="font-bold">[ERROR_LOG]:</span> {error}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
