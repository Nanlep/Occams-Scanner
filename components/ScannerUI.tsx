
import React, { useState, useEffect } from 'react';
import { ScanQuery, Business } from '../types';
import { scanBusinesses } from '../services/geminiService';

interface ScannerUIProps {
  onResults: (results: Business[]) => void;
  onLoading: (isLoading: boolean) => void;
}

declare const BaniPopUp: any;

export const ScannerUI: React.FC<ScannerUIProps> = ({ onResults, onLoading }) => {
  const [query, setQuery] = useState<ScanQuery>({ category: '', location: '' });
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Generate a unique session ID for transaction tracking
    setSessionId(`OM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
  }, []);

  const initiateSession = () => {
    if (!query.category || !query.location) {
      setError('VALIDATION ERROR: Target Sector and Territory coordinates are required.');
      return;
    }
    if (!agreedToTerms) {
      setError('COMPLIANCE ERROR: You must acknowledge the Data Usage Agreement.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    // PRODUCTION: Ensure this matches your Bani.africa dashboard key
    const merchantKey = "YOUR_BANI_MERCHANT_KEY"; 

    try {
      if (typeof BaniPopUp === 'undefined') {
        throw new Error('Payment Bridge (BaniPopUp) failed to initialize.');
      }

      BaniPopUp({
        amount: 4.89,
        phoneNumber: "",
        email: "",
        merchantKey: merchantKey,
        ref: sessionId, // Use our session ID as the Bani reference
        onClose: () => setIsProcessing(false),
        callback: (response: any) => {
          if (response.status === "success" || response.message === "Successful") {
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
    setIsProcessing(true); // Keep locked during scan
    try {
      const results = await scanBusinesses(query);
      if (results.length === 0) {
        setError('SCAN COMPLETE: No high-probability leads detected in this sector matrix.');
      } else {
        onResults(results);
      }
    } catch (err: any) {
      setError(`SCAN FAILURE: ${err?.message || 'Data integrity violation during extraction.'}`);
    } finally {
      onLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="scan-line opacity-10"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Command Interface</h2>
            </div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] mt-1 font-bold">Session ID: {sessionId}</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-blue-600/10 border border-blue-500/30 px-4 py-2 rounded flex items-center gap-3">
              <i className="fas fa-coins text-blue-500 text-xs"></i>
              <span className="text-sm font-black text-white tracking-widest">$4.89 <span className="text-[9px] text-zinc-500 font-normal">/ SCAN</span></span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-2">
              <i className="fas fa-layer-group"></i> Target Sector
            </label>
            <input 
              type="text"
              disabled={isProcessing}
              placeholder="e.g. Fintech or SaaS"
              className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-blue-500 transition-all placeholder:text-zinc-800 text-white font-bold disabled:opacity-50"
              value={query.category}
              onChange={e => setQuery({ ...query, category: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-2">
              <i className="fas fa-map-marked-alt"></i> Territory Code
            </label>
            <input 
              type="text"
              disabled={isProcessing}
              placeholder="e.g. Johannesburg, SA"
              className="w-full bg-black border border-zinc-800 p-4 rounded text-sm focus:border-blue-500 transition-all placeholder:text-zinc-800 text-white font-bold disabled:opacity-50"
              value={query.location}
              onChange={e => setQuery({ ...query, location: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 bg-zinc-950/50 p-3 border border-zinc-800/50 rounded">
          <input 
            type="checkbox" 
            id="tos" 
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 accent-blue-600 bg-black border-zinc-700"
          />
          <label htmlFor="tos" className="text-[9px] text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-zinc-400 transition-colors">
            Acknowledge Enterprise Data Policy & Transaction Consent
          </label>
        </div>

        <button 
          onClick={initiateSession}
          disabled={isProcessing}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white font-black py-5 px-6 rounded uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 active:scale-[0.97] shadow-[0_10px_30px_rgba(59,130,246,0.2)] disabled:shadow-none group"
        >
          {isProcessing ? (
            <><i className="fas fa-sync-alt animate-spin"></i> Initializing Encryption...</>
          ) : (
            <>
              <i className="fas fa-lock-open text-xs group-hover:rotate-12 transition-transform"></i> 
              Authorize Extraction Sequence
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 p-5 bg-red-950/20 border-l-4 border-red-600 text-red-400 text-[10px] rounded-r-sm font-mono flex items-start gap-4 animate-shake">
            <i className="fas fa-exclamation-circle mt-0.5 text-sm"></i>
            <div className="leading-relaxed">
              <div className="font-black mb-1">STATION_ALERT: [0x404_AUTH_FAILURE]</div>
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
