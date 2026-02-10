import { useState, useEffect, useCallback, useRef } from "react";
import { useChordDetection } from "../hooks/useChordDetection";
import { CHORD_LIBRARY, getChordsByDifficulty } from "../data/chordLibrary";

export default function ChordPractice({
    targetChord = null,
    difficulty = 3,
    onScoreUpdate,
    onPracticeComplete
}) {
    const {
        inputMode,
        isListening,
        activeNotes,
        detectedChord,
        midiInputs,
        selectedMidiInput,
        error,
        startListening,
        stopListening,
        switchInputMode,
        selectMidiInput,
        matchTargetChord,
        setDifficulty
    } = useChordDetection();

    const [matchResult, setMatchResult] = useState(null);
    const [practiceStats, setPracticeStats] = useState({
        attempts: 0,
        correct: 0,
        totalScore: 0
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const successTimeoutRef = useRef(null);

    useEffect(() => {
        setDifficulty(difficulty);
    }, [difficulty, setDifficulty]);

    useEffect(() => {
        if (targetChord && activeNotes.length >= 2) {
            const result = matchTargetChord(targetChord);
            setMatchResult(result);

            if (result.match && result.score >= 80) {
                setShowSuccess(true);
                setPracticeStats(prev => ({
                    attempts: prev.attempts + 1,
                    correct: prev.correct + 1,
                    totalScore: prev.totalScore + result.score
                }));
                onScoreUpdate?.(result);

                if (successTimeoutRef.current) {
                    clearTimeout(successTimeoutRef.current);
                }
                successTimeoutRef.current = setTimeout(() => {
                    setShowSuccess(false);
                    onPracticeComplete?.();
                }, 1500);
            }
        } else {
            setMatchResult(null);
        }
    }, [activeNotes, targetChord, matchTargetChord, onScoreUpdate, onPracticeComplete]);

    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    const targetChordData = targetChord ? CHORD_LIBRARY[targetChord] : null;

    return (
        <div className="section-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                    <h3 className="text-base font-semibold text-white">Chord Practice</h3>
                </div>

                {practiceStats.attempts > 0 && (
                    <div className="flex items-center gap-4 text-xs">
                        <div className="text-white/40">
                            <span className="text-emerald-400 font-bold font-mono">{practiceStats.correct}</span>
                            /{practiceStats.attempts} correct
                        </div>
                        <div className="text-white/40">
                            Avg: <span className="text-violet-400 font-bold font-mono">
                                {Math.round(practiceStats.totalScore / practiceStats.attempts)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 space-y-5">
                {/* Input Mode Selector */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                        <button
                            onClick={() => switchInputMode('midi')}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'midi'
                                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                                : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            🎹 MIDI
                        </button>
                        <button
                            onClick={() => switchInputMode('mic')}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'mic'
                                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                                : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            🎤 Microphone
                        </button>
                    </div>

                    {/* MIDI Device Selector */}
                    {inputMode === 'midi' && midiInputs.length > 0 && (
                        <select
                            value={selectedMidiInput?.id || ''}
                            onChange={(e) => {
                                const input = midiInputs.find(i => i.id === e.target.value);
                                if (input) selectMidiInput(input);
                            }}
                            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-violet-500/50"
                        >
                            {midiInputs.map(input => (
                                <option key={input.id} value={input.id} className="bg-bg-secondary">
                                    {input.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Start/Stop Button */}
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${isListening
                            ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20 hover:bg-rose-500/15'
                            : 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/15'
                            }`}
                    >
                        {isListening ? '⏹ Stop' : '▶ Start'}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-rose-500/[0.06] border border-rose-500/15 rounded-xl p-4 text-rose-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Main Practice Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Target Chord */}
                    <div className="bg-white/[0.02] rounded-xl p-6 text-center border border-white/[0.04]">
                        <div className="text-[10px] text-white/30 mb-3 uppercase tracking-wider font-medium">Target Chord</div>
                        {targetChord ? (
                            <>
                                <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-3">
                                    {targetChord}
                                </div>
                                {targetChordData && (
                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                        {targetChordData.notes.map(note => (
                                            <span
                                                key={note}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${activeNotes.some(n => n.replace(/[0-9]/g, '').toUpperCase() === note)
                                                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/25 shadow-lg shadow-emerald-500/20'
                                                    : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
                                                    }`}
                                            >
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-3xl text-white/15">—</div>
                        )}
                    </div>

                    {/* Detected/Played */}
                    <div className={`relative bg-white/[0.02] rounded-xl p-6 text-center border transition-all ${showSuccess ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-white/[0.04]'
                        }`}>
                        {/* Success overlay */}
                        {showSuccess && (
                            <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 rounded-xl z-10">
                                <div className="text-4xl">✓</div>
                            </div>
                        )}

                        <div className="text-[10px] text-white/30 mb-3 uppercase tracking-wider font-medium">Your Playing</div>
                        {detectedChord ? (
                            <>
                                <div className={`text-5xl font-display font-bold mb-2 ${matchResult?.match ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>
                                    {detectedChord.chord}
                                </div>
                                <div className="text-xs text-white/30 font-mono">
                                    {matchResult?.score || detectedChord.score}% match
                                </div>
                            </>
                        ) : activeNotes.length > 0 ? (
                            <div className="text-2xl text-white/20 py-2">...</div>
                        ) : (
                            <div className="text-3xl text-white/15 py-1">
                                {isListening ? '🎵' : '—'}
                            </div>
                        )}

                        {activeNotes.length > 0 && (
                            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
                                {activeNotes.map((note, i) => (
                                    <span
                                        key={`${note}-${i}`}
                                        className="px-2 py-1 rounded-lg bg-violet-500/15 text-violet-300 text-[10px] font-medium ring-1 ring-violet-500/10"
                                    >
                                        {note.replace(/[0-9]/g, '')}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Match Feedback */}
                {matchResult && targetChord && (
                    <div className={`rounded-xl p-4 ${matchResult.match
                        ? 'bg-emerald-500/[0.06] border border-emerald-500/15'
                        : 'bg-amber-500/[0.06] border border-amber-500/15'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`text-xl ${matchResult.match ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {matchResult.match ? '✓' : '⚠'}
                                </div>
                                <div>
                                    <div className={`font-medium text-sm ${matchResult.match ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {matchResult.match ? 'Perfect!' : `${matchResult.score}% Accuracy`}
                                    </div>
                                    {matchResult.missingNotes.length > 0 && (
                                        <div className="text-xs text-white/30 mt-0.5">
                                            Missing: {matchResult.missingNotes.join(', ')}
                                        </div>
                                    )}
                                    {matchResult.extraNotes.length > 0 && (
                                        <div className="text-xs text-white/30 mt-0.5">
                                            Extra: {matchResult.extraNotes.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold text-white font-mono">{matchResult.score}%</div>
                                <div className="text-[10px] text-white/25 uppercase tracking-wider">Score</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!isListening && (
                    <div className="text-center text-white/25 text-xs py-2">
                        {inputMode === 'midi' ? (
                            midiInputs.length === 0
                                ? 'Connect a MIDI device to get started'
                                : 'Click Start and play the target chord on your MIDI device'
                        ) : (
                            'Click Start and play the chord. Microphone will detect the notes.'
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
