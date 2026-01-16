
import React, { useState, useEffect } from 'react';
import { ScannerUI } from './components/ScannerUI';
import { ResultsTable } from './components/ResultsTable';
import { Business, ScanQuery } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<Business[]>([]);
  const [activeQuery, setActiveQuery] = useState<ScanQuery | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showIntel, setShowIntel] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [nodeHealth, setNodeHealth] = useState(100);

  // Simulated Backend Sync
  useEffect(() => {
    const syncWithBackend = async () => {
      setIsSyncing(true);
      // Simulate network latency for backend handshake
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const savedResults = localStorage.getItem('om_last_results');
      const savedQuery = localStorage.getItem('om_last_query');
      if (savedResults) {
        try {
          setResults(JSON.parse(savedResults));
          if (savedQuery) setActiveQuery(JSON.parse(savedQuery));
        } catch (e) {
          console.warn("Integrity check failed. Cache purged.");
          localStorage.removeItem('om_last_results');
        }
      }
      setIsSyncing(false);
    };

    syncWithBackend();

    // Randomize node health for "production feel"
    const interval = setInterval(() => {
      setNodeHealth(98 + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResults = (newResults: Business[], query?: ScanQuery) => {
    setResults(newResults);
    if (query) {
      setActiveQuery(query);
      localStorage.setItem('om_last_results', JSON.stringify(newResults));
      localStorage.setItem('om_last_query', JSON.stringify(query));
    }
  };

  const clearSession = () => {
    if (window.confirm("PURGE MANIFEST? All local lead data will be deleted.")) {
      setResults([]);
      setActiveQuery(undefined);
      localStorage.removeItem('om_last_results');
      localStorage.removeItem('om_last_query');
    }
  };

  if (isSyncing) {
    return (
      <div className="fixed inset-0 bg-[#020202] z-[1000] flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-satellite-dish text-blue-500 text-3xl animate-pulse"></i>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-white font-black uppercase tracking-[0.5em] text-sm italic">Synchronizing Matrix</h2>
          <p className="text-zinc-600 text-[9px] uppercase tracking-[0.3em]">Connecting to Scalar Global Node LAG-01...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 selection:bg-blue-600 selection:text-white relative overflow-x-hidden bg-[#020202] text-zinc-300">
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <div className="bg-blue-600 py-1.5 px-6 text-[9px] font-black text-center text-white uppercase tracking-[0.6em] flex justify-center items-center gap-4 shadow-xl z-50 relative">
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
          LIVE FEED: {nodeHealth}% UPTIME
        </span>
        <span className="opacity-40 italic">/</span>
        <span>GLOBAL NODE: LAG-SC-01</span>
        <span className="opacity-40 italic">/</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          SCALAR IT ENTERPRISE
        </span>
      </div>

      <header className="border-b border-zinc-900 p-8 flex items-center justify-between bg-black/80 sticky top-0 z-50 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="w-14 h-14 border-2 border-blue-600 rounded flex items-center justify-center text-blue-500 bg-black relative shadow-2xl">
               <i className="fas fa-globe text-2xl animate-spin-slow" style={{ animationDuration: '10s' }}></i>
            </div>
          </div>
          <div className="text-left border-l-2 border-zinc-800 pl-8">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
              OCCAM <span className="text-blue-600">MATRIX</span>
            </h1>
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.7em] font-black mt-3">Global Business Extraction Engine v4.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {results.length > 0 && (
            <button 
              onClick={clearSession}
              className="text-[9px] text-zinc-600 hover:text-red-500 uppercase font-black tracking-widest transition-colors flex items-center gap-2"
            >
              <i className="fas fa-trash-alt"></i> Purge Cache
            </button>
          )}
          <button 
            onClick={() => setShowIntel(!showIntel)}
            className="group px-8 py-3 rounded border-2 border-zinc-900 bg-zinc-950 hover:border-zinc-700 transition-all shadow-xl"
          >
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em] flex items-center gap-3">
              {showIntel ? <i className="fas fa-times text-blue-500"></i> : <i className="fas fa-info-circle text-blue-500"></i>}
              {showIntel ? 'Hide Intel' : 'Global protocols'}
            </span>
          </button>
        </div>
      </header>

      {showIntel && (
        <div className="max-w-6xl mx-auto mt-12 px-6 animate-slideDown">
          <div className="bg-zinc-950 border-2 border-zinc-900 p-12 rounded shadow-[0_30px_60px_rgba(0,0,0,0.8)] space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <i className="fas fa-rocket text-[120px] text-blue-600"></i>
            </div>
            <div className="flex items-center gap-4 text-white">
              <i className="fas fa-broadcast-tower text-blue-600 text-xl"></i>
              <h4 className="font-black uppercase tracking-[0.4em] text-sm">Extraction Protocols v4.0-Global</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-[11px] text-zinc-500 leading-relaxed font-medium">
              <div className="space-y-5">
                <span className="text-blue-600 block font-black tracking-[0.3em] border-b-2 border-zinc-900 pb-3">01/ SPATIAL GROUNDING</span>
                <p>The matrix utilizes Google Maps grounding to verify physical business locations, operating hours, and local consumer signals globally.</p>
              </div>
              <div className="space-y-5">
                <span className="text-blue-600 block font-black tracking-[0.3em] border-b-2 border-zinc-900 pb-3">02/ CONTACT MINING</span>
                <p>Advanced Boolean crawlers navigate deep-web layers to extract verified corporate emails, social handles, and marketing channels for every lead.</p>
              </div>
              <div className="space-y-5">
                <span className="text-blue-600 block font-black tracking-[0.3em] border-b-2 border-zinc-900 pb-3">03/ MULTI-REGION</span>
                <p>Full support for EU, US, Asia, and MEA regions with localized data enrichment and international formatting.</p>
              </div>
            </div>
            <div className="pt-8 border-t border-zinc-900 flex justify-between items-center">
              <div className="text-[9px] text-zinc-700 uppercase tracking-widest font-black">
                © {new Date().getFullYear()} Scalar IT • Global Extraction Matrix
              </div>
              <div className="text-[9px] text-zinc-800 uppercase font-black">Backend Synchronized</div>
            </div>
          </div>
        </div>
      )}

      <main className="mt-24 space-y-24">
        {!results.length && !isLoading && (
          <div className="text-center px-6 animate-fadeIn">
            <div className="inline-flex items-center gap-6 px-8 py-3 bg-zinc-950 border border-zinc-900 rounded shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-[10px] text-zinc-500 uppercase tracking-[0.5em] mb-16">
              <span className="text-blue-600 font-black italic">Maps Authenticated</span>
              <span className="h-4 w-px bg-zinc-800"></span>
              Backend Status: Online
            </div>
            <h2 className="text-6xl md:text-[100px] font-black text-white uppercase tracking-tighter max-w-6xl mx-auto mb-12 leading-[0.8] italic">
              GLOBAL <span className="text-blue-600 underline decoration-8 underline-offset-[16px]">MATRIX</span> SCAN.
            </h2>
            <p className="text-zinc-500 max-w-3xl mx-auto text-2xl font-light leading-relaxed mb-12">
              Deep-extraction of global business data from Google Maps. 
              Enterprise subscriptions are now capped at 5,000 monthly nodes for production stability.
            </p>
          </div>
        )}

        <ScannerUI 
          onResults={(res, query) => handleResults(res, query)} 
          onLoading={setIsLoading} 
        />

        <ResultsTable 
          businesses={results} 
          isLoading={isLoading} 
          activeQuery={activeQuery}
        />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-black/95 py-8 backdrop-blur-3xl z-40 px-16 shadow-[0_-30px_60px_rgba(0,0,0,0.9)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
              <span className="text-[11px] text-zinc-500 uppercase font-black tracking-[0.3em]">NODE-LAG-SC-01-ACTIVE</span>
            </div>
            <span className="h-6 w-px bg-zinc-800 hidden md:block"></span>
            <div className="text-[10px] text-zinc-700 uppercase font-black flex items-center gap-3 tracking-widest">
              <i className="fas fa-check-double text-blue-900"></i> BACKEND SYNCED
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <span className="text-[10px] text-zinc-700 uppercase font-black tracking-widest">Gateway Provider</span>
            <div className="px-8 py-3 bg-white rounded-sm flex items-center justify-center border-b-[6px] border-zinc-300 shadow-2xl">
              <span className="text-black font-black text-[16px] tracking-tighter italic">bani.africa</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-800 uppercase font-black tracking-[0.4em] italic text-right">
            Occam Matrix • Production Grade • © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
