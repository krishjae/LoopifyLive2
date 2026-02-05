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

    // Update difficulty in hook
    useEffect(() => {
        setDifficulty(difficulty);
    }, [difficulty, setDifficulty]);

    // Check chord match when target changes or notes change
    useEffect(() => {
        if (targetChord && activeNotes.length >= 2) {
            const result = matchTargetChord(targetChord);
            setMatchResult(result);

            // If chord matched correctly
            if (result.match && result.score >= 80) {
                setShowSuccess(true);
                setPracticeStats(prev => ({
                    attempts: prev.attempts + 1,
                    correct: prev.correct + 1,
                    totalScore: prev.totalScore + result.score
                }));
                onScoreUpdate?.(result);

                // Clear success after animation
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

    // Cleanup
    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    const targetChordData = targetChord ? CHORD_LIBRARY[targetChord] : null;

    return (
        <div className="bg-surface/50 rounded-2xl border border-purple-500/10 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                    <h3 className="text-lg font-semibold text-white">Chord Practice</h3>
                </div>

                {/* Stats display */}
                {practiceStats.attempts > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                        <div className="text-white/60">
                            <span className="text-green-400 font-bold">{practiceStats.correct}</span>
                            /{practiceStats.attempts} correct
                        </div>
                        <div className="text-white/60">
                            Avg: <span className="text-purple-400 font-bold">
                                {Math.round(practiceStats.totalScore / practiceStats.attempts)}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* Input Mode Selector */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full">
                        <button
                            onClick={() => switchInputMode('midi')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${inputMode === 'midi'
                                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                                    : 'text-white/60 hover:text-white'
                                }`}
                        >
                            🎹 MIDI
                        </button>
                        <button
                            onClick={() => switchInputMode('mic')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${inputMode === 'mic'
                                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                                    : 'text-white/60 hover:text-white'
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
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {midiInputs.map(input => (
                                <option key={input.id} value={input.id} className="bg-gray-900">
                                    {input.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Start/Stop Button */}
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${isListening
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                    >
                        {isListening ? '⏹ Stop' : '▶ Start'}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Main Practice Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Target Chord */}
                    <div className="bg-black/20 rounded-xl p-6 text-center">
                        <div className="text-sm text-white/50 mb-2">Target Chord</div>
                        {targetChord ? (
                            <>
                                <div className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                                    {targetChord}
                                </div>
                                {targetChordData && (
                                    <div className="flex items-center justify-center gap-2 mt-4">
                                        {targetChordData.notes.map(note => (
                                            <span
                                                key={note}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeNotes.some(n => n.replace(/[0-9]/g, '').toUpperCase() === note)
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                                                        : 'bg-white/10 text-white/60'
                                                    }`}
                                            >
                                                {note}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-4xl text-white/30">—</div>
                        )}
                    </div>

                    {/* Detected/Played */}
                    <div className={`relative bg-black/20 rounded-xl p-6 text-center transition-all ${showSuccess ? 'ring-4 ring-green-500/50 bg-green-500/10' : ''
                        }`}>
                        {/* Success overlay */}
                        {showSuccess && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl z-10">
                                <div className="text-4xl animate-bounce">✓</div>
                            </div>
                        )}

                        <div className="text-sm text-white/50 mb-2">Your Playing</div>
                        {detectedChord ? (
                            <>
                                <div className={`text-6xl font-display font-bold ${matchResult?.match ? 'text-green-400' : 'text-amber-400'
                                    }`}>
                                    {detectedChord.chord}
                                </div>
                                <div className="text-sm text-white/50 mt-2">
                                    {matchResult?.score || detectedChord.score}% match
                                </div>
                            </>
                        ) : activeNotes.length > 0 ? (
                            <div className="text-3xl text-white/40">...</div>
                        ) : (
                            <div className="text-4xl text-white/30">
                                {isListening ? '🎵' : '—'}
                            </div>
                        )}

                        {/* Active Notes */}
                        {activeNotes.length > 0 && (
                            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                                {activeNotes.map((note, i) => (
                                    <span
                                        key={`${note}-${i}`}
                                        className="px-3 py-1.5 rounded-lg bg-purple-500/30 text-purple-300 text-sm font-medium"
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
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-amber-500/10 border border-amber-500/20'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`text-2xl ${matchResult.match ? 'text-green-400' : 'text-amber-400'}`}>
                                    {matchResult.match ? '✓' : '⚠'}
                                </div>
                                <div>
                                    <div className={`font-medium ${matchResult.match ? 'text-green-400' : 'text-amber-400'}`}>
                                        {matchResult.match ? 'Perfect!' : `${matchResult.score}% Accuracy`}
                                    </div>
                                    {matchResult.missingNotes.length > 0 && (
                                        <div className="text-sm text-white/50">
                                            Missing: {matchResult.missingNotes.join(', ')}
                                        </div>
                                    )}
                                    {matchResult.extraNotes.length > 0 && (
                                        <div className="text-sm text-white/50">
                                            Extra: {matchResult.extraNotes.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">{matchResult.score}%</div>
                                <div className="text-xs text-white/50">Score</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!isListening && (
                    <div className="text-center text-white/40 text-sm">
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
