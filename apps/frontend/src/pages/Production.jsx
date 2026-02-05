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
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full glass-surface text-white/70 text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-purple-400 mr-3 animate-pulse" />
          AI Music Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
          Music Production{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
            Insights
          </span>
        </h1>
        <p className="text-white/60 text-lg">
          Detect scale, raga, emotion, and genre from any uploaded song.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <UploadBox onFile={handleFile} />
        {file && (
          <p className="mt-4 text-white/60 text-sm text-center">
            Selected: <span className="text-white">{file.name}</span>
          </p>
        )}
      </div>

      {loading && (
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/60">Analyzing audio with AI...</p>
        </div>
      )}

      {result && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Main stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card title="Detected Scale">
              <div className="text-2xl">{result.scale}</div>
              {result.confidence?.scale && (
                <div className="text-xs text-white/50 mt-1">
                  {Math.round(result.confidence.scale * 100)}% confidence
                </div>
              )}
            </Card>
            <Card title="Detected Raga">
              <div className="text-2xl">{result.raga}</div>
              {result.confidence?.raga && (
                <div className="text-xs text-white/50 mt-1">
                  {Math.round(result.confidence.raga * 100)}% confidence
                </div>
              )}
            </Card>
            <Card title="Emotion">
              <div className="text-2xl">{result.emotion}</div>
              {result.confidence?.emotion && (
                <div className="text-xs text-white/50 mt-1">
                  {Math.round(result.confidence.emotion * 100)}% confidence
                </div>
              )}
            </Card>
            <Card title="Genre">
              <div className="text-2xl">{result.genre}</div>
              {result.confidence?.genre && (
                <div className="text-xs text-white/50 mt-1">
                  {Math.round(result.confidence.genre * 100)}% confidence
                </div>
              )}
            </Card>
          </div>

          {/* Tempo and Key */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl glass-surface p-6 text-center">
              <div className="text-white/60 text-sm mb-2">Tempo</div>
              <div className="text-5xl font-display font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                {result.tempo || 120}
              </div>
              <div className="text-white/50 text-sm mt-1">BPM</div>
            </div>
            <div className="rounded-2xl glass-surface p-6 text-center">
              <div className="text-white/60 text-sm mb-2">Key</div>
              <div className="text-5xl font-display font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                {result.key || "C"}
              </div>
              <div className="text-white/50 text-sm mt-1">Major</div>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="rounded-2xl glass-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center text-white text-sm">
                AI
              </div>
              <div className="text-white/80 font-medium">AI Explanation</div>
            </div>
            <div className="text-white/70 leading-relaxed">{result.explanation}</div>
          </div>

          {/* Upload new */}
          <div className="text-center">
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="px-6 py-3 rounded-full glass-surface text-white/70 hover:text-white transition"
            >
              Analyze Another Song
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
