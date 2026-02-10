import { useState } from "react";

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

const NOTE_TO_INDEX = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

export default function PianoKeyboard({
    highlightedNotes = [],
    scaleNotes = [],
    detectedNote = null,
    octaves = 2,
    onNoteClick,
    showLabels = true,
    showScaleGuide = false,
    chordName = null,
    isSimplified = false
}) {
    const [pressedKeys, setPressedKeys] = useState(new Set());

    const normalizedHighlights = highlightedNotes.map(n =>
        n.replace(/[0-9]/g, '').toUpperCase()
    );

    const normalizedScaleNotes = scaleNotes.map(n =>
        n.replace(/[0-9]/g, '').toUpperCase()
    );

    const detectedNoteName = detectedNote?.name?.toUpperCase();

    function isHighlighted(note) {
        return normalizedHighlights.includes(note.toUpperCase());
    }

    function isInScale(note) {
        return normalizedScaleNotes.includes(note.toUpperCase());
    }

    function isDetected(note) {
        return detectedNoteName === note.toUpperCase();
    }

    function handleKeyPress(note, octave) {
        const fullNote = `${note}${octave}`;
        setPressedKeys(prev => new Set([...prev, fullNote]));
        onNoteClick?.(fullNote);
        setTimeout(() => {
            setPressedKeys(prev => {
                const next = new Set(prev);
                next.delete(fullNote);
                return next;
            });
        }, 200);
    }

    function isPressed(note, octave) {
        return pressedKeys.has(`${note}${octave}`);
    }

    function getWhiteKeyStyle(note, octave) {
        const highlighted = isHighlighted(note);
        const inScale = isInScale(note);
        const detected = isDetected(note);
        const pressed = isPressed(note, octave);

        let baseClass = "relative w-12 h-36 rounded-b-lg border transition-all duration-150 flex flex-col items-center justify-end pb-2 cursor-pointer ";

        if (detected) {
            baseClass += "bg-gradient-to-b from-amber-200 to-amber-400 border-amber-300/50 shadow-lg shadow-amber-400/40 animate-glow-pulse ";
        } else if (highlighted) {
            baseClass += "bg-gradient-to-b from-violet-300 to-violet-500 border-violet-400/50 shadow-lg shadow-violet-500/40 ";
        } else if (showScaleGuide && inScale) {
            baseClass += "bg-gradient-to-b from-emerald-200 to-emerald-400 border-emerald-300/50 shadow-md shadow-emerald-400/30 ";
        } else if (showScaleGuide && !inScale && normalizedScaleNotes.length > 0) {
            baseClass += "bg-gradient-to-b from-rose-100 to-rose-200 border-rose-200/50 opacity-60 ";
        } else {
            baseClass += "bg-gradient-to-b from-white to-gray-50 border-gray-200/30 shadow-sm ";
        }

        if (pressed) {
            baseClass += "translate-y-0.5 shadow-none ";
        }

        baseClass += "hover:brightness-[0.97] active:translate-y-0.5 active:shadow-none";

        return baseClass;
    }

    function getBlackKeyStyle(note, octave) {
        const highlighted = isHighlighted(note);
        const inScale = isInScale(note);
        const detected = isDetected(note);
        const pressed = isPressed(note, octave);

        let baseClass = "absolute w-8 h-[5.5rem] rounded-b-md z-10 pointer-events-auto transition-all duration-150 flex items-end justify-center pb-1 cursor-pointer ";

        if (detected) {
            baseClass += "bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg shadow-amber-500/50 animate-glow-pulse ";
        } else if (highlighted) {
            baseClass += "bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 shadow-lg shadow-fuchsia-500/40 ";
        } else if (showScaleGuide && inScale) {
            baseClass += "bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-md shadow-emerald-500/30 ";
        } else if (showScaleGuide && !inScale && normalizedScaleNotes.length > 0) {
            baseClass += "bg-gradient-to-b from-rose-600 to-rose-800 opacity-60 ";
        } else {
            baseClass += "bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 shadow-md shadow-black/40 ";
        }

        if (pressed) {
            baseClass += "translate-y-0.5 shadow-none ";
        }

        baseClass += "hover:brightness-125 active:translate-y-0.5";

        return baseClass;
    }

    return (
        <div className="section-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-white">Piano Keyboard</h3>
                    {chordName && (
                        <div className={`px-3 py-1 rounded-lg font-bold text-sm ${isSimplified
                            ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20'
                            : 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20'
                            }`}>
                            {chordName}
                            {isSimplified && <span className="text-[10px] ml-1 opacity-60">(simplified)</span>}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {detectedNote && (
                        <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-lg ring-1 ring-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-300 font-medium text-xs font-mono">
                                {detectedNote.name}{detectedNote.octave}
                            </span>
                        </div>
                    )}
                    {highlightedNotes.length > 0 && (
                        <div className="flex gap-1">
                            {highlightedNotes.slice(0, 4).map(note => (
                                <span key={note} className="px-2 py-1 rounded bg-violet-500/15 text-violet-300 text-[10px] font-medium ring-1 ring-violet-500/10">
                                    {note}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Scale guide legend */}
            {showScaleGuide && normalizedScaleNotes.length > 0 && (
                <div className="flex items-center gap-4 mb-4 text-[10px]">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-emerald-400" />
                        <span className="text-white/40">Safe notes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded bg-rose-400" />
                        <span className="text-white/40">Avoid</span>
                    </div>
                    {detectedNote && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded bg-amber-400 animate-pulse" />
                            <span className="text-white/40">Detected</span>
                        </div>
                    )}
                </div>
            )}

            <div className="relative flex select-none overflow-x-auto pb-2">
                {Array.from({ length: octaves }, (_, octaveIdx) => (
                    <div key={octaveIdx} className="relative flex">
                        {/* White keys */}
                        {WHITE_KEYS.map((note, i) => {
                            return (
                                <button
                                    key={`${note}-${octaveIdx}`}
                                    onClick={() => handleKeyPress(note, octaveIdx + 4)}
                                    className={getWhiteKeyStyle(note, octaveIdx + 4)}
                                >
                                    {showLabels && (
                                        <span className={`text-[10px] font-medium ${isHighlighted(note) || isDetected(note) || (showScaleGuide && isInScale(note))
                                            ? 'text-white'
                                            : 'text-gray-500'
                                            }`}>
                                            {note}
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {/* Black keys */}
                        <div className="absolute top-0 left-0 flex pointer-events-none">
                            {BLACK_KEYS.map((note, i) => {
                                if (!note) return <div key={i} className="w-12" />;

                                const leftOffset = (i + 1) * 48 - 15;

                                return (
                                    <button
                                        key={`${note}-${octaveIdx}`}
                                        onClick={() => handleKeyPress(note, octaveIdx + 4)}
                                        style={{ left: `${leftOffset}px` }}
                                        className={getBlackKeyStyle(note, octaveIdx + 4)}
                                    >
                                        {showLabels && (
                                            <span className={`text-[9px] font-medium ${isHighlighted(note) || isDetected(note) || (showScaleGuide && isInScale(note))
                                                ? 'text-white'
                                                : 'text-gray-400'
                                                }`}>
                                                {note.replace('#', '♯')}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
