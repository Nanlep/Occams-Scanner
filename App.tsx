
import React, { useState } from 'react';
import { ScannerUI } from './components/ScannerUI';
import { ResultsTable } from './components/ResultsTable';
import { Business } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntel, setShowIntel] = useState(false);

  return (
    <div className="min-h-screen pb-40 selection:bg-blue-600 selection:text-white relative overflow-x-hidden bg-[#030303] text-zinc-300">
      {/* CRT Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Global Status Bar */}
      <div className="bg-blue-600 py-1 px-6 text-[9px] font-black text-center text-white uppercase tracking-[0.5em] flex justify-center items-center gap-4">
        <span>Grounded Intelligence Active</span>
        <span className="opacity-50 italic">•</span>
        <span>Secure Transaction Environment</span>
        <span className="opacity-50 italic">•</span>
        <span>Node: 01-LAG-EXTRACTION</span>
      </div>

      {/* Primary Header */}
      <header className="border-b border-zinc-900 p-8 flex items-center justify-between bg-black/60 sticky top-0 z-50 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-14 h-14 border-2 border-blue-500 rounded flex items-center justify-center text-blue-500 bg-black relative">
               <i className="fas fa-crosshairs text-2xl"></i>
            </div>
          </div>
          <div className="text-left border-l border-zinc-800 pl-8">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
              OCCAM <span className="text-blue-500">MATRIX</span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.6em] font-black mt-2">Precision Lead Extraction Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <div className="text-[9px] text-zinc-700 uppercase font-black">Spatial Sync</div>
              <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-2 justify-end">
                Verified <i className="fas fa-check-double text-[8px]"></i>
              </div>
            </div>
            <div className="w-px h-8 bg-zinc-800"></div>
          </div>
          <button 
            onClick={() => setShowIntel(!showIntel)}
            className="group px-6 py-2.5 rounded border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-all"
          >
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-3">
              {showIntel ? <i className="fas fa-times text-blue-500"></i> : <i className="fas fa-info-circle text-blue-500"></i>}
              {showIntel ? 'Close Terminal' : 'System Intel'}
            </span>
          </button>
        </div>
      </header>

      {/* Operations Panel */}
      {showIntel && (
        <div className="max-w-5xl mx-auto mt-10 px-6 animate-slideDown">
          <div className="bg-zinc-950 border-2 border-zinc-900 p-10 rounded shadow-3xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <i className="fas fa-shield-alt text-8xl text-blue-500"></i>
            </div>
            <div className="flex items-center gap-4 text-white">
              <i className="fas fa-terminal text-blue-500"></i>
              <h4 className="font-black uppercase tracking-[0.3em] text-sm">Deployment Operations Manual v2.0</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-[11px] text-zinc-500 leading-relaxed font-medium">
              <div className="space-y-4">
                <span className="text-blue-500 block font-black tracking-widest border-b border-zinc-800 pb-2">01/ GROUNDING</span>
                <p>Occam utilizes Gemini 2.5's spatial grounding to anchor business data directly to verified Google Maps nodes. Accuracy is sub-meter.</p>
              </div>
              <div className="space-y-4">
                <span className="text-blue-500 block font-black tracking-widest border-b border-zinc-800 pb-2">02/ MONETIZATION</span>
                <p>Bani.africa handles high-velocity payments. $4.89 provides single-use session clearance for high-fidelity extraction.</p>
              </div>
              <div className="space-y-4">
                <span className="text-blue-500 block font-black tracking-widest border-b border-zinc-800 pb-2">03/ EXPORT</span>
                <p>Data manifests are formatted for Enterprise CRM ingestion. Utilize CSV commitment for direct sales pipeline population.</p>
              </div>
            </div>
            <div className="pt-6 border-t border-zinc-900 text-[9px] text-zinc-700 uppercase tracking-widest">
              © {new Date().getFullYear()} Scalar IT • Occam Matrix Enterprise
            </div>
          </div>
        </div>
      )}

      <main className="mt-20 space-y-20">
        {!results.length && !isLoading && (
          <div className="text-center px-6 animate-fadeIn">
            <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-zinc-950 border border-zinc-800 rounded shadow-xl text-[10px] text-zinc-500 uppercase tracking-[0.4em] mb-12">
              <span className="text-blue-500 font-black italic">Enterprise Licensed</span>
              <span className="h-3 w-px bg-zinc-800"></span>
              Secure Geolocation Feed Locked
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter max-w-5xl mx-auto mb-10 leading-[0.85] italic">
              MAP <span className="text-blue-600 underline decoration-4 underline-offset-8">INTELLIGENCE</span> FOR HIGH-VALUE SALES.
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-xl font-light leading-relaxed mb-10">
              Extraction engine ready to identify, score, and deliver 
              high-fidelity B2B leads from any territory on the planet.
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

      {/* Deployment Status Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-black/95 py-6 backdrop-blur-3xl z-40 px-12 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">GCP-NODE-ONLINE</span>
            </div>
            <span className="h-5 w-px bg-zinc-800 hidden md:block"></span>
            <div className="text-[10px] text-zinc-700 uppercase font-bold flex items-center gap-2">
              <i className="fas fa-shield-alt"></i> ISO_27001_COMPLIANT_READY
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Clearing Gateway</span>
            <div className="px-6 py-2 bg-white rounded-sm flex items-center justify-center border-b-4 border-zinc-300">
              <span className="text-black font-black text-[14px] tracking-tighter italic">bani.africa</span>
            </div>
          </div>

          <div className="text-[10px] text-zinc-800 uppercase font-black tracking-[0.5em] italic">
            Occam Matrix • A Product of Scalar IT • © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
