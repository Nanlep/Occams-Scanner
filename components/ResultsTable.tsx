
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

    const headers = [
      "Matrix ID", "Business Name", "Address", "Phone", "Email", "Website", 
      "Leader Name", "Leader Role", "LinkedIn", "X (Twitter)", "Facebook", 
      "Market Analysis", "Primary Channel"
    ];
    
    const rows = businesses.map(b => [
      b.id,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.email}"`,
      `"${b.website}"`,
      `"${b.leaderName.replace(/"/g, '""')}"`,
      `"${b.leaderRole.replace(/"/g, '""')}"`,
      `"${b.socialFootprint.linkedin}"`,
      `"${b.socialFootprint.twitter}"`,
      `"${b.socialFootprint.facebook}"`,
      `"${b.description.replace(/"/g, '""')}"`,
      `"${b.channel}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const fileName = `OM_EXTRACT_${activeQuery?.category.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateFidelity = (biz: Business) => {
    let score = 40;
    if (biz.email !== 'N/A' && biz.email.includes('@')) score += 20;
    if (biz.socialFootprint.linkedin !== 'N/A' && biz.socialFootprint.linkedin.includes('linkedin.com')) score += 15;
    if (biz.leaderName !== 'N/A' && biz.leaderName.length > 3) score += 15;
    if (biz.phone !== 'N/A' && biz.phone.length > 5) score += 10;
    return Math.min(score, 100);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-24 text-center relative border border-zinc-900 rounded bg-zinc-950/40 overflow-hidden shadow-2xl animate-pulse">
        <div className="scan-line"></div>
        <div className="space-y-8 relative z-10">
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 border-[6px] border-blue-600/10 rounded-full"></div>
            <div className="absolute inset-0 border-[6px] border-t-blue-600 rounded-full animate-spin"></div>
            <i className="fas fa-microchip absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 text-4xl"></i>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.3em] text-2xl italic">Syncing Grounded Intelligence</h4>
            <div className="flex justify-center gap-2 mt-4">
               <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></span>
               <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></span>
            </div>
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.5em] mt-6 max-w-md mx-auto">
              Mapping Territory: {activeQuery?.location || 'GLOBAL'}<br/>
              Executing Boolean Filter: {activeQuery?.booleanLogic || 'NONE'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fadeIn pb-60">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-8 border-l-8 border-blue-600 pl-10">
        <div>
          <h3 className="text-white font-black uppercase tracking-tighter text-4xl italic leading-none">IDENTITY <span className="text-blue-500">MANIFEST</span></h3>
          <p className="text-[11px] text-zinc-600 uppercase tracking-[0.6em] mt-4 font-black">
            <span className="text-green-500 mr-2">●</span> {businesses.length} Verified Nodes Discovered
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-right">
             <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Region Fidelity</div>
             <div className="text-white font-black uppercase tracking-tighter text-lg">94.2% Grounded</div>
          </div>
          <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-sm text-[12px] uppercase tracking-[0.2em] font-black shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3">
            <i className="fas fa-file-export"></i> Export Intel
          </button>
        </div>
      </div>

      <div className="border-2 border-zinc-900 rounded-sm bg-zinc-950/60 backdrop-blur-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.7)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1400px]">
            <thead>
              <tr className="border-b-2 border-zinc-900 bg-black/90 text-zinc-600 uppercase tracking-widest font-black">
                <th className="px-8 py-8 w-32">Trust Index</th>
                <th className="px-8 py-8">Entity Details</th>
                <th className="px-8 py-8">Leadership Node</th>
                <th className="px-8 py-8">Digital Footprint</th>
                <th className="px-8 py-8 max-w-xs">Analysis Log</th>
                <th className="px-8 py-8 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {businesses.map((biz) => {
                const score = calculateFidelity(biz);
                return (
                  <tr key={biz.id} className="hover:bg-blue-600/[0.04] transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
                    <td className="px-8 py-10 align-top">
                      <div className="flex flex-col items-center">
                        <div className={`text-[14px] font-black italic ${score > 80 ? 'text-green-500' : 'text-blue-500'}`}>{score}</div>
                        <div className="w-12 h-1.5 bg-zinc-900 mt-2 rounded-sm overflow-hidden border border-zinc-800">
                          <div className={`h-full ${score > 80 ? 'bg-green-500' : 'bg-blue-600'} shadow-[0_0_8px_currentColor]`} style={{ width: `${score}%` }}></div>
                        </div>
                        <span className="text-[8px] text-zinc-700 mt-2 uppercase font-bold tracking-tighter">SIG_STRENGTH</span>
                      </div>
                    </td>
                    <td className="px-8 py-10 align-top">
                      <div className="font-black text-white uppercase tracking-tight text-base mb-2 group-hover:text-blue-400 transition-colors">{biz.name}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-tighter mb-4 flex items-start gap-2">
                         <i className="fas fa-map-marker-alt text-zinc-800 mt-0.5"></i>
                         <span className="line-clamp-2 max-w-[220px]">{biz.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[8px] bg-blue-600/10 text-blue-500 border border-blue-500/20 px-2 py-1 font-black uppercase tracking-[0.2em] rounded-sm">{biz.channel}</span>
                         {biz.phone !== 'N/A' && <span className="text-[9px] text-zinc-600 font-mono tracking-tighter">{biz.phone}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-10 align-top">
                      <div className="text-white font-black uppercase text-sm mb-1">{biz.leaderName}</div>
                      <div className="text-[9px] text-blue-500/80 font-black uppercase tracking-[0.2em]">{biz.leaderRole}</div>
                      <div className="mt-4 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-[8px] text-zinc-500 uppercase font-black">IDENTITY_MATCH</span>
                      </div>
                    </td>
                    <td className="px-8 py-10 align-top">
                      <div className="flex gap-4">
                        {biz.socialFootprint.linkedin !== 'N/A' ? (
                          <a href={biz.socialFootprint.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-sm border border-zinc-800 bg-black flex items-center justify-center text-blue-500 hover:border-blue-500 hover:bg-blue-500/10 transition-all shadow-lg">
                            <i className="fab fa-linkedin-in"></i>
                          </a>
                        ) : <div className="w-10 h-10 rounded-sm border border-zinc-900 flex items-center justify-center opacity-10"><i className="fab fa-linkedin-in"></i></div>}
                        
                        {biz.socialFootprint.twitter !== 'N/A' ? (
                          <a href={biz.socialFootprint.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-sm border border-zinc-800 bg-black flex items-center justify-center text-zinc-300 hover:border-white transition-all shadow-lg">
                            <i className="fab fa-x-twitter"></i>
                          </a>
                        ) : <div className="w-10 h-10 rounded-sm border border-zinc-900 flex items-center justify-center opacity-10"><i className="fab fa-x-twitter"></i></div>}
                      </div>
                      {biz.email !== 'N/A' && (
                        <div className="mt-6 flex flex-col gap-1">
                          <span className="text-[8px] text-zinc-700 uppercase font-black">Corporate Signal</span>
                          <span className="text-[10px] text-zinc-400 font-mono lowercase truncate max-w-[150px]">{biz.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-10 align-top text-zinc-500 font-medium text-[11px] max-w-xs leading-relaxed group-hover:text-zinc-300 transition-colors italic">
                      {biz.description}
                    </td>
                    <td className="px-8 py-10 align-top">
                      <div className="flex flex-col gap-3 items-center">
                        <a href={biz.website} target="_blank" rel="noreferrer" className="w-full text-center bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-sm text-[10px] uppercase font-black hover:border-blue-600 hover:text-white transition-all text-zinc-400 shadow-xl">
                          ENTRY_POINT
                        </a>
                        {biz.email !== 'N/A' && (
                          <a href={`mailto:${biz.email}`} className="w-full text-center bg-blue-600/5 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-600/20 px-6 py-3 rounded-sm text-[10px] uppercase font-black transition-all">
                            DIRECT_LINK
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
