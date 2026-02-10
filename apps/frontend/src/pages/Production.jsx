import { useState } from "react";
import UploadBox from "../components/UploadBox";
import Card from "../components/Card";
import { uploadAudio } from "../utils/api";

export default function Production() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleFile(f) {
    setFile(f);
    setLoading(true);
    setResult(null);

    try {
      const data = await uploadAudio(f);
      setResult(data.analysis);
    } catch (error) {
      console.error("Upload error:", error);
    }

    setLoading(false);
  }

  return (
    <main className="px-6 lg:px-10 pt-10 pb-20 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-2.5 animate-pulse" />
          AI Music Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
          Music Production{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            Insights
          </span>
        </h1>
        <p className="text-white/40 text-base max-w-lg mx-auto">
          Detect scale, raga, emotion, and genre from any uploaded song using advanced AI.
        </p>
      </div>

      {/* Upload */}
      <div className="max-w-3xl mx-auto">
        <UploadBox onFile={handleFile} />
        {file && (
          <p className="mt-4 text-white/40 text-xs text-center">
            Selected: <span className="text-white/70 font-medium">{file.name}</span>
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-violet-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white/40 text-sm">Analyzing audio with AI...</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="max-w-5xl mx-auto space-y-5 animate-slide-up">
          {/* Main stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card title="Scale" icon="🎼">
              <div className="text-xl">{result.scale}</div>
              {result.confidence?.scale && (
                <div className="text-[10px] text-white/30 mt-1 font-mono">
                  {Math.round(result.confidence.scale * 100)}% confidence
                </div>
              )}
            </Card>
            <Card title="Raga" icon="🪷">
              <div className="text-xl">{result.raga}</div>
              {result.confidence?.raga && (
                <div className="text-[10px] text-white/30 mt-1 font-mono">
                  {Math.round(result.confidence.raga * 100)}% confidence
                </div>
              )}
            </Card>
            <Card title="Emotion" icon="💫">
              <div className="text-xl">{result.emotion}</div>
              {result.confidence?.emotion && (
                <div className="text-[10px] text-white/30 mt-1 font-mono">
                  {Math.round(result.confidence.emotion * 100)}% confidence
                </div>
              )}
            </Card>
            <Card title="Genre" icon="🎶">
              <div className="text-xl">{result.genre}</div>
              {result.confidence?.genre && (
                <div className="text-[10px] text-white/30 mt-1 font-mono">
                  {Math.round(result.confidence.genre * 100)}% confidence
                </div>
              )}
            </Card>
          </div>

          {/* Tempo and Key */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl section-card p-8 text-center">
              <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Tempo</div>
              <div className="text-5xl font-display font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {result.tempo || 120}
              </div>
              <div className="text-white/30 text-xs mt-2">BPM</div>
            </div>
            <div className="rounded-2xl section-card p-8 text-center">
              <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Key</div>
              <div className="text-5xl font-display font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {result.key || "C"}
              </div>
              <div className="text-white/30 text-xs mt-2">Major</div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="rounded-2xl section-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-500/20">
                AI
              </div>
              <div>
                <div className="text-white/80 font-medium text-sm">AI Explanation</div>
                <div className="text-white/30 text-[10px]">Powered by neural analysis</div>
              </div>
            </div>
            <div className="text-white/50 text-sm leading-relaxed">{result.explanation}</div>
          </div>

          {/* Upload new */}
          <div className="text-center">
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="px-6 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all text-sm font-medium"
            >
              Analyze Another Song
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
