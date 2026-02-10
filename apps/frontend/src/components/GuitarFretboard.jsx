import { useState } from "react";
import { CHORD_LIBRARY } from "../data/chordLibrary";

const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; // High to low
const FRETS = 15;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Open string notes (standard tuning, high to low)
const OPEN_STRING_NOTES = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E as indices

// Fallback chord fingerings
const CHORD_FINGERINGS = {
    'C': [[0, 1, 0, 2, 3, -1]],
    'D': [[2, 3, 2, 0, -1, -1]],
    'E': [[0, 0, 1, 2, 2, 0]],
    'F': [[1, 1, 2, 3, 3, 1]],
    'G': [[3, 0, 0, 0, 2, 3]],
    'A': [[0, 2, 2, 2, 0, -1]],
    'B': [[2, 4, 4, 4, 2, -1]],
    'Am': [[0, 1, 2, 2, 0, -1]],
    'Bm': [[2, 3, 4, 4, 2, -1]],
    'Cm': [[3, 4, 5, 5, 3, -1]],
    'Dm': [[1, 3, 2, 0, -1, -1]],
    'Em': [[0, 0, 0, 2, 2, 0]],
    'Fm': [[1, 1, 1, 3, 3, 1]],
    'Gm': [[3, 3, 3, 5, 5, 3]],
};

export default function GuitarFretboard({
    highlightedNotes = [],
    chord = null,
    chordData = null,
    isSimplified = false,
    showLabels = true,
    onNoteClick
}) {
    const [pressedFrets, setPressedFrets] = useState(new Set());

    const getChordFingering = () => {
        if (chordData?.guitar?.fingering) return chordData.guitar.fingering;
        if (chord && CHORD_LIBRARY[chord]?.guitar?.fingering) return CHORD_LIBRARY[chord].guitar.fingering;
        if (chord && CHORD_FINGERINGS[chord]?.[0]) return CHORD_FINGERINGS[chord][0];
        return null;
    };

    const chordFingering = getChordFingering();

    function getNoteAtPosition(stringIdx, fret) {
        const openNote = OPEN_STRING_NOTES[stringIdx];
        const noteIdx = (openNote + fret) % 12;
        return NOTE_NAMES[noteIdx];
    }

    function isHighlighted(note) {
        if (!note) return false;
        const normalized = note.replace(/[0-9]/g, '').toUpperCase();
        return highlightedNotes.some(n =>
            n.replace(/[0-9]/g, '').toUpperCase() === normalized
        );
    }

    function isChordPosition(stringIdx, fret) {
        if (!chordFingering) return false;
        return chordFingering[stringIdx] === fret;
    }

    function handleFretClick(stringIdx, fret) {
        const key = `${stringIdx}-${fret}`;
        setPressedFrets(prev => new Set([...prev, key]));
        const note = getNoteAtPosition(stringIdx, fret);
        onNoteClick?.(note, stringIdx, fret);
        setTimeout(() => {
            setPressedFrets(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, 200);
    }

    // String thickness classes (thin to thick)
    const stringThickness = ['h-px', 'h-px', 'h-px', 'h-[1.5px]', 'h-[2px]', 'h-[2.5px]'];
    const stringColors = [
        'bg-gray-300/60', 'bg-gray-300/60', 'bg-gray-300/60',
        'bg-amber-400/40', 'bg-amber-400/50', 'bg-amber-400/60'
    ];

    return (
        <div className="section-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-white">Guitar Fretboard</h3>
                    {isSimplified && (
                        <span className="text-[10px] text-amber-300/70 font-medium uppercase tracking-wider">(Simplified)</span>
                    )}
                </div>
                {chord && (
                    <div className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 ring-1 ring-violet-500/20 text-white font-bold text-base">
                        {chord}
                    </div>
                )}
            </div>

            {/* Fretboard */}
            <div className="relative overflow-x-auto rounded-xl">
                <div className="min-w-[800px]">
                    {/* Fret numbers */}
                    <div className="flex mb-2 pl-8">
                        {Array.from({ length: FRETS + 1 }, (_, i) => (
                            <div key={i} className="w-12 text-center text-[10px] text-white/25 font-mono">
                                {i === 0 ? '' : i}
                            </div>
                        ))}
                    </div>

                    {/* Strings */}
                    {STRINGS.map((stringName, stringIdx) => (
                        <div key={stringIdx} className="flex items-center">
                            {/* String name */}
                            <div className="w-8 text-right pr-2 text-xs font-medium text-white/40 font-mono">
                                {stringName}
                            </div>

                            {/* Frets */}
                            <div className="flex">
                                {Array.from({ length: FRETS + 1 }, (_, fret) => {
                                    const note = getNoteAtPosition(stringIdx, fret);
                                    const highlighted = isHighlighted(note);
                                    const isChord = isChordPosition(stringIdx, fret);
                                    const isMuted = chordFingering && chordFingering[stringIdx] === -1;
                                    const isOpen = fret === 0;
                                    const isPressed = pressedFrets.has(`${stringIdx}-${fret}`);

                                    const showMarker = stringIdx === 2 && [3, 5, 7, 9, 12, 15].includes(fret);
                                    const showDoubleMarker = stringIdx === 1 && fret === 12;

                                    return (
                                        <button
                                            key={fret}
                                            onClick={() => handleFretClick(stringIdx, fret)}
                                            className={`
                                                relative w-12 h-8 flex items-center justify-center
                                                transition-all duration-100 cursor-pointer
                                                ${isOpen
                                                    ? 'bg-bg-secondary border-r border-white/[0.08]'
                                                    : 'bg-gradient-to-b from-amber-950/40 to-amber-950/20 border-r border-white/[0.08]'
                                                }
                                                ${isPressed ? 'scale-95' : ''}
                                                hover:brightness-125
                                            `}
                                        >
                                            {/* String line */}
                                            <div className={`absolute ${stringThickness[stringIdx]} w-full ${stringColors[stringIdx]}`} />

                                            {/* Fret marker dots */}
                                            {showMarker && (
                                                <div className="absolute w-1.5 h-1.5 rounded-full bg-white/10" />
                                            )}
                                            {showDoubleMarker && (
                                                <>
                                                    <div className="absolute w-1.5 h-1.5 rounded-full bg-white/10 -translate-y-3" />
                                                    <div className="absolute w-1.5 h-1.5 rounded-full bg-white/10 translate-y-3" />
                                                </>
                                            )}

                                            {/* Note indicator */}
                                            {(highlighted || isChord) && !isMuted && (
                                                <div className={`
                                                    absolute w-5 h-5 rounded-full flex items-center justify-center z-10
                                                    transition-all duration-150
                                                    ${isChord
                                                        ? 'bg-gradient-to-br from-violet-400 to-fuchsia-500 shadow-lg shadow-violet-500/40'
                                                        : 'bg-violet-500/50 ring-1 ring-violet-400/30'
                                                    }
                                                    ${isPressed ? 'scale-90' : ''}
                                                `}>
                                                    {showLabels && (
                                                        <span className="text-[8px] font-bold text-white">
                                                            {note.replace('#', '♯')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Muted string indicator */}
                                            {isMuted && isOpen && (
                                                <div className="absolute w-5 h-5 flex items-center justify-center text-rose-400 text-xs font-bold z-10">
                                                    ✕
                                                </div>
                                            )}

                                            {/* Open string indicator */}
                                            {isChord && isOpen && !isMuted && chordFingering[stringIdx] === 0 && (
                                                <div className="absolute w-5 h-5 rounded-full border-2 border-emerald-400/50 z-10" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Fret position markers */}
                    <div className="flex pl-8 mt-1">
                        {Array.from({ length: FRETS + 1 }, (_, i) => (
                            <div key={i} className="w-12 flex justify-center">
                                {[3, 5, 7, 9, 12, 15].includes(i) && (
                                    <div className={`w-1.5 h-1.5 rounded-full ${i === 12 ? 'bg-white/25' : 'bg-white/10'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
