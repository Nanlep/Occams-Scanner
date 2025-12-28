
import React, { useState } from 'react';
import { ScannerUI } from './components/ScannerUI';
import { ResultsTable } from './components/ResultsTable';
import { Business } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntel, setShowIntel] = useState(false);

  return (
    <div className="min-h-screen pb-32 selection:bg-green-500 selection:text-black relative overflow-x-hidden">
      {/* Visual Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Header */}
      <header className="border-b border-zinc-800 p-6 flex items-center justify-between bg-black/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-green-500 rounded-sm flex items-center justify-center text-green-500 scanner-glow">
             <i className="fas fa-microchip"></i>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tighter text-white uppercase italic">Occam's <span className="text-green-500">Scanner</span></h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-medium">Precision Business Extraction Engine</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowIntel(!showIntel)}
          className="text-zinc-500 hover:text-green-500 transition-colors text-xs flex items-center gap-2 uppercase tracking-widest font-bold"
        >
          <i className={`fas ${showIntel ? 'fa-times' : 'fa-info-circle'}`}></i> {showIntel ? 'Close' : 'System Intel'}
        </button>
      </header>

      {/* Intel Panel */}
      {showIntel && (
        <div className="max-w-4xl mx-auto mt-6 px-6 animate-fadeIn">
          <div className="bg-green-500/5 border border-green-500/20 p-6 rounded text-xs text-zinc-400 space-y-4">
            <h4 className="text-green-500 font-bold uppercase tracking-widest mb-2">Search Protocol Tips:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ul className="list-disc list-inside space-y-2">
                <li><span className="text-zinc-300 font-bold">Specific Categories:</span> Use "Specialty Coffee Roasters" instead of just "Coffee".</li>
                <li><span className="text-zinc-300 font-bold">Targeted Locations:</span> "Manhattan, NY" yields better results than just "New York".</li>
              </ul>
              <ul className="list-disc list-inside space-y-2">
                <li><span className="text-zinc-300 font-bold">Grounding:</span> Data is live-synced from the Google Maps database layer via Gemini.</li>
                <li><span className="text-zinc-300 font-bold">Privacy:</span> Extracted data is for professional indexing and B2B research.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <main className="mt-12 space-y-12">
        {!results.length && !isLoading && (
          <div className="text-center px-6">
            <div className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] text-zinc-400 uppercase tracking-widest mb-4">
              Status: System Operational <span className="w-2 h-2 bg-green-500 rounded-full inline-block ml-2 animate-pulse"></span>
            </div>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed font-light">
              Enter search parameters to initiate the scan. The engine will query the spatial grid 
              to extract verified business entities, contact details, and precise GPS coordinates.
            </p>
          </div>
        )}

        <ScannerUI 
          onResults={setResults} 
          onLoading={setIsLoading} 
        />

        <ResultsTable 
          businesses={results} 
          isLoading={isLoading} 
        />
      </main>

      {/* Footer / Legal Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/90 p-3 backdrop-blur-md z-40 text-[9px] uppercase tracking-widest text-zinc-600 flex flex-col md:flex-row justify-between items-center px-8 gap-4">
        <div className="flex items-center gap-6">
          <span>Session: {Math.random().toString(16).substr(2, 6).toUpperCase()}</span>
          <span className="text-zinc-400">Total Nodes: {results.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fab fa-google text-zinc-700"></i>
          <span>Data Grounded via Google Maps Platform</span>
        </div>
        <div className="hidden md:block">
          <span className="opacity-50">© {new Date().getFullYear()} Occam Systems extraction unit</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
