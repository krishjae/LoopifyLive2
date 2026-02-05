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

    // Normalize note names (remove octave numbers)
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

        // Remove after animation
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

        let baseClass = "relative w-12 h-36 rounded-b-lg border transition-all duration-100 flex flex-col items-center justify-end pb-2 ";

        if (detected) {
            baseClass += "bg-gradient-to-b from-amber-300 to-amber-500 border-amber-400 shadow-lg shadow-amber-500/50 animate-glow-pulse ";
        } else if (highlighted) {
            baseClass += "bg-gradient-to-b from-purple-400 to-purple-600 border-purple-400 shadow-lg shadow-purple-500/50 ";
        } else if (showScaleGuide && inScale) {
            baseClass += "bg-gradient-to-b from-green-300 to-green-400 border-green-400 shadow-md shadow-green-500/30 ";
        } else if (showScaleGuide && !inScale && normalizedScaleNotes.length > 0) {
            baseClass += "bg-gradient-to-b from-red-200 to-red-300 border-red-300 opacity-70 ";
        } else {
            baseClass += "bg-gradient-to-b from-white to-gray-100 border-white/20 ";
        }

        if (pressed) {
            baseClass += "translate-y-1 brightness-90 ";
        }

        baseClass += "hover:brightness-95 active:translate-y-1";

        return baseClass;
    }

    function getBlackKeyStyle(note, octave) {
        const highlighted = isHighlighted(note);
        const inScale = isInScale(note);
        const detected = isDetected(note);
        const pressed = isPressed(note, octave);

        let baseClass = "absolute w-8 h-24 rounded-b-md z-10 pointer-events-auto transition-all duration-100 flex items-end justify-center pb-1 ";

        if (detected) {
            baseClass += "bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg shadow-amber-500/50 animate-glow-pulse ";
        } else if (highlighted) {
            baseClass += "bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 shadow-lg shadow-fuchsia-500/50 ";
        } else if (showScaleGuide && inScale) {
            baseClass += "bg-gradient-to-b from-green-500 to-green-700 shadow-md shadow-green-500/30 ";
        } else if (showScaleGuide && !inScale && normalizedScaleNotes.length > 0) {
            baseClass += "bg-gradient-to-b from-red-600 to-red-800 opacity-70 ";
        } else {
            baseClass += "bg-gradient-to-b from-gray-800 to-black ";
        }

        if (pressed) {
            baseClass += "translate-y-1 brightness-90 ";
        }

        baseClass += "hover:brightness-110 active:translate-y-1";

        return baseClass;
    }

    return (
        <div className="bg-surface/50 rounded-2xl p-6 border border-purple-500/10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">Piano Keyboard</h3>
                    {chordName && (
                        <div className={`px-3 py-1 rounded-lg font-bold text-lg ${isSimplified
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                            {chordName}
                            {isSimplified && <span className="text-xs ml-1 opacity-70">(simplified)</span>}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {detectedNote && (
                        <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1.5 rounded-lg">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-300 font-medium text-sm">
                                {detectedNote.name}{detectedNote.octave}
                            </span>
                        </div>
                    )}
                    {highlightedNotes.length > 0 && (
                        <div className="flex gap-1.5">
                            {highlightedNotes.slice(0, 4).map(note => (
                                <span key={note} className="px-2 py-1 rounded bg-purple-500/30 text-purple-300 text-sm">
                                    {note}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Scale guide legend */}
            {showScaleGuide && normalizedScaleNotes.length > 0 && (
                <div className="flex items-center gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-green-400" />
                        <span className="text-white/60">Safe notes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-red-400" />
                        <span className="text-white/60">Avoid</span>
                    </div>
                    {detectedNote && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-amber-400 animate-pulse" />
                            <span className="text-white/60">Detected</span>
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
                                        <span className={`text-xs font-medium ${isHighlighted(note) || isDetected(note) || (showScaleGuide && isInScale(note))
                                            ? 'text-white'
                                            : 'text-gray-600'
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
                                            <span className={`text-xs font-medium ${isHighlighted(note) || isDetected(note) || (showScaleGuide && isInScale(note))
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
