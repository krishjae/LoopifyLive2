import { useState, useRef, useEffect, useMemo } from "react";
import UploadBox from "../components/UploadBox";
import PianoKeyboard from "../components/PianoKeyboard";
import GuitarFretboard from "../components/GuitarFretboard";
import ChordDisplay from "../components/ChordDisplay";
import ChordPractice from "../components/ChordPractice";
import DifficultySelector from "../components/DifficultySelector";
import { uploadAudio, getChords } from "../utils/api";
import { getChordsByDifficulty, CHORD_LIBRARY, getChordForDifficulty } from "../data/chordLibrary";

export default function Learning() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [chords, setChords] = useState(null);
  const [instrument, setInstrument] = useState("piano");
  const [difficulty, setDifficulty] = useState(2);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceScore, setPracticeScore] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  const currentChordIndex = chords?.timeline?.findIndex((c, i) => {
    const next = chords.timeline[i + 1];
    return currentTime >= c.startTime && (!next || currentTime < next.startTime);
  }) ?? 0;

  const currentChord = chords?.timeline?.[currentChordIndex];
  const availableChords = Object.keys(getChordsByDifficulty(difficulty));

  const adaptedChord = useMemo(() => {
    if (!currentChord?.chord) return null;
    return getChordForDifficulty(currentChord.chord, difficulty);
  }, [currentChord?.chord, difficulty]);

  async function handleFile(f) {
    setFile(f);
    setLoading(true);
    setAnalysis(null);
    setChords(null);
    setPracticeScore(null);
    setPracticeHistory([]);

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
    audioUrlRef.current = URL.createObjectURL(f);

    try {
      const result = await uploadAudio(f);
      setAnalysis(result.analysis);
      const chordData = await getChords(result.fileId);
      setChords(chordData);
    } catch (error) {
      console.error("Analysis error:", error);
    }

    setLoading(false);
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }

  function handleChordClick(chord, index) {
    if (audioRef.current && chords?.timeline?.[index]) {
      audioRef.current.currentTime = chords.timeline[index].startTime;
      setCurrentTime(chords.timeline[index].startTime);
    }
  }

  function handleScoreUpdate(result) {
    setPracticeHistory(prev => [...prev, result]);
  }

  function handlePracticeComplete() {
    const nextIndex = currentChordIndex + 1;
    if (chords?.timeline && nextIndex < chords.timeline.length) {
      if (audioRef.current) {
        audioRef.current.currentTime = chords.timeline[nextIndex].startTime;
        setCurrentTime(chords.timeline[nextIndex].startTime);
      }
    } else if (practiceHistory.length > 0) {
      const avgScore = Math.round(
        practiceHistory.reduce((sum, r) => sum + r.score, 0) / practiceHistory.length
      );
      const accuracy = Math.round(
        (practiceHistory.filter(r => r.match).length / practiceHistory.length) * 100
      );
      setPracticeScore({
        accuracy,
        timing: avgScore,
        overall: Math.round((accuracy + avgScore) / 2),
        grade: avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : 'D'
      });
    }
  }

  const targetChordName = currentChord?.chord && availableChords.includes(currentChord.chord)
    ? currentChord.chord
    : null;

  return (
    <main className="px-6 lg:px-10 pt-10 pb-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2.5 animate-pulse" />
          Interactive Learning Mode
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
          Learn Guitar & Piano{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300">
            Faster
          </span>
        </h1>
        <p className="text-white/40 text-base max-w-lg mx-auto">
          Upload a song to see chords, finger positions, and practice with real-time feedback.
        </p>
      </div>

      {/* Upload section */}
      {!file && (
        <div className="max-w-2xl mx-auto">
          <UploadBox onFile={handleFile} />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-violet-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white/40 text-sm">Analyzing audio and detecting chords...</p>
        </div>
      )}

      {/* Learning interface */}
      {!loading && chords && (
        <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
          {/* Audio player */}
          {audioUrlRef.current && (
            <audio
              ref={audioRef}
              src={audioUrlRef.current}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {/* Top controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 section-card p-4 rounded-2xl">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full glow-btn flex items-center justify-center"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div>
                <div className="text-white font-medium text-sm">{file?.name}</div>
                <div className="text-white/30 text-xs font-mono">
                  Key: {chords.key} • {analysis?.tempo || 120} BPM
                </div>
              </div>
            </div>

            {/* Instrument toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <button
                onClick={() => setInstrument("piano")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${instrument === "piano"
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
                  : "text-white/40 hover:text-white/70"
                  }`}
              >
                🎹 Piano
              </button>
              <button
                onClick={() => setInstrument("guitar")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${instrument === "guitar"
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
                  : "text-white/40 hover:text-white/70"
                  }`}
              >
                🎸 Guitar
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPracticeMode(!practiceMode);
                  setPracticeScore(null);
                  setPracticeHistory([]);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${practiceMode
                  ? 'bg-fuchsia-500/20 text-fuchsia-400 ring-1 ring-fuchsia-500/30'
                  : 'bg-white/[0.04] text-white/40 hover:text-white/70 border border-white/[0.06]'
                  }`}
              >
                {practiceMode ? '🎯 Practice ON' : '🎯 Practice'}
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setChords(null);
                  setAnalysis(null);
                  setPracticeScore(null);
                  setPracticeMode(false);
                  setPracticeHistory([]);
                }}
                className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70 transition text-sm"
              >
                New Song
              </button>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column */}
            <div className="lg:col-span-1 space-y-5">
              <ChordDisplay
                chords={chords.timeline}
                currentTime={currentTime}
                onChordClick={handleChordClick}
              />
              <DifficultySelector
                value={difficulty}
                onChange={setDifficulty}
                showChords={true}
              />
            </div>

            {/* Right column - Instrument & Practice */}
            <div className="lg:col-span-2 space-y-5">
              {/* Simplified chord indicator */}
              {adaptedChord?.isSimplified && (
                <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">💡</span>
                    <span className="text-white/50 text-xs">
                      Simplified: <span className="font-semibold text-amber-300">{adaptedChord.original}</span>
                      {" → "}
                      <span className="font-semibold text-emerald-400">{adaptedChord.chord}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-white/25 font-mono">Level {difficulty}</span>
                </div>
              )}

              {instrument === "piano" ? (
                <PianoKeyboard
                  highlightedNotes={adaptedChord?.notes || currentChord?.notes || []}
                  scaleNotes={adaptedChord?.notes || []}
                  showScaleGuide={practiceMode}
                  octaves={2}
                  chordName={adaptedChord?.chord}
                  isSimplified={adaptedChord?.isSimplified}
                />
              ) : (
                <GuitarFretboard
                  highlightedNotes={adaptedChord?.notes || currentChord?.notes || []}
                  chord={adaptedChord?.chord || currentChord?.chord}
                  chordData={adaptedChord}
                  isSimplified={adaptedChord?.isSimplified}
                />
              )}

              {/* Practice section */}
              {practiceMode ? (
                <ChordPractice
                  targetChord={targetChordName}
                  difficulty={difficulty}
                  onScoreUpdate={handleScoreUpdate}
                  onPracticeComplete={handlePracticeComplete}
                />
              ) : (
                <div className="section-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white">Practice Mode</h3>
                    <button
                      onClick={() => setPracticeMode(true)}
                      className="px-5 py-2 rounded-lg glow-btn font-semibold text-sm"
                    >
                      <span>Start Practice</span>
                    </button>
                  </div>
                  <p className="text-white/30 text-sm leading-relaxed">
                    Enable practice mode to use your MIDI keyboard or microphone to play along.
                    The system will detect your chords and give you real-time feedback.
                  </p>
                </div>
              )}

              {/* Score display */}
              {practiceScore && (
                <div className="section-card rounded-2xl p-6 ring-1 ring-violet-500/20">
                  <h3 className="text-base font-semibold text-white mb-4">Practice Results</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-bold text-emerald-400 font-mono">{practiceScore.accuracy}%</div>
                      <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Accuracy</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-bold text-violet-400 font-mono">{practiceScore.timing}%</div>
                      <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Avg Score</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/[0.03]">
                      <div className="text-2xl font-bold text-white font-mono">{practiceScore.overall}%</div>
                      <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Overall</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        {practiceScore.grade}
                      </div>
                      <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Grade</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPracticeScore(null);
                      setPracticeHistory([]);
                      if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        setCurrentTime(0);
                      }
                    }}
                    className="mt-4 w-full py-2.5 rounded-xl bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition text-sm font-medium"
                  >
                    Practice Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
