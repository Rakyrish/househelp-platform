import { useState } from 'react';

interface DocProps {
  url: string | null;
  title: string;
  type: string;
}

const DocumentPreview = ({ url, title, type }: DocProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 1. Safety check for missing data
  if (!url) {
    return (
      <div className="flex flex-col h-full bg-[#030712] rounded-2xl border border-white/5 items-center justify-center p-10">
        <div className="text-4xl mb-4 opacity-20">📄</div>
        <p className="text-slate-500 text-sm font-mono">No document uploaded</p>
      </div>
    );
  }

  // 2. Identify file type safely
  const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="flex flex-col h-full bg-[#030712] rounded-2xl border border-white/5 overflow-hidden">
      {/* TOOLBAR */}
      <div className="p-4 bg-white/[0.03] border-b border-white/5 flex justify-between items-center z-10">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h4>
          <p className="text-[10px] text-slate-500 italic">{type}</p>
        </div>

        <div className="flex gap-2">
          {/* Rotate Button */}
          <button
            onClick={handleRotate}
            className="px-3 py-1.5 bg-black/40 rounded-lg border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-[10px] font-bold flex items-center gap-2"
          >
            <span>Rotate</span> 🔄
          </button>

          {/* Zoom Controls */}
          <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}
              className="px-3 py-1 text-slate-400 hover:text-white transition-colors font-bold"
            >
              −
            </button>
            <span className="px-2 text-[10px] self-center text-slate-500 font-mono w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
              className="px-3 py-1 text-slate-400 hover:text-white transition-colors font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="flex-1 overflow-auto p-12 flex justify-center items-center bg-black/40 relative custom-scrollbar">
        <div
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="shadow-2xl"
        >
          {isImage ? (
            /* Using <img> tag prevents the Firefox "X-Frame-Options" security error */
            <img
              src={url}
              alt={title}
              className="max-w-[500px] h-auto rounded-sm border border-white/10 bg-white"
            />
          ) : (
            /* Fallback for PDFs - Note: Iframes are still subject to X-Frame-Options */
            <iframe
              src={url}
              className="w-[600px] h-[800px] rounded shadow-2xl bg-white"
              title={title}
            />
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
        <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">
          Secure Identity Verification Module
        </p>
      </div>
    </div>
  );
};

export default DocumentPreview;