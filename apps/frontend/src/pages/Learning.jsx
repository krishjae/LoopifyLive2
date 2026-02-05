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
  const [instrument, setInstrument] = useState("piano"); // piano | guitar
  const [difficulty, setDifficulty] = useState(2);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceScore, setPracticeScore] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Get current chord based on time
  const currentChordIndex = chords?.timeline?.findIndex((c, i) => {
    const next = chords.timeline[i + 1];
    return currentTime >= c.startTime && (!next || currentTime < next.startTime);
  }) ?? 0;

  const currentChord = chords?.timeline?.[currentChordIndex];

  // Get available chords for current difficulty
  const availableChords = Object.keys(getChordsByDifficulty(difficulty));

  // Adapt chord for current difficulty level
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

    // Create audio URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
    audioUrlRef.current = URL.createObjectURL(f);

    try {
      const result = await uploadAudio(f);
      setAnalysis(result.analysis);

      // Get chords
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
    // Move to next chord or calculate final score
    const nextIndex = currentChordIndex + 1;
    if (chords?.timeline && nextIndex < chords.timeline.length) {
      // Move to next chord
      if (audioRef.current) {
        audioRef.current.currentTime = chords.timeline[nextIndex].startTime;
        setCurrentTime(chords.timeline[nextIndex].startTime);
      }
    } else if (practiceHistory.length > 0) {
      // Calculate final score
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

  // Get the target chord name (filter to available chords at difficulty level)
  const targetChordName = currentChord?.chord && availableChords.includes(currentChord.chord)
    ? currentChord.chord
    : null;

  return (
    <main className="px-6 lg:px-10 pt-10 pb-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center px-4 py-2 rounded-full glass-surface text-white/70 text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-3 animate-pulse" />
          Interactive Learning Mode
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
          Learn Guitar & Piano{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400">
            Faster
          </span>
        </h1>
        <p className="text-white/60 text-lg">
          Upload a song to see chords, finger positions, and practice with real-time MIDI/mic feedback.
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
          <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/60">Analyzing audio and detecting chords...</p>
        </div>
      )}

      {/* Learning interface */}
      {!loading && chords && (
        <div className="max-w-7xl mx-auto space-y-6">
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full glow-btn flex items-center justify-center shadow-lg shadow-purple-500/30"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div>
                <div className="text-white font-medium">{file?.name}</div>
                <div className="text-white/50 text-sm">
                  Key: {chords.key} • {analysis?.tempo || 120} BPM
                </div>
              </div>
            </div>

            {/* Instrument toggle */}
            <div className="flex items-center gap-2 p-1 rounded-full bg-white/5">
              <button
                onClick={() => setInstrument("piano")}
                className={`px-6 py-2 rounded-full transition-all ${instrument === "piano"
                  ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                  : "text-white/60 hover:text-white"
                  }`}
              >
                🎹 Piano
              </button>
              <button
                onClick={() => setInstrument("guitar")}
                className={`px-6 py-2 rounded-full transition-all ${instrument === "guitar"
                  ? "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white"
                  : "text-white/60 hover:text-white"
                  }`}
              >
                🎸 Guitar
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Practice mode toggle */}
              <button
                onClick={() => {
                  setPracticeMode(!practiceMode);
                  setPracticeScore(null);
                  setPracticeHistory([]);
                }}
                className={`px-4 py-2 rounded-full font-medium transition-all ${practiceMode
                  ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30'
                  : 'glass-surface text-white/70 hover:text-white'
                  }`}
              >
                {practiceMode ? '🎯 Practice ON' : '🎯 Practice Mode'}
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
                className="px-4 py-2 rounded-full glass-surface text-white/70 hover:text-white transition"
              >
                Upload New Song
              </button>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Chord display */}
            <div className="lg:col-span-1 space-y-6">
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
            <div className="lg:col-span-2 space-y-6">
              {/* Simplified chord indicator */}
              {adaptedChord?.isSimplified && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">💡</span>
                    <span className="text-white/70 text-sm">
                      Simplified: <span className="font-bold text-amber-300">{adaptedChord.original}</span>
                      {" → "}
                      <span className="font-bold text-green-400">{adaptedChord.chord}</span>
                    </span>
                  </div>
                  <span className="text-xs text-white/40">Level {difficulty}</span>
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
                <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Practice Mode</h3>
                    <button
                      onClick={() => setPracticeMode(true)}
                      className="px-6 py-2 rounded-full glow-btn font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition"
                    >
                      Start Practice
                    </button>
                  </div>
                  <p className="text-white/50 text-sm">
                    Enable practice mode to use your MIDI keyboard or microphone to play along.
                    The system will detect your chords and give you real-time feedback.
                  </p>
                </div>
              )}

              {/* Score display */}
              {practiceScore && (
                <div className="bg-surface/50 rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Practice Results</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-3xl font-bold text-green-400">{practiceScore.accuracy}%</div>
                      <div className="text-xs text-white/50 mt-1">Accuracy</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-3xl font-bold text-purple-400">{practiceScore.timing}%</div>
                      <div className="text-xs text-white/50 mt-1">Avg Score</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-3xl font-bold text-white">{practiceScore.overall}%</div>
                      <div className="text-xs text-white/50 mt-1">Overall</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20">
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                        {practiceScore.grade}
                      </div>
                      <div className="text-xs text-white/50 mt-1">Grade</div>
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
                    className="mt-4 w-full py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition"
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
