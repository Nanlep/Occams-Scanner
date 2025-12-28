
import React from 'react';
import { Business } from '../types';

interface ResultsTableProps {
  businesses: Business[];
  isLoading: boolean;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ businesses, isLoading }) => {
  const exportToCSV = () => {
    if (businesses.length === 0) return;

    const headers = ["Name", "Address", "Phone", "Website", "Description", "Latitude", "Longitude", "Maps URL"];
    const rows = businesses.map(b => [
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

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `extraction_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-12 text-center relative h-64 border border-zinc-800 rounded flex flex-col items-center justify-center bg-zinc-900/10">
        <div className="scan-line"></div>
        <div className="animate-pulse text-green-500 text-3xl mb-4">
          <i className="fas fa-radar"></i>
        </div>
        <p className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] animate-pulse font-bold">Synchronizing with spatial grid... extracting telemetry</p>
      </div>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 animate-fadeIn pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-green-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Intelligence Report
          </h3>
          <p className="text-[10px] text-zinc-600 uppercase mt-1 tracking-tighter font-medium">Verified data from primary geographic sources</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-black px-6 py-2 rounded-sm text-[10px] flex items-center gap-2 border border-green-500/30 uppercase tracking-widest transition-all font-bold group shadow-lg"
        >
          <i className="fas fa-file-export group-hover:scale-110 transition-transform"></i> Commit to CSV
        </button>
      </div>

      <div className="relative border border-zinc-800 rounded-sm bg-black/40 backdrop-blur-sm overflow-hidden">
        {/* Mobile horizontal scroll indicator */}
        <div className="block lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/50 to-transparent pointer-events-none z-10"></div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-500 uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Entity Identity</th>
                <th className="px-6 py-4">Location Matrix</th>
                <th className="px-6 py-4">Communications</th>
                <th className="px-6 py-4">GPS (XY)</th>
                <th className="px-6 py-4">Digital Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {businesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-green-500/5 transition-all group">
                  <td className="px-6 py-4 align-top w-1/4">
                    <div className="font-bold text-zinc-200 group-hover:text-green-500 transition-colors uppercase tracking-tight">{biz.name}</div>
                    <div className="text-[9px] text-zinc-600 mt-2 leading-relaxed italic">{biz.description}</div>
                  </td>
                  <td className="px-6 py-4 align-top text-zinc-400 max-w-[200px] leading-tight font-mono text-[10px]">
                    {biz.address}
                  </td>
                  <td className="px-6 py-4 align-top">
                     <div className="flex flex-col gap-1 text-zinc-300">
                       <span className="flex items-center gap-2">
                         <i className="fas fa-phone-alt text-[9px] text-zinc-700"></i> {biz.phone}
                       </span>
                     </div>
                  </td>
                  <td className="px-6 py-4 align-top font-mono text-zinc-500 text-[9px]">
                    <div className="flex flex-col gap-0.5">
                      <span><span className="text-zinc-700 mr-2">LAT:</span>{biz.latitude.toFixed(6)}</span>
                      <span><span className="text-zinc-700 mr-2">LNG:</span>{biz.longitude.toFixed(6)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-3">
                      {biz.website !== 'N/A' && (
                        <a href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`} target="_blank" rel="noreferrer" 
                           className="text-zinc-500 hover:text-green-500 transition-colors flex items-center gap-1.5 font-bold border border-zinc-800 hover:border-green-500/50 px-2 py-1 rounded-sm w-fit">
                          <i className="fas fa-globe text-[9px]"></i> WEB_PORTAL
                        </a>
                      )}
                      {biz.sourceUrl && (
                        <a href={biz.sourceUrl} target="_blank" rel="noreferrer" 
                           className="text-zinc-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 font-bold border border-zinc-800 hover:border-blue-500/50 px-2 py-1 rounded-sm w-fit">
                          <i className="fas fa-map-marker-alt text-[9px]"></i> MAP_NODE
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
      
      <div className="mt-4 text-center">
        <p className="text-[9px] text-zinc-600 uppercase tracking-widest italic">-- End of Extracted Sector Block --</p>
      </div>
    </div>
  );
};
