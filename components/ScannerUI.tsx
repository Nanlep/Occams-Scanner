
import React, { useState, useEffect } from 'react';
import { ScanQuery, Business } from '../types';
import { scanBusinesses } from '../services/geminiService';

interface ScannerUIProps {
  onResults: (results: Business[], query: ScanQuery) => void;
  onLoading: (isLoading: boolean) => void;
}

declare const BaniPopUp: any;

export const ScannerUI: React.FC<ScannerUIProps> = ({ onResults, onLoading }) => {
  const [query, setQuery] = useState<ScanQuery>({ category: '', location: '', booleanLogic: '' });
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(`OM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
  }, []);

  const initiateSession = () => {
    setError(null);
    if (!query.category || !query.location) {
      setError('VALIDATION ERROR: Target Sector and Territory coordinates are required.');
      return;
    }
    if (!agreedToTerms) {
      setError('COMPLIANCE ERROR: You must acknowledge the Data Usage Agreement.');
      return;
    }

    setIsProcessing(true);
    const merchantKey = "YOUR_BANI_MERCHANT_KEY"; 
    const amount = currency === 'NGN' ? 4899 : 4.89;

    try {
      if (typeof BaniPopUp === 'undefined') {
        throw new Error('Payment Bridge failed to load. Check connection.');
      }

      BaniPopUp({
        amount: amount,
        phoneNumber: "",
        email: "",
        merchantKey: merchantKey,
        ref: sessionId,
        onClose: () => setIsProcessing(false),
        callback: (response: any) => {
          if (response && (response.status === "success" || response.message === "Successful")) {
            executeDeepScan();
          } else {
            setError('PAYMENT ALERT: Authorization failed.');
            setIsProcessing(false);
          }
        }
      });
    } catch (err: any) {
      setError(`SYSTEM ALERT: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const executeDeepScan = async () => {
    onLoading(true);
    setIsProcessing(true);
    try {
      const results = await scanBusinesses(query);
      if (results.length === 0) {
        setError('SCAN COMPLETE: No leads matching your Boolean constraints.');
      } else {
        onResults(results, query);
      }
    } catch (err: any) {
      setError(`SCAN FAILURE: Data extraction interrupted.`);
    } finally {
      onLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto p-6" aria-labelledby="interface-heading">
      <div className="bg-zinc-950 border-2 border-zinc-900 p-10 rounded shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="scan-line opacity-10"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_#2563eb]"></div>
              <h2 id="interface-heading" className="text-2xl font-black text-white uppercase tracking-tighter">Matrix Command</h2>
            </div>
            <p className="text-[11px] text-zinc-700 uppercase tracking-[0.5em] mt-3 font-black">Secure Node: {sessionId}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex bg-black border border-zinc-800 rounded p-1">
              <button onClick={() => setCurrency('NGN')} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded ${currency === 'NGN' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>NGN</button>
              <button onClick={() => setCurrency('USD')} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded ${currency === 'USD' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>USD</button>
            </div>
            <div className="bg-blue-600/10 border-2 border-blue-600/20 px-6 py-3 rounded flex items-center gap-4">
              <span className="text-lg font-black text-white">{currency === 'NGN' ? '₦4,899' : '$4.89'} <span className="text-[10px] text-zinc-600 uppercase">/ SCAN</span></span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Target Sector</label>
            <input type="text" placeholder="e.g. Solar Energy" className="w-full bg-black border-2 border-zinc-900 p-4 rounded text-sm text-white focus:border-blue-600 outline-none" value={query.category} onChange={e => setQuery({ ...query, category: e.target.value })} />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Territory Focus</label>
            <input type="text" placeholder="e.g. Lagos, Nigeria" className="w-full bg-black border-2 border-zinc-900 p-4 rounded text-sm text-white focus:border-blue-600 outline-none" value={query.location} onChange={e => setQuery({ ...query, location: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest flex justify-between items-center">
            Boolean Search Console
            <span className="text-blue-500/50 normal-case font-medium italic">Example: (Tech OR SaaS) AND "Series A"</span>
          </label>
          <input type="text" placeholder="Optional Boolean Logic (AND, OR, NOT, Quotes)" className="w-full bg-black border-2 border-zinc-900 p-4 rounded text-sm text-white focus:border-blue-600 outline-none font-mono" value={query.booleanLogic} onChange={e => setQuery({ ...query, booleanLogic: e.target.value })} />
        </div>

        <button onClick={initiateSession} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 text-white font-black py-6 rounded uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-6 shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
          {isProcessing ? 'SCANNING DEEP WEB...' : 'EXECUTE EXTRACTION SEQUENCE'}
        </button>

        {error && <div className="mt-6 p-4 bg-red-950/20 border-l-4 border-red-600 text-red-400 text-[10px] uppercase font-black tracking-widest animate-shake">{error}</div>}
      </div>
    </section>
  );
};
