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

    const scaleNotes = useMemo(() => getScaleNotes(rootNote, scaleType), [rootNote, scaleType]);

    const noteStatus = useMemo(() => {
        if (!detectedNote) return null;
        const inScale = isNoteInScale(detectedNote.name, rootNote, scaleType);
        return {
            inScale,
            note: detectedNote,
            message: inScale ? 'Safe note!' : 'Outside scale'
        };
    }, [detectedNote, rootNote, scaleType]);

    useMemo(() => {
        onScaleChange?.({ rootNote, scaleType, scaleNotes });
    }, [rootNote, scaleType, scaleNotes]);

    useMemo(() => {
        onDetectedNote?.(detectedNote);
    }, [detectedNote]);

    return (
        <div className="section-card rounded-2xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-fuchsia-400 animate-pulse' : 'bg-white/20'}`} />
                    <h3 className="text-base font-semibold text-white">Live Intelligence</h3>
                    <span className="text-[10px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.04]">Advanced</span>
                </div>
                <svg
                    className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="px-5 pb-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pitch Detection */}
                        <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.04]">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Pitch Detection</span>
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`px-4 py-1.5 rounded-lg font-medium text-xs transition-all ${isListening
                                        ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20 hover:bg-rose-500/15'
                                        : 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 hover:bg-violet-500/15'
                                        }`}
                                >
                                    {isListening ? '⏹ Stop' : '🎤 Start'}
                                </button>
                            </div>

                            {error && (
                                <div className="text-rose-400 text-xs mb-4 bg-rose-500/[0.06] p-3 rounded-xl border border-rose-500/15">
                                    {error}
                                </div>
                            )}

                            {/* Detected note display */}
                            <div className="flex items-center justify-center py-6">
                                {detectedNote ? (
                                    <div className="text-center">
                                        <div className={`text-5xl font-bold font-display mb-2 ${noteStatus?.inScale ? 'text-emerald-400' : 'text-rose-400'
                                            }`}>
                                            {detectedNote.name}
                                            <span className="text-xl text-white/25">{detectedNote.octave}</span>
                                        </div>
                                        <div className="text-white/30 text-xs font-mono">
                                            {frequency?.toFixed(1)} Hz
                                        </div>
                                        <div className={`text-xs mt-2 px-3 py-1 rounded-lg inline-block ${noteStatus?.inScale
                                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                                            : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
                                            }`}>
                                            {noteStatus?.message}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-white/15 text-center">
                                        <div className="text-3xl mb-2">🎵</div>
                                        <div className="text-xs">
                                            {isListening ? 'Listening for pitch...' : 'Click Start to begin'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pitch meter */}
                            {detectedNote && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] text-white/25">
                                        <span>Flat</span>
                                        <span>In Tune</span>
                                        <span>Sharp</span>
                                    </div>
                                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden relative">
                                        <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-400/30 -translate-x-1/2" />
                                        <div
                                            className={`absolute top-0 bottom-0 w-2.5 rounded-full transition-all ${Math.abs(detectedNote.cents) < 10 ? 'bg-emerald-400' : 'bg-amber-400'
                                                }`}
                                            style={{
                                                left: `calc(50% + ${detectedNote.cents}% - 5px)`,
                                            }}
                                        />
                                    </div>
                                    <div className="text-center text-[10px] text-white/25 font-mono">
                                        {detectedNote.cents > 0 ? '+' : ''}{detectedNote.cents} cents
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scale Selection */}
                        <div className="bg-white/[0.02] rounded-xl p-5 border border-white/[0.04]">
                            <div className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Scale Settings</div>

                            <div className="mb-4">
                                <label className="block text-[10px] text-white/25 uppercase tracking-wider mb-2">Root Note</label>
                                <div className="grid grid-cols-6 gap-1">
                                    {NOTE_NAMES.map(note => (
                                        <button
                                            key={note}
                                            onClick={() => setRootNote(note)}
                                            className={`py-1.5 rounded-lg text-xs font-medium transition-all ${rootNote === note
                                                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/20'
                                                : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70 border border-white/[0.04]'
                                                }`}
                                        >
                                            {note}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-[10px] text-white/25 uppercase tracking-wider mb-2">Scale Type</label>
                                <div className="grid grid-cols-3 gap-1">
                                    {Object.entries(SCALES).map(([key, scale]) => (
                                        <button
                                            key={key}
                                            onClick={() => setScaleType(key)}
                                            className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all truncate ${scaleType === key
                                                ? 'bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-500/30'
                                                : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] border border-white/[0.04]'
                                                }`}
                                        >
                                            {scale.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-white/25 uppercase tracking-wider mb-2">
                                    Safe Notes in {rootNote} {SCALES[scaleType].name}
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {scaleNotes.map((note, i) => (
                                        <span
                                            key={note}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${i === 0
                                                ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/15'
                                                }`}
                                        >
                                            {note}
                                            {i === 0 && <span className="text-[9px] ml-1 opacity-50">(root)</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro tip */}
                    <div className="bg-gradient-to-r from-violet-500/[0.05] to-fuchsia-500/[0.05] rounded-xl p-4 border border-violet-500/10">
                        <div className="flex items-start gap-3">
                            <div className="text-lg">💡</div>
                            <div>
                                <div className="text-xs font-medium text-white/60 mb-1">Pro Tip</div>
                                <p className="text-[11px] text-white/35 leading-relaxed">
                                    Enable pitch detection and select your scale. Notes highlighted in
                                    <span className="text-emerald-400 font-medium"> green </span>
                                    are safe to play. Notes in
                                    <span className="text-rose-400 font-medium"> red </span>
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
