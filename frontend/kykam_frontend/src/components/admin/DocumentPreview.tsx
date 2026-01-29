import { useState } from 'react';

interface DocProps {
  url: string | null;
  title: string;
  type: string;
}

const DocumentPreview = ({ url, title, type }: DocProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!url) {
    return (
      <div className="flex flex-col h-full bg-[#030712] rounded-3xl border border-dashed border-white/10 items-center justify-center p-10">
        <div className="text-6xl mb-4 opacity-10">📄</div>
        <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">Document Not Provided</p>
      </div>
    );
  }

  const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);

  return (
    <div className="flex flex-col h-full bg-[#030712] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* TOOLBAR */}
      <div className="p-5 bg-white/[0.03] border-b border-white/5 flex justify-between items-center relative z-20">
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-tighter">{title}</h4>
          <p className="text-[10px] text-slate-500 font-mono m-0">{type}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="w-10 h-10 bg-black/40 rounded-xl border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 flex items-center justify-center transition-all"
          >
            🔄
          </button>

          <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="w-8 text-slate-400 hover:text-white">-</button>
            <span className="px-3 text-[10px] self-center text-slate-500 font-mono min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom(z => Math.min(z + 3, 3))} className="w-8 text-slate-400 hover:text-white">+</button>
          </div>
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="flex-1 overflow-auto p-12 flex justify-center items-center bg-[#020617] relative custom-scrollbar">
        <div
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="shadow-[0_0_100px_rgba(0,0,0,0.5)]"
        >
          {isImage ? (
            <img
              src={url}
              alt={title}
              className="max-w-[80vw] md:max-w-[500px] h-auto rounded-lg bg-white"
            />
          ) : (
            <iframe
              src={url}
              className="w-[700px] h-[900px] rounded-lg bg-white"
              title={title}
            />
          )}
        </div>
      </div>

      <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
        <p className="text-[9px] text-slate-700 uppercase font-black tracking-[0.2em] m-0">
          Kykam Internal Document Audit Layer
        </p>
      </div>
    </div>
  );
};

export default DocumentPreview;