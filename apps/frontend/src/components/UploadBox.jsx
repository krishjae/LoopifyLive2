import { useRef, useState } from "react";

export default function UploadBox({ onFile }) {
  const ref = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative rounded-2xl p-10 flex flex-col items-center justify-center gap-5 text-center
        border-2 border-dashed transition-all duration-300 cursor-pointer
        ${dragActive
          ? "border-violet-400/50 bg-violet-500/[0.06]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.03]"
        }
      `}
      onClick={() => ref.current.click()}
    >
      <input
        ref={ref}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragActive ? 'bg-violet-500/20 scale-110' : 'bg-white/[0.04]'}`}>
        <svg className={`w-6 h-6 transition-colors ${dragActive ? 'text-violet-400' : 'text-white/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      <div>
        <p className="text-white/60 text-sm mb-1.5">
          Drag & drop your audio file here, or <span className="text-violet-400 font-medium">browse</span>
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          {["MP3", "WAV", "FLAC"].map(ext => (
            <span key={ext} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-white/30 border border-white/[0.06]">
              {ext}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
