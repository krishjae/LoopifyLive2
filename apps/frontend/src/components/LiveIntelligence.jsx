import { useState, useMemo } from "react";
import { usePitchDetection, SCALES, getScaleNotes, isNoteInScale } from "../hooks/usePitchDetection";

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function LiveIntelligence({ onScaleChange, onDetectedNote }) {
    const [rootNote, setRootNote] = useState('C');
    const [scaleType, setScaleType] = useState('major');
    const [isExpanded, setIsExpanded] = useState(true);

    const {
        isListening,
        detectedNote,
        frequency,
        confidence,
        error,
        startListening,
        stopListening
    } = usePitchDetection();

    // Get scale notes
    const scaleNotes = useMemo(() => getScaleNotes(rootNote, scaleType), [rootNote, scaleType]);

    // Check if detected note is in scale
    const noteStatus = useMemo(() => {
        if (!detectedNote) return null;
        const inScale = isNoteInScale(detectedNote.name, rootNote, scaleType);
        return {
            inScale,
            note: detectedNote,
            message: inScale ? 'Safe note!' : 'Outside scale'
        };
    }, [detectedNote, rootNote, scaleType]);

    // Notify parent of changes
    useMemo(() => {
        onScaleChange?.({ rootNote, scaleType, scaleNotes });
    }, [rootNote, scaleType, scaleNotes]);

    useMemo(() => {
        onDetectedNote?.(detectedNote);
    }, [detectedNote]);

    return (
        <div className="bg-surface/50 rounded-2xl border border-purple-500/10 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-fuchsia-400 animate-pulse' : 'bg-white/30'}`} />
                    <h3 className="text-lg font-semibold text-white">Live Intelligence</h3>
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">Advanced</span>
                </div>
                <svg
                    className={`w-5 h-5 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="px-6 pb-6 space-y-6">
                    {/* Pitch Detection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Microphone control */}
                        <div className="bg-black/20 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-white/70">Pitch Detection</span>
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${isListening
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30'
                                        }`}
                                >
                                    {isListening ? '⏹ Stop' : '🎤 Start'}
                                </button>
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Detected note display */}
                            <div className="flex items-center justify-center py-6">
                                {detectedNote ? (
                                    <div className="text-center">
                                        <div className={`text-6xl font-bold mb-2 ${noteStatus?.inScale ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {detectedNote.name}
                                            <span className="text-2xl text-white/40">{detectedNote.octave}</span>
                                        </div>
                                        <div className="text-white/50 text-sm">
                                            {frequency?.toFixed(1)} Hz
                                        </div>
                                        <div className={`text-sm mt-2 px-3 py-1 rounded-full inline-block ${noteStatus?.inScale
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {noteStatus?.message}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-white/30 text-center">
                                        <div className="text-4xl mb-2">🎵</div>
                                        <div className="text-sm">
                                            {isListening ? 'Listening for pitch...' : 'Click Start to begin'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pitch meter */}
                            {detectedNote && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-white/40">
                                        <span>Flat</span>
                                        <span>In Tune</span>
                                        <span>Sharp</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
                                        <div className="absolute inset-y-0 left-1/2 w-1 bg-green-400/50 -translate-x-1/2" />
                                        <div
                                            className={`absolute top-0 bottom-0 w-3 rounded-full transition-all ${Math.abs(detectedNote.cents) < 10 ? 'bg-green-400' : 'bg-amber-400'
                                                }`}
                                            style={{
                                                left: `calc(50% + ${detectedNote.cents}% - 6px)`,
                                            }}
                                        />
                                    </div>
                                    <div className="text-center text-xs text-white/50">
                                        {detectedNote.cents > 0 ? '+' : ''}{detectedNote.cents} cents
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scale Selection */}
                        <div className="bg-black/20 rounded-xl p-5">
                            <div className="text-sm text-white/70 mb-4">Scale Settings</div>

                            {/* Root note selector */}
                            <div className="mb-4">
                                <label className="block text-xs text-white/50 mb-2">Root Note</label>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {NOTE_NAMES.map(note => (
                                        <button
                                            key={note}
                                            onClick={() => setRootNote(note)}
                                            className={`py-2 rounded text-sm font-medium transition-all ${rootNote === note
                                                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/30'
                                                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                                                }`}
                                        >
                                            {note}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scale type selector */}
                            <div className="mb-4">
                                <label className="block text-xs text-white/50 mb-2">Scale Type</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {Object.entries(SCALES).map(([key, scale]) => (
                                        <button
                                            key={key}
                                            onClick={() => setScaleType(key)}
                                            className={`py-2 px-2 rounded text-xs font-medium transition-all truncate ${scaleType === key
                                                    ? 'bg-fuchsia-500/30 text-fuchsia-300 ring-1 ring-fuchsia-500/50'
                                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                }`}
                                        >
                                            {scale.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scale notes display */}
                            <div>
                                <label className="block text-xs text-white/50 mb-2">Safe Notes in {rootNote} {SCALES[scaleType].name}</label>
                                <div className="flex flex-wrap gap-2">
                                    {scaleNotes.map((note, i) => (
                                        <span
                                            key={note}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${i === 0
                                                    ? 'bg-amber-500/30 text-amber-300'
                                                    : 'bg-green-500/20 text-green-400'
                                                }`}
                                        >
                                            {note}
                                            {i === 0 && <span className="text-xs ml-1 opacity-60">(root)</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live feedback info */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 rounded-xl p-4 border border-purple-500/20">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">💡</div>
                            <div>
                                <div className="text-sm font-medium text-white mb-1">Pro Tip</div>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Enable pitch detection and select your scale. Notes highlighted in
                                    <span className="text-green-400 font-medium"> green </span>
                                    are safe to play. Notes in
                                    <span className="text-red-400 font-medium"> red </span>
                                    are outside your selected scale. Perfect for improvisation practice!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
