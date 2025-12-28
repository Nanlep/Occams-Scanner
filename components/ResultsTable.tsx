
import React from 'react';
import { Business } from '../types';

interface ResultsTableProps {
  businesses: Business[];
  isLoading: boolean;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ businesses, isLoading }) => {
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

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `LEAD_EXPORT_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-20 text-center relative border border-zinc-800 rounded bg-zinc-900/20 overflow-hidden">
        <div className="scan-line"></div>
        <div className="space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            <i className="fas fa-fingerprint absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 text-2xl"></i>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-lg">Extraction in Progress</h4>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mt-2">Decoding spatial layers • Verifying contact nodes • Scoring leads</p>
          </div>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-fadeIn pb-32">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 border-l-2 border-blue-500 pl-6">
        <div>
          <h3 className="text-white font-black uppercase tracking-tighter text-2xl italic">Intelligence <span className="text-blue-500">Manifest</span></h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] mt-1">Verified B2B Lead Aggregation Complete</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right mr-4">
              <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Dataset Quality</div>
              <div className="text-xs text-green-500 font-black">HIGH FIDELITY</div>
           </div>
           <button 
            onClick={exportToCSV}
            className="bg-zinc-100 hover:bg-white text-black px-8 py-3 rounded-sm text-[11px] flex items-center gap-3 uppercase tracking-widest transition-all font-black shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
          >
            <i className="fas fa-file-export"></i> Export Intelligence
          </button>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-sm bg-zinc-900/30 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-black/50 text-zinc-500 uppercase tracking-widest font-black">
                <th className="px-6 py-5">Entity ID</th>
                <th className="px-6 py-5">Lead Profile</th>
                <th className="px-6 py-5">Strategic Analysis</th>
                <th className="px-6 py-5">Contact Node</th>
                <th className="px-6 py-5">Direct Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {businesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-6 py-6 align-top">
                    <span className="font-mono text-zinc-600 font-bold tracking-tighter">#{biz.id}</span>
                  </td>
                  <td className="px-6 py-6 align-top w-1/4">
                    <div className="font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm leading-tight">{biz.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-2 font-medium leading-tight">{biz.address}</div>
                  </td>
                  <td className="px-6 py-6 align-top max-w-xs leading-relaxed text-zinc-400 font-light italic">
                    {biz.description}
                  </td>
                  <td className="px-6 py-6 align-top">
                     <div className="space-y-3">
                       <div className="flex items-center gap-3 text-zinc-300">
                         <i className="fas fa-phone-square-alt text-blue-500/50 text-sm"></i>
                         <span className="font-mono">{biz.phone}</span>
                       </div>
                       <div className="flex items-center gap-3 text-zinc-600 text-[10px]">
                         <i className="fas fa-shield-check text-green-500/30"></i>
                         <span className="uppercase tracking-widest">Verified Map Node</span>
                       </div>
                     </div>
                  </td>
                  <td className="px-6 py-6 align-top">
                    <div className="flex flex-col gap-2">
                      {biz.website !== 'N/A' && (
                        <a href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`} target="_blank" rel="noreferrer" 
                           className="text-white hover:bg-blue-600 transition-all flex items-center justify-center gap-2 font-black border border-zinc-700 hover:border-blue-500 px-3 py-2 rounded-sm bg-zinc-950 text-[9px] uppercase tracking-widest">
                          Visit Site
                        </a>
                      )}
                      {biz.sourceUrl && (
                        <a href={biz.sourceUrl} target="_blank" rel="noreferrer" 
                           className="text-zinc-500 hover:text-white transition-all flex items-center justify-center gap-2 font-black border border-zinc-800 hover:border-zinc-500 px-3 py-2 rounded-sm text-[9px] uppercase tracking-widest">
                          Map View
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center opacity-30">
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-zinc-500 to-transparent"></div>
        <i className="fas fa-crosshairs mx-4 text-xs"></i>
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-zinc-500 to-transparent"></div>
      </div>
    </div>
  );
};
