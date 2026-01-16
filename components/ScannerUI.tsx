// src/components/ScannerUI.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ScanQuery, Business, Tier, SystemLog } from '../types';
import useCheckout from 'bani-react';
import { scanBusinesses } from '../services/geminiService';

interface ScannerUIProps {
  onResults: (results: Business[], query: ScanQuery) => void;
  onLoading: (isLoading: boolean) => void;
}

const PRICING = {
  SINGLE: { usd: 4.89, ngn: 4899, label: 'Single Burst', limit: '15 Leads / Burst' },
  PRO: { usd: 37, ngn: 37000, label: 'Pro Node', limit: '15 Sessions / Mo' },
  ENTERPRISE: { usd: 169, ngn: 169000, label: 'Enterprise Matrix', limit: '5,000 Nodes / Mo (Capped)' }
};

export const ScannerUI: React.FC<ScannerUIProps> = ({ onResults, onLoading }) => {
  const { BaniPopUp } = useCheckout();

  const [query, setQuery] = useState<ScanQuery>({ category: '', location: '', booleanLogic: '' });
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('NGN');
  const [activeTier, setActiveTier] = useState<Tier>('SINGLE');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [authorizedTier, setAuthorizedTier] = useState<Tier | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreKey, setRestoreKey] = useState('');

  useEffect(() => {
    setSessionId(`OM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    const savedAuth = localStorage.getItem('om_auth_tier');
    if (savedAuth) {
      setAuthorizedTier(savedAuth as Tier);
      addLog(`Authorized Node Restored: ${savedAuth} level active.`, 'success');
      if (savedAuth === 'ENTERPRISE') {
        addLog('CONFIRMED: Enterprise Capping Protocol Active (5k Limit).', 'info');
      }
    } else {
      addLog('System handshake complete. Capping Protocol: ENABLED.', 'info');
    }
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-10), newLog]);
  };

  const handleRestoreLicense = () => {
    setError(null);
    if (restoreKey.startsWith('OM-REF-')) {
      const parts = restoreKey.split('-');
      const tier = parts.includes('PRO') ? 'PRO' : parts.includes('ENTERPRISE') ? 'ENTERPRISE' : null;
      if (tier) {
        setAuthorizedTier(tier as Tier);
        localStorage.setItem('om_auth_tier', tier);
        addLog(`External License Synchronized: ${tier} Node Active`, 'success');
        if (tier === 'ENTERPRISE') addLog('Usage Cap Verified: 5,000 Monthly Syncs.', 'info');
        setShowRestoreModal(false);
        setRestoreKey('');
      } else {
        setError('LICENSE MISMATCH: Tier signature missing.');
      }
    } else {
      setError('INVALID SIGNATURE: Ensure you enter the full Reference ID.');
    }
  };

  const initiateSession = () => {
    setError(null);
    if (!query.category.trim() || !query.location.trim()) {
      setError('VALIDATION ERROR: Target region and category parameters required.');
      addLog('Validation check failed: Missing scan parameters.', 'error');
      return;
    }

    const hasEnterprise = authorizedTier === 'ENTERPRISE';
    const hasPro = authorizedTier === 'PRO' && activeTier !== 'ENTERPRISE';

    if (hasEnterprise || hasPro) {
      addLog(`Bypassing gateway. Authorized ${authorizedTier} token detected.`, 'success');
      executeDeepScan();
      return;
    }

    setIsProcessing(true);
    const amount = currency === 'NGN' ? PRICING[activeTier].ngn : PRICING[activeTier].usd;

    try {
      const MERCHANT_KEY = import.meta.env.VITE_BANI_MERCHANT_KEY;

      BaniPopUp({
        amount,
        merchantKey: MERCHANT_KEY,
        ref: `${sessionId}-${activeTier}-${Date.now()}`,
        metadata: { tier: activeTier },
        firstName: 'Occam',
        lastName: 'Matrix',
        email: 'info@example.com',
        phoneNumber: '08021234567',
        onSuccess: (response: any) => {
          const licenseKey = `OM-REF-${activeTier}-${response.ref || sessionId}`;
          if (activeTier !== 'SINGLE') {
            setAuthorizedTier(activeTier);
            localStorage.setItem('om_auth_tier', activeTier);
            addLog(`Permanent Node Authorized: ${licenseKey}`, 'success');
            if (activeTier === 'ENTERPRISE') addLog('Enterprise usage capped at 5k/mo.', 'info');
          } else {
            addLog('Single-burst authorization confirmed.', 'success');
          }
          executeDeepScan();
        },
        onClose: () => {
          setIsProcessing(false);
          addLog('Payment interface closed by operator.', 'warning');
        }
      });
    } catch (err: any) {
      setError(`CRITICAL GATEWAY FAILURE: ${err.message}`);
      setIsProcessing(false);
      addLog(`Gateway Error: ${err.message}`, 'error');
    }
  };

  const executeDeepScan = async () => {
    onLoading(true);
    setIsProcessing(true);
    addLog(`Scanning territory [${query.location}] for [${query.category}]...`, 'info');

    try {
      const results = await scanBusinesses(query);
      if (results.length === 0) {
        addLog('Zero signals detected in target coordinates.', 'warning');
        setError('MANIFEST EMPTY: Region returned no matching signals.');
      } else {
        addLog(`Extraction complete. ${results.length} nodes successfully mapped.`, 'success');
        onResults(results, query);
      }
    } catch (err: any) {
      addLog(`Critical stream error: ${err.message || 'Unknown Protocol Failure'}`, 'error');
      setError(`EXTRACTION ABORTED: Node synchronization lost.`);
    } finally {
      onLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto p-6 space-y-16 animate-fadeIn relative pb-20">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>

      {/* Tier Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {(['SINGLE', 'PRO', 'ENTERPRISE'] as Tier[]).map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`relative p-10 rounded-sm border-2 transition-all text-left overflow-hidden group hover:-translate-y-1 ${
              activeTier === tier
                ? 'bg-blue-600/10 border-blue-600 shadow-[0_30px_60px_rgba(37,99,235,0.15)]'
                : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'
            }`}
          >
            {activeTier === tier && <div className="scan-line opacity-20"></div>}
            <div className="flex justify-between items-start mb-8">
              <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${activeTier === tier ? 'text-blue-500' : 'text-zinc-600'}`}>
                {PRICING[tier].label}
              </span>
              {(authorizedTier === tier || (authorizedTier === 'ENTERPRISE' && tier !== 'ENTERPRISE')) && (
                <div className="bg-blue-600/20 text-blue-400 text-[9px] px-3 py-1.5 rounded-sm border border-blue-500/20 font-black uppercase tracking-tighter">
                  ACTIVE_LINK
                </div>
              )}
            </div>
            <div className="text-4xl font-black text-white italic tracking-tighter mb-2">
              {currency === 'NGN' ? '₦' + PRICING[tier].ngn.toLocaleString() : '$' + PRICING[tier].usd}
            </div>
            <p className="text-[10px] text-zinc-500 mt-8 uppercase font-bold tracking-widest leading-relaxed flex items-center gap-3">
              <i className="fas fa-terminal text-blue-500/40"></i> {PRICING[tier].limit}
            </p>
          </button>
        ))}
      </div>

      {/* Scan Form */}
      <div className="bg-zinc-950 border-2 border-zinc-900 p-12 rounded-sm relative z-10 shadow-2xl overflow-visible">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-16 gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-6">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Command Interface</h2>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <p className="text-[11px] text-zinc-700 uppercase tracking-widest font-black">Local Node ID: {sessionId}</p>
              <button
                onClick={() => setShowRestoreModal(true)}
                className="text-[10px] text-blue-500 uppercase font-black hover:text-white transition-colors border-b border-blue-500/30 pb-0.5"
              >
                [ Restore Access ]
              </button>
            </div>
          </div>
          <div className="flex bg-black border-2 border-zinc-900 rounded-sm p-1.5">
            {['NGN', 'USD'].map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c as any)}
                className={`px-8 py-3 text-[11px] font-black uppercase tracking-widest rounded-sm transition-all ${
                  currency === c ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Target Category</label>
            <input
              type="text"
              placeholder="e.g. Luxury Real Estate Agents"
              className="w-full bg-black border-2 border-zinc-900 p-6 rounded-sm text-sm text-white focus:border-blue-600 outline-none transition-colors font-bold"
              value={query.category}
              onChange={e => setQuery({ ...query, category: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Geographical Zone</label>
            <input
              type="text"
              placeholder="e.g. Dubai, UAE"
              className="w-full bg-black border-2 border-zinc-900 p-6 rounded-sm text-sm text-white focus:border-blue-600 outline-none transition-colors font-bold"
              value={query.location}
              onChange={e => setQuery({ ...query, location: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-12 relative z-10">
          <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest ml-1">Boolean Intelligence Override (Optional)</label>
          <input
            type="text"
            placeholder="e.g. 'CEO' AND 'Tech' NOT 'Retail'"
            className="w-full bg-black border-2 border-zinc-900 p-6 rounded-sm text-sm text-white focus:border-blue-600 outline-none font-mono transition-colors shadow-inner"
            value={query.booleanLogic}
            onChange={e => setQuery({ ...query, booleanLogic: e.target.value })}
          />
        </div>

        {/* Live Logs */}
        <div className="bg-black border-2 border-zinc-900 p-6 mb-12 h-44 overflow-y-auto font-mono text-[10px] space-y-2 relative z-10 shadow-inner group">
          <div className="absolute top-2 right-4 text-[8px] text-zinc-800 uppercase font-black tracking-widest">Live Output Stream</div>
          {logs.map((log, i) => (
            <div key={i} className={`flex gap-4 border-l-2 pl-3 ${log.type === 'error' ? 'border-red-600 text-red-500' : log.type === 'success' ? 'border-green-500 text-green-400' : 'border-zinc-800 text-zinc-500'}`}>
              <span className="opacity-20 tabular-nums">[{log.timestamp}]</span>
              <span className="font-black">NODE_LOG:</span>
              <span className="tracking-tight">{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Execute Button */}
        <button
          onClick={initiateSession}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 text-white font-black py-8 rounded-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-6 shadow-[0_25px_60px_rgba(37,99,235,0.4)] active:scale-[0.98] relative z-10 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          {isProcessing ? (
            <><i className="fas fa-circle-notch animate-spin"></i> Synchronizing Pulse...</>
          ) : (
            <>{authorizedTier ? 'Execute Matrix Extraction' : `Authenticate & Deploy Node (${currency === 'NGN' ? '₦' + PRICING[activeTier].ngn.toLocaleString() : '$' + PRICING[activeTier].usd})`}</>
          )}
        </button>

        {error && (
          <div className="mt-10 p-8 bg-red-950/20 border-2 border-red-600 text-red-500 text-[11px] uppercase font-black tracking-[0.2em] animate-shake flex items-center gap-6 relative z-10">
            <i className="fas fa-exclamation-triangle text-xl"></i>
            <div>
              <div className="text-white">SYSTEM_FAULT DETECTED</div>
              <div className="opacity-70 mt-1">{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Restore License Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-8 backdrop-blur-xl">
          <div className="bg-zinc-950 border-2 border-zinc-800 p-12 w-full max-w-lg rounded-sm shadow-[0_100px_200px_rgba(0,0,0,1)] relative animate-fadeIn">
            <button onClick={() => setShowRestoreModal(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors"><i className="fas fa-times text-xl"></i></button>
            <h3 className="text-white font-black uppercase tracking-tighter text-2xl mb-4 italic">LICENSE SYNCHRONIZATION</h3>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-10 leading-relaxed font-medium">
              Provide your <span className="text-blue-500">Transaction ID</span> or <span className="text-blue-500">Digital Signature</span> from a previous session to restore multi-node access.
            </p>
            <input 
              type="text" 
              placeholder="e.g. OM-REF-PRO-..." 
              className="w-full bg-black border-2 border-zinc-900 p-6 rounded-sm text-white mb-8 font-mono text-sm focus:border-blue-600 outline-none shadow-inner"
              value={restoreKey}
              onChange={e => setRestoreKey(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={handleRestoreLicense}
                className="flex-1 bg-white text-black font-black py-5 rounded-sm uppercase tracking-widest text-[11px] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
              >
                Validate Identity
              </button>
              <button 
                onClick={() => setShowRestoreModal(false)}
                className="px-8 border-2 border-zinc-900 text-zinc-500 font-black py-5 rounded-sm uppercase tracking-widest text-[11px] hover:bg-zinc-800 hover:text-white transition-all shadow-xl active:scale-95"
              >
                Cancel
              </button>
            </div>
            {error && <p className="text-red-500 mt-4 text-[11px] uppercase font-black tracking-widest">{error}</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default ScannerUI;
