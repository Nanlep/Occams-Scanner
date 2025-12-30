
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

    const headers = ["ID", "Name", "Address", "Phone", "Email", "Social ID", "Channel", "Website", "Market Analysis", "Source URL"];
    const rows = businesses.map(b => [
      b.id,
      `"${b.name}"`,
      `"${b.address}"`,
      `"${b.phone}"`,
      `"${b.email}"`,
      `"${b.socialId}"`,
      `"${b.channel}"`,
      `"${b.website}"`,
      `"${b.description.replace(/"/g, '""')}"`,
      `"${b.sourceUrl || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const fileName = `OM_DATASET_${new Date().getTime()}.csv`;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateLeadScore = (biz: Business) => {
    let score = 50;
    if (biz.email !== 'N/A') score += 15;
    if (biz.socialId !== 'N/A') score += 15;
    if (biz.phone !== 'N/A') score += 10;
    if (biz.website !== 'N/A') score += 10;
    return Math.min(score, 100);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-20 text-center relative border border-zinc-900 rounded bg-zinc-950/20 overflow-hidden shadow-inner">
        <div className="scan-line"></div>
        <div className="space-y-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-[6px] border-blue-500/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-[6px] border-t-blue-500 rounded-full animate-spin"></div>
            <i className="fas fa-microchip absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 text-3xl"></i>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xl">Boolean Deep Scan Engaged</h4>
            <p className="text-zinc-600 text-[10px] uppercase tracking-[0.5em] mt-3">Synthesizing Maps, Search, and Social Signal layers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 animate-fadeIn pb-40">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-l-4 border-blue-600 pl-8">
        <div>
          <h3 className="text-white font-black uppercase tracking-tighter text-3xl italic">LEAD <span className="text-blue-500">MANIFEST</span></h3>
          <p className="text-[10px] text-zinc-600 uppercase tracking-[0.5em] mt-2 font-black">{businesses.length} Deep-Web Records Identified</p>
        </div>
        <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-sm text-[11px] uppercase tracking-widest font-black shadow-xl">
          Export Matrix Dataset (.CSV)
        </button>
      </div>

      <div className="border border-zinc-900 rounded-sm bg-zinc-950/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-zinc-900 bg-black/80 text-zinc-600 uppercase tracking-widest font-black">
                <th className="px-6 py-6">Fidelity</th>
                <th className="px-6 py-6">Identity</th>
                <th className="px-6 py-6">Email / Social</th>
                <th className="px-6 py-6">Market Intel</th>
                <th className="px-6 py-6">Channel</th>
                <th className="px-6 py-6">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {businesses.map((biz) => {
                const score = calculateLeadScore(biz);
                return (
                  <tr key={biz.id} className="hover:bg-blue-600/[0.03] transition-colors group">
                    <td className="px-6 py-8 align-top">
                      <div className="flex flex-col items-center">
                        <span className={`text-[12px] font-black ${score > 80 ? 'text-green-500' : 'text-blue-500'}`}>{score}%</span>
                        <div className="w-8 h-1 bg-zinc-900 mt-2 rounded-full overflow-hidden">
                          <div className={`h-full ${score > 80 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${score}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-8 align-top">
                      <div className="font-black text-white uppercase tracking-tight text-sm mb-1">{biz.name}</div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-tighter">{biz.address}</div>
                    </td>
                    <td className="px-6 py-8 align-top space-y-2">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <i className="fas fa-envelope text-blue-500/50"></i>
                        <span className="font-mono">{biz.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <i className="fab fa-linkedin text-blue-500/50"></i>
                        <span className="font-mono">{biz.socialId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-8 align-top text-zinc-400 font-light italic text-[10px] max-w-xs">
                      {biz.description}
                    </td>
                    <td className="px-6 py-8 align-top">
                      <span className="bg-zinc-900 px-3 py-1 rounded text-[9px] font-black uppercase text-blue-400 border border-zinc-800 tracking-widest">
                        {biz.channel}
                      </span>
                    </td>
                    <td className="px-6 py-8 align-top flex flex-col gap-2">
                      <a href={biz.website} target="_blank" rel="noreferrer" className="text-center bg-black border border-zinc-800 px-3 py-1.5 rounded text-[9px] uppercase font-black hover:border-blue-500 transition-all">Site</a>
                      {biz.phone !== 'N/A' && <span className="text-center border border-zinc-900 px-3 py-1.5 rounded text-[9px] text-zinc-500 font-mono">{biz.phone}</span>}
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
