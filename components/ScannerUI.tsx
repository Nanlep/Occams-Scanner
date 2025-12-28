
import React, { useState, useEffect } from 'react';
import { ScanQuery, Business } from '../types';
import { scanBusinesses } from '../services/geminiService';

interface ScannerUIProps {
  onResults: (results: Business[], query: ScanQuery) => void;
  onLoading: (isLoading: boolean) => void;
}

declare const BaniPopUp: any;

export const ScannerUI: React.FC<ScannerUIProps> = ({ onResults, onLoading }) => {
  const [query, setQuery] = useState<ScanQuery>({ category: '', location: '' });
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
    
    // PRODUCTION: Scalar IT Merchant Key Configuration
    const merchantKey = "YOUR_BANI_MERCHANT_KEY"; 
    const amount = currency === 'NGN' ? 4899 : 4.89;

    try {
      // Robust script check for production environments (Ad-blockers etc)
      if (typeof BaniPopUp === 'undefined') {
        throw new Error('Payment Bridge (BaniPopUp) script failed to load. Please disable ad-blockers and refresh.');
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
            setError('PAYMENT ALERT: Authorization failed or was cancelled by user.');
            setIsProcessing(false);
          }
        }
      });
    } catch (err: any) {
      console.error("Critical Deployment Failure:", err);
      setError(`SYSTEM ALERT: ${err.message || 'Payment engine unreachable.'}`);
      setIsProcessing(false);
    }
  };

  const executeDeepScan = async () => {
    onLoading(true);
    setIsProcessing(true);
    try {
      const results = await scanBusinesses(query);
      if (results.length === 0) {
        setError('SCAN COMPLETE: No high-probability leads detected in this sector matrix.');
      } else {
        onResults(results, query);
      }
    } catch (err: any) {
      setError(`SCAN FAILURE: ${err?.message || 'Data integrity violation during extraction.'}`);
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
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_#2563eb]" aria-hidden="true"></div>
              <h2 id="interface-heading" className="text-2xl font-black text-white uppercase tracking-tighter">Command Interface</h2>
            </div>
            <p className="text-[11px] text-zinc-700 uppercase tracking-[0.5em] mt-3 font-black">Active Session: {sessionId}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex bg-black border border-zinc-800 rounded p-1">
              <button 
                onClick={() => setCurrency('NGN')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded ${currency === 'NGN' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                NGN
              </button>
              <button 
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded ${currency === 'USD' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                USD
              </button>
            </div>
            <div className="bg-blue-600/10 border-2 border-blue-600/20 px-6 py-3 rounded flex items-center gap-4 shadow-inner" role="status" aria-label="Current extraction price">
              <i className="fas fa-credit-card text-blue-500 text-sm" aria-hidden="true"></i>
              <span className="text-lg font-black text-white tracking-widest">
                {currency === 'NGN' ? '₦4,899' : '$4.89'} 
                <span className="text-[10px] text-zinc-600 font-black uppercase ml-2">/ Deep-Scan</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label htmlFor="industry-input" className="text-[11px] text-zinc-600 uppercase font-black tracking-[0.3em] flex items-center gap-3">
              <i className="fas fa-search-location text-blue-600" aria-hidden="true"></i> Target Industry
            </label>
            <input 
              id="industry-input"
              type="text"
              disabled={isProcessing}
              placeholder="e.g. Fintech Startups"
              aria-label="Target Industry Sector"
              className="w-full bg-black border-2 border-zinc-900 p-5 rounded text-sm focus:border-blue-600 outline-none transition-all placeholder:text-zinc-800 text-white font-bold disabled:opacity-50"
              value={query.category}
              onChange={e => setQuery({ ...query, category: e.target.value })}
            />
          </div>
          <div className="space-y-4">
            <label htmlFor="territory-input" className="text-[11px] text-zinc-600 uppercase font-black tracking-[0.3em] flex items-center gap-3">
              <i className="fas fa-globe-africa text-blue-600" aria-hidden="true"></i> Territory Focus
            </label>
            <input 
              id="territory-input"
              type="text"
              disabled={isProcessing}
              placeholder="e.g. Nairobi, Kenya"
              aria-label="Target Geographical Territory"
              className="w-full bg-black border-2 border-zinc-900 p-5 rounded text-sm focus:border-blue-600 outline-none transition-all placeholder:text-zinc-800 text-white font-bold disabled:opacity-50"
              value={query.location}
              onChange={e => setQuery({ ...query, location: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4 bg-zinc-900/20 p-5 border border-zinc-900 rounded shadow-inner">
          <input 
            type="checkbox" 
            id="tos" 
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 accent-blue-600 bg-black border-zinc-800"
          />
          <label htmlFor="tos" className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] cursor-pointer hover:text-zinc-400 transition-colors font-bold">
            Acknowledge Enterprise Compliance & Mandatory {currency === 'NGN' ? '₦4,899' : '$4.89'} Authorization
          </label>
        </div>

        <button 
          onClick={initiateSession}
          disabled={isProcessing}
          aria-busy={isProcessing}
          className="mt-10 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 text-white font-black py-6 px-10 rounded uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-6 active:scale-[0.98] shadow-[0_20px_50px_rgba(37,99,235,0.3)] disabled:shadow-none group"
        >
          {isProcessing ? (
            <><i className="fas fa-circle-notch animate-spin" aria-hidden="true"></i> Authorizing Node...</>
          ) : (
            <>
              <i className="fas fa-key text-xs group-hover:rotate-45 transition-transform" aria-hidden="true"></i> 
              Initiate Extraction Sequence
            </>
          )}
        </button>

        {error && (
          <div className="mt-8 p-6 bg-red-950/20 border-l-[6px] border-red-600 text-red-400 text-[11px] rounded-r-sm font-mono flex items-start gap-6 animate-shake shadow-2xl" role="alert">
            <i className="fas fa-radiation mt-0.5 text-lg" aria-hidden="true"></i>
            <div className="leading-relaxed">
              <div className="font-black mb-1 uppercase tracking-widest text-red-500">Critical: Station Alert</div>
              {error}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
