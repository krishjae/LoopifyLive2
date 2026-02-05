import { useState } from "react";
import { CHORD_LIBRARY } from "../data/chordLibrary";

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const STRINGS = ['E', 'B', 'G', 'D', 'A', 'E'];
const OPEN_STRING_NOTES = [4, 11, 7, 2, 9, 4];

export default function ChordTooltip({ chord, children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const chordData = CHORD_LIBRARY[chord];

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top
        });
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    if (!chordData) {
        return children;
    }

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {isVisible && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: position.x,
                        top: position.y - 10,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="bg-gray-900/95 backdrop-blur-lg border border-purple-500/30 rounded-xl p-4 shadow-2xl shadow-purple-500/20 min-w-[280px]">
                        {/* Header */}
                        <div className="text-center mb-3 pb-2 border-b border-white/10">
                            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                                {chord}
                            </div>
                            <div className="text-xs text-white/50 mt-1">
                                Notes: {chordData.notes.join(' - ')}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Guitar Diagram */}
                            <div>
                                <div className="text-xs text-white/50 mb-2 text-center">🎸 Guitar</div>
                                <GuitarMiniDiagram fingering={chordData.guitar?.fingering} />
                            </div>

                            {/* Piano Diagram */}
                            <div>
                                <div className="text-xs text-white/50 mb-2 text-center">🎹 Piano</div>
                                <PianoMiniDiagram notes={chordData.notes} />
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2">
                            <div className="w-4 h-4 bg-gray-900/95 border-r border-b border-purple-500/30 transform rotate-45" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Mini guitar fretboard diagram
function GuitarMiniDiagram({ fingering }) {
    if (!fingering) return <div className="text-white/30 text-xs text-center">N/A</div>;

    // Find the fret range to display
    const validFrets = fingering.filter(f => f >= 0);
    const minFret = Math.max(0, Math.min(...validFrets) - 1);
    const maxFret = Math.min(5, Math.max(...validFrets, minFret + 4));
    const fretCount = maxFret - minFret + 1;

    return (
        <div className="flex flex-col items-center">
            {/* Fret numbers */}
            <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: fretCount }, (_, i) => (
                    <div key={i} className="w-5 text-center text-[8px] text-white/40">
                        {minFret + i || 'O'}
                    </div>
                ))}
            </div>

            {/* Strings */}
            <div className="relative border border-white/20 rounded bg-amber-900/30">
                {STRINGS.map((string, stringIdx) => {
                    const fret = fingering[stringIdx];
                    const isMuted = fret === -1;
                    const displayFret = fret - minFret;

                    return (
                        <div key={stringIdx} className="flex items-center h-4 border-b border-white/10 last:border-b-0">
                            {/* String name */}
                            <div className="w-4 text-[8px] text-white/40 text-center">
                                {isMuted ? 'x' : string}
                            </div>

                            {/* Frets */}
                            {Array.from({ length: fretCount }, (_, fretIdx) => (
                                <div
                                    key={fretIdx}
                                    className="w-5 h-4 border-r border-white/10 last:border-r-0 flex items-center justify-center relative"
                                >
                                    {/* Fret wire */}
                                    <div className="absolute inset-y-0 right-0 w-px bg-white/20" />

                                    {/* Finger position */}
                                    {displayFret === fretIdx && fret >= 0 && (
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 shadow-lg shadow-purple-500/50" />
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Mini piano keyboard diagram
function PianoMiniDiagram({ notes }) {
    const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const BLACK_KEYS = { 'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5 };

    const normalizedNotes = notes.map(n => n.replace(/[0-9]/g, '').toUpperCase());

    const isHighlighted = (note) => {
        // Handle enharmonic equivalents
        const equivalents = {
            'C#': ['Db'], 'D#': ['Eb'], 'F#': ['Gb'], 'G#': ['Ab'], 'A#': ['Bb'],
            'Db': ['C#'], 'Eb': ['D#'], 'Gb': ['F#'], 'Ab': ['G#'], 'Bb': ['A#']
        };

        if (normalizedNotes.includes(note)) return true;
        if (equivalents[note]?.some(eq => normalizedNotes.includes(eq))) return true;
        return false;
    };

    return (
        <div className="flex justify-center">
            <div className="relative">
                {/* White keys */}
                <div className="flex">
                    {WHITE_KEYS.map(key => (
                        <div
                            key={key}
                            className={`w-5 h-12 border border-white/20 flex items-end justify-center pb-0.5 text-[8px] transition-all ${isHighlighted(key)
                                    ? 'bg-gradient-to-b from-purple-400 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/50'
                                    : 'bg-white/90 text-gray-600'
                                }`}
                        >
                            {key}
                        </div>
                    ))}
                </div>

                {/* Black keys */}
                <div className="absolute top-0 left-0 flex">
                    {WHITE_KEYS.map((key, i) => {
                        const blackKey = Object.entries(BLACK_KEYS).find(([_, idx]) => idx === i);
                        if (!blackKey) return <div key={i} className="w-5" />;

                        const [noteName] = blackKey;
                        return (
                            <div key={i} className="relative w-5">
                                <div
                                    className={`absolute -right-1.5 w-3 h-7 rounded-b z-10 flex items-end justify-center pb-0.5 text-[6px] ${isHighlighted(noteName)
                                            ? 'bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/50'
                                            : 'bg-gray-800'
                                        }`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
