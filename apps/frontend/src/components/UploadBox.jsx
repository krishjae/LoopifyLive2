import { useRef } from "react";

export default function UploadBox({ onFile }) {
  const ref = useRef(null);

  return (
    <div className="rounded-3xl glass-surface p-10 flex flex-col items-center justify-center gap-4 text-center">
      <input
        ref={ref}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <p className="text-white/70 text-base">
        Upload any song (MP3 / WAV / FLAC) to unlock insights instantly.
      </p>
      <button
        onClick={() => ref.current.click()}
        className="px-7 py-3 rounded-full glow-btn font-semibold shadow-lg shadow-purple-500/20 hover:opacity-90 transition"
      >
        Upload Audio
      </button>
    </div>
  );
}
