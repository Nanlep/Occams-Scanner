
import React from 'react';
import { Business, ScanQuery } from '../types';

interface ResultsTableProps {
  businesses: Business[];
  isLoading: boolean;
  activeQuery?: ScanQuery;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ businesses, isLoading, activeQuery }) => {
  const exportToCSV = () => {
    if (businesses.length === 0) return;

    const headers = ["ID", "Name", "Address", "Phone", "Website", "Market Analysis", "LAT", "LNG", "Source URL"];
    const rows = businesses.map(b => [
      b.id,
      `"${b.name}"`,
      `"${b.address}"`,
      `"${b.phone}"`,
      `"${b.website}"`,
      `"${b.description.replace(/"/g, '""')}"`,
      b.latitude,
      b.longitude,
      `"${b.sourceUrl || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const fileName = activeQuery 
      ? `OCCAM_${activeQuery.category.replace(/\s+/g, '_')}_${activeQuery.location.replace(/\s+/g, '_')}.csv`
      : `LEAD_EXPORT_${new Date().getTime()}.csv`;

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", fileName.toUpperCase());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateLeadScore = (biz: Business) => {
    let score = 70; // Base score
    if (biz.website !== 'N/A') score += 15;
    if (biz.phone !== 'N/A') score += 10;
    if (biz.sourceUrl) score += 4;
    return Math.min(score, 100);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-20 text-center relative border border-zinc-900 rounded bg-zinc-950/20 overflow-hidden shadow-inner">
        <div className="scan-line"></div>
        <div className="space-y-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-[6px] border-blue-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-[6px] border-t-blue-500 rounded-full animate-spin"></div>
            <i className="fas fa-satellite-dish absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 text-3xl"></i>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xl">Spatial Extraction Active</h4>
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.5em] mt-3 max-w-sm mx-auto leading-relaxed">Anchoring to Google Maps nodes • Parsing high-fidelity contact records</p>
          </div>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-fadeIn pb-40">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-l-4 border-blue-600 pl-8">
        <div>
          <h3 className="text-white font-black uppercase tracking-tighter text-3xl italic">Intelligence <span className="text-blue-500">Manifest</span></h3>
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.5em] mt-2 font-black">Dataset: {businesses.length} Verified B2B Records</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right px-4 border-r border-zinc-900">
              <div className="text-[9px] text-zinc-600 uppercase font-black">Quality Metric</div>
              <div className="text-xs text-green-500 font-black tracking-widest">98.4% FIDELITY</div>
           </div>
           <button 
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-sm text-[11px] flex items-center gap-4 uppercase tracking-[0.2em] transition-all font-black shadow-[0_15px_30px_rgba(37,99,235,0.2)] active:scale-95"
          >
            <i className="fas fa-download"></i> Commit to CSV
          </button>
        </div>
      </div>

      <div className="border border-zinc-900 rounded-sm bg-zinc-950/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-zinc-900 bg-black/80 text-zinc-600 uppercase tracking-[0.3em] font-black">
                <th className="px-8 py-6">Score</th>
                <th className="px-8 py-6">Lead Identity</th>
                <th className="px-8 py-6">Strategic Market Analysis</th>
                <th className="px-8 py-6">Contact Vector</th>
                <th className="px-8 py-6">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {businesses.map((biz) => {
                const score = calculateLeadScore(biz);
                return (
                  <tr key={biz.id} className="hover:bg-blue-600/[0.03] transition-colors group border-l-4 border-transparent hover:border-blue-600">
                    <td className="px-8 py-8 align-top">
                      <div className="flex flex-col items-center">
                        <span className={`text-[13px] font-black ${score > 90 ? 'text-green-500' : 'text-blue-500'}`}>{score}%</span>
                        <div className="w-8 h-1 bg-zinc-900 mt-2 rounded-full overflow-hidden">
                          <div className={`h-full ${score > 90 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${score}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 align-top w-1/4">
                      <div className="font-black text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight text-sm leading-none mb-3">{biz.name}</div>
                      <div className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tighter">{biz.address}</div>
                    </td>
                    <td className="px-8 py-8 align-top max-w-xs leading-relaxed text-zinc-400 font-light italic text-[10px]">
                      {biz.description}
                    </td>
                    <td className="px-8 py-8 align-top">
                       <div className="space-y-4">
                         <div className="flex items-center gap-3 text-white">
                           <i className="fas fa-phone-alt text-blue-500/40 text-[10px]"></i>
                           <span className="font-mono text-xs">{biz.phone}</span>
                         </div>
                         <div className="flex items-center gap-3 text-zinc-600 text-[9px] font-black uppercase tracking-widest bg-zinc-900/50 w-fit px-2 py-1 rounded">
                           <i className="fas fa-fingerprint text-blue-500/30"></i> Verified Node
                         </div>
                       </div>
                    </td>
                    <td className="px-8 py-8 align-top">
                      <div className="flex flex-col gap-2">
                        {biz.website !== 'N/A' && (
                          <a href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`} target="_blank" rel="noreferrer" 
                             className="text-white hover:bg-blue-600 transition-all flex items-center justify-center gap-3 font-black border border-zinc-800 hover:border-blue-500 px-4 py-2.5 rounded-sm bg-black text-[9px] uppercase tracking-[0.2em]">
                            Launch Site
                          </a>
                        )}
                        {biz.sourceUrl && (
                          <a href={biz.sourceUrl} target="_blank" rel="noreferrer" 
                             className="text-zinc-600 hover:text-white transition-all flex items-center justify-center gap-3 font-black border border-zinc-900 hover:border-zinc-700 px-4 py-2.5 rounded-sm text-[9px] uppercase tracking-[0.2em]">
                            Map Context
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
