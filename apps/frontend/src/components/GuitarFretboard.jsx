import { useState } from "react";
import { CHORD_LIBRARY } from "../data/chordLibrary";

const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E']; // High to low
const FRETS = 15;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Open string notes (standard tuning, high to low)
const OPEN_STRING_NOTES = [4, 11, 7, 2, 9, 4]; // E, B, G, D, A, E as indices

// Fallback chord fingerings (used when chord not in library)
const CHORD_FINGERINGS = {
    'C': [[0, 1, 0, 2, 3, -1]], // x-3-2-0-1-0
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

    // Get fingering: prefer chordData from library, fallback to local definitions
    const getChordFingering = () => {
        if (chordData?.guitar?.fingering) {
            return chordData.guitar.fingering;
        }
        if (chord && CHORD_LIBRARY[chord]?.guitar?.fingering) {
            return CHORD_LIBRARY[chord].guitar.fingering;
        }
        if (chord && CHORD_FINGERINGS[chord]?.[0]) {
            return CHORD_FINGERINGS[chord][0];
        }
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

    return (
        <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Guitar Fretboard</h3>
                {chord && (
                    <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-green-500 text-white font-bold text-xl">
                        {chord}
                    </div>
                )}
            </div>

            {/* Fretboard */}
            <div className="relative overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Fret numbers */}
                    <div className="flex mb-2 pl-8">
                        {Array.from({ length: FRETS + 1 }, (_, i) => (
                            <div
                                key={i}
                                className="w-12 text-center text-xs text-white/40"
                            >
                                {i === 0 ? '' : i}
                            </div>
                        ))}
                    </div>

                    {/* Strings */}
                    {STRINGS.map((stringName, stringIdx) => (
                        <div key={stringIdx} className="flex items-center">
                            {/* String name */}
                            <div className="w-8 text-right pr-2 text-sm font-medium text-white/60">
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

                                    // Fret markers (dots)
                                    const showMarker = stringIdx === 2 && [3, 5, 7, 9, 12, 15].includes(fret);
                                    const showDoubleMarker = stringIdx === 1 && fret === 12;

                                    return (
                                        <button
                                            key={fret}
                                            onClick={() => handleFretClick(stringIdx, fret)}
                                            className={`
                        relative w-12 h-8 border-r border-white/20 flex items-center justify-center
                        transition-all duration-100
                        ${isOpen ? 'bg-surface' : 'bg-amber-900/30'}
                        ${isPressed ? 'scale-95' : ''}
                        hover:brightness-125
                      `}
                                        >
                                            {/* String line */}
                                            <div className={`absolute h-px w-full ${stringIdx < 3 ? 'bg-gray-400' : 'bg-amber-600'}`} />

                                            {/* Fret marker dots */}
                                            {showMarker && (
                                                <div className="absolute w-2 h-2 rounded-full bg-white/20" />
                                            )}
                                            {showDoubleMarker && (
                                                <>
                                                    <div className="absolute w-2 h-2 rounded-full bg-white/20 -translate-y-3" />
                                                    <div className="absolute w-2 h-2 rounded-full bg-white/20 translate-y-3" />
                                                </>
                                            )}

                                            {/* Note indicator */}
                                            {(highlighted || isChord) && !isMuted && (
                                                <div className={`
                          absolute w-6 h-6 rounded-full flex items-center justify-center
                          ${isChord
                                                        ? 'bg-gradient-to-br from-purple-500 to-green-500 shadow-lg shadow-purple-500/50'
                                                        : 'bg-purple-500/70'
                                                    }
                          ${isPressed ? 'scale-90' : ''}
                          z-10
                        `}>
                                                    {showLabels && (
                                                        <span className="text-xs font-bold text-white">
                                                            {note.replace('#', '♯')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Muted string indicator */}
                                            {isMuted && isOpen && (
                                                <div className="absolute w-6 h-6 flex items-center justify-center text-red-500 font-bold z-10">
                                                    ✕
                                                </div>
                                            )}

                                            {/* Open string indicator */}
                                            {isChord && isOpen && !isMuted && chordFingering[stringIdx] === 0 && (
                                                <div className="absolute w-6 h-6 rounded-full border-2 border-green-500 z-10" />
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
                                    <div className={`w-2 h-2 rounded-full ${i === 12 ? 'bg-white/40' : 'bg-white/20'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
