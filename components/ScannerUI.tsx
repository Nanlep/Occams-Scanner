
import React, { useState, useEffect } from 'react';
import { ScanQuery, Business, Tier } from '../types';
import { scanBusinesses } from '../services/geminiService';

interface ScannerUIProps {
  onResults: (results: Business[], query: ScanQuery) => void;
  onLoading: (isLoading: boolean) => void;
}

declare const BaniPopUp: any;

const PRICING = {
  SINGLE: { usd: 4.89, ngn: 4899, label: 'Single Burst', limit: '15 Leads / Burst' },
  PRO: { usd: 37, ngn: 37000, label: 'Pro Node', limit: '15 Sessions / Mo' },
  ENTERPRISE: { usd: 169, ngn: 169000, label: 'Enterprise Matrix', limit: 'Unlimited Access' }
};

export const ScannerUI: React.FC<ScannerUIProps> = ({ onResults, onLoading }) => {
  const [query, setQuery] = useState<ScanQuery>({ category: '', location: '', booleanLogic: '' });
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const [activeTier, setActiveTier] = useState<Tier>('SINGLE');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [sessionId, setSessionId] = useState('');
  
  // Subscription persistence
  const [authorizedTier, setAuthorizedTier] = useState<Tier | null>(null);

  useEffect(() => {
    setSessionId(`OM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    const savedAuth = localStorage.getItem('om_auth_tier');
    if (savedAuth) setAuthorizedTier(savedAuth as Tier);
  }, []);

  const initiateSession = () => {
    setError(null);
    if (!query.category || !query.location) {
      setError('VALIDATION ERROR: Field target required.');
      return;
    }
    if (!agreedToTerms) {
      setError('COMPLIANCE ERROR: Agreement required.');
      return;
    }

    // Skip payment if already authorized for tier or higher
    const hasEnterprise = authorizedTier === 'ENTERPRISE';
    const hasPro = authorizedTier === 'PRO' && activeTier !== 'ENTERPRISE';
    
    if (hasEnterprise || hasPro) {
      executeDeepScan();
      return;
    }

    setIsProcessing(true);
    // Note: This key should be in your environment variables in a real deployment
    const merchantKey = "YOUR_BANI_MERCHANT_KEY"; 
    const amount = currency === 'NGN' ? PRICING[activeTier].ngn : PRICING[activeTier].usd;

    try {
      if (typeof BaniPopUp === 'undefined') {
        throw new Error('Payment Node unreachable. Check connection.');
      }

      BaniPopUp({
        amount: amount,
        phoneNumber: "",
        email: "",
        merchantKey: merchantKey,
        ref: `${sessionId}-${activeTier}`,
        onClose: () => setIsProcessing(false),
        callback: (response: any) => {
          if (response && (response.status === "success" || response.message === "Successful")) {
            // Subscription persistence logic
            if (activeTier !== 'SINGLE') {
              setAuthorizedTier(activeTier);
              localStorage.setItem('om_auth_tier', activeTier);
            }
            executeDeepScan();
          } else {
            setError('PAYMENT ALERT: Authorization failed.');
            setIsProcessing(false);
          }
        }
      });
    } catch (err: any) {
      setError(`CRITICAL: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const executeDeepScan = async () => {
    onLoading(true);
    setIsProcessing(true);
    try {
      const results = await scanBusinesses(query);
      if (results.length === 0) {
        setError('SCAN REPORT: Zero matches in specified territory.');
      } else {
        onResults(results, query);
      }
    } catch (err: any) {
      setError(`NODE FAILURE: Extraction stream interrupted.`);
    } finally {
      onLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto p-6 space-y-12 animate-fadeIn" aria-labelledby="interface-heading">
      
      {/* Dynamic Tier Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['SINGLE', 'PRO', 'ENTERPRISE'] as Tier[]).map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`relative p-8 rounded-sm border-2 transition-all text-left overflow-hidden group ${
              activeTier === tier 
                ? 'bg-blue-600/10 border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.2)]' 
                : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'
            }`}
          >
            {activeTier === tier && <div className="scan-line !h-[2px] opacity-30"></div>}
            <div className="flex justify-between items-start mb-6">
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${activeTier === tier ? 'text-blue-500' : 'text-zinc-600'}`}>
                {PRICING[tier].label}
              </span>
              {(authorizedTier === tier || (authorizedTier === 'ENTERPRISE' && tier !== 'ENTERPRISE')) && (
                <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 text-[8px] px-2 py-1 rounded-sm border border-green-500/20 font-black uppercase">
                  <i className="fas fa-check-circle"></i> Licensed
                </div>
              )}
            </div>
            <div className="text-3xl font-black text-white italic mb-2 tracking-tighter">
              {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? PRICING[tier].ngn.toLocaleString() : PRICING[tier].usd}
              <span className="text-[10px] text-zinc-600 not-italic ml-2 font-bold">{tier === 'SINGLE' ? '/ burst' : '/ month'}</span>
            </div>
            <ul className="text-[9px] text-zinc-500 space-y-3 uppercase font-black tracking-widest mt-6">
              <li className="flex items-center gap-3">
                <i className={`fas fa-circle text-[4px] ${tier === activeTier ? 'text-blue-500' : 'text-zinc-800'}`}></i>
                {PRICING[tier].limit}
              </li>
              <li className="flex items-center gap-3">
                <i className={`fas fa-circle text-[4px] ${tier === activeTier ? 'text-blue-500' : 'text-zinc-800'}`}></i>
                Global B2B / Shopify
              </li>
              <li className="flex items-center gap-3">
                <i className={`fas fa-circle text-[4px] ${tier === activeTier ? 'text-blue-500' : 'text-zinc-800'}`}></i>
                Boolean Logic Pro
              </li>
            </ul>
          </button>
        ))}
      </div>

      <div className="bg-zinc-950 border-2 border-zinc-900 p-10 rounded-sm shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="scan-line opacity-10"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-6">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_#2563eb]"></div>
              <h2 id="interface-heading" className="text-2xl font-black text-white uppercase tracking-tighter">Command Unit</h2>
            </div>
            <p className="text-[11px] text-zinc-700 uppercase tracking-[0.5em] mt-3 font-black">Auth: {sessionId} // Mode: {PRICING[activeTier].label}</p>
          </div>
          <div className="flex bg-black border border-zinc-800 rounded-sm p-1">
            <button onClick={() => setCurrency('NGN')} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${currency === 'NGN' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>NGN</button>
            <button onClick={() => setCurrency('USD')} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${currency === 'USD' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}>USD</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest flex items-center gap-2">
              <i className="fas fa-microchip text-blue-500"></i> Platform / Sector
            </label>
            <input type="text" placeholder="e.g. Shopify merchants" className="w-full bg-black border-2 border-zinc-900 p-5 rounded-sm text-sm text-white focus:border-blue-600 outline-none transition-all placeholder:text-zinc-800 font-bold" value={query.category} onChange={e => setQuery({ ...query, category: e.target.value })} />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-blue-500"></i> Global Region
            </label>
            <input type="text" placeholder="e.g. California, USA" className="w-full bg-black border-2 border-zinc-900 p-5 rounded-sm text-sm text-white focus:border-blue-600 outline-none transition-all placeholder:text-zinc-800 font-bold" value={query.location} onChange={e => setQuery({ ...query, location: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <label className="text-[10px] text-zinc-600 uppercase font-black tracking-widest flex justify-between items-center">
            Boolean Extraction Script
            <span className="text-blue-500/50 normal-case font-medium italic">Protocol: (AND, OR, NOT)</span>
          </label>
          <input type="text" placeholder="e.g. (Organic OR Vegan) AND Shopify NOT 'Dropshipping'" className="w-full bg-black border-2 border-zinc-900 p-5 rounded-sm text-sm text-white focus:border-blue-600 outline-none font-mono placeholder:text-zinc-800" value={query.booleanLogic} onChange={e => setQuery({ ...query, booleanLogic: e.target.value })} />
        </div>

        <div className="mb-10 flex items-center gap-4 bg-zinc-900/20 p-5 border border-zinc-900 rounded-sm">
          <input 
            type="checkbox" 
            id="tos" 
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className="w-5 h-5 accent-blue-600 bg-black border-zinc-800"
          />
          <label htmlFor="tos" className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] cursor-pointer font-black">
            Acknowledge Enterprise Protocol and {authorizedTier ? `${authorizedTier} License Usage` : `${PRICING[activeTier].label} Authorization`}
          </label>
        </div>

        <button onClick={initiateSession} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 text-white font-black py-7 rounded-sm uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-6 shadow-[0_20px_60px_rgba(37,99,235,0.4)] active:scale-[0.99]">
          {isProcessing ? (
            <span className="flex items-center gap-3">
              <i className="fas fa-circle-notch animate-spin"></i>
              Node Syncing...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <i className="fas fa-bolt text-xs"></i>
              {authorizedTier ? 'Execute Matrix Extraction' : `Authorize & Scan (${currency === 'NGN' ? '₦' + PRICING[activeTier].ngn.toLocaleString() : '$' + PRICING[activeTier].usd})`}
            </span>
          )}
        </button>

        {error && <div className="mt-8 p-6 bg-red-950/20 border-l-[6px] border-red-600 text-red-400 text-[10px] uppercase font-black tracking-widest animate-shake rounded-sm">{error}</div>}
      </div>
    </section>
  );
};
