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
                    <div className="glass-elevated rounded-2xl p-4 shadow-2xl min-w-[280px] border border-violet-500/15">
                        {/* Header */}
                        <div className="text-center mb-3 pb-2 border-b border-white/[0.06]">
                            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                                {chord}
                            </div>
                            <div className="text-[10px] text-white/35 mt-1 font-mono">
                                {chordData.notes.join(' — ')}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Guitar Diagram */}
                            <div>
                                <div className="text-[10px] text-white/35 mb-2 text-center uppercase tracking-wider">🎸 Guitar</div>
                                <GuitarMiniDiagram fingering={chordData.guitar?.fingering} />
                            </div>

                            {/* Piano Diagram */}
                            <div>
                                <div className="text-[10px] text-white/35 mb-2 text-center uppercase tracking-wider">🎹 Piano</div>
                                <PianoMiniDiagram notes={chordData.notes} />
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5">
                            <div className="w-3 h-3 glass-elevated border-r border-b border-violet-500/15 transform rotate-45" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function GuitarMiniDiagram({ fingering }) {
    if (!fingering) return <div className="text-white/20 text-[10px] text-center">N/A</div>;

    const validFrets = fingering.filter(f => f >= 0);
    const minFret = Math.max(0, Math.min(...validFrets) - 1);
    const maxFret = Math.min(5, Math.max(...validFrets, minFret + 4));
    const fretCount = maxFret - minFret + 1;

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: fretCount }, (_, i) => (
                    <div key={i} className="w-5 text-center text-[7px] text-white/25 font-mono">
                        {minFret + i || 'O'}
                    </div>
                ))}
            </div>

            <div className="relative border border-white/[0.08] rounded bg-amber-950/30">
                {STRINGS.map((string, stringIdx) => {
                    const fret = fingering[stringIdx];
                    const isMuted = fret === -1;
                    const displayFret = fret - minFret;

                    return (
                        <div key={stringIdx} className="flex items-center h-4 border-b border-white/[0.04] last:border-b-0">
                            <div className="w-4 text-[7px] text-white/25 text-center font-mono">
                                {isMuted ? 'x' : string}
                            </div>

                            {Array.from({ length: fretCount }, (_, fretIdx) => (
                                <div
                                    key={fretIdx}
                                    className="w-5 h-4 border-r border-white/[0.06] last:border-r-0 flex items-center justify-center relative"
                                >
                                    <div className="absolute inset-y-0 right-0 w-px bg-white/[0.08]" />
                                    {displayFret === fretIdx && fret >= 0 && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 shadow-sm shadow-violet-500/40" />
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

function PianoMiniDiagram({ notes }) {
    const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const BLACK_KEYS = { 'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5 };

    const normalizedNotes = notes.map(n => n.replace(/[0-9]/g, '').toUpperCase());

    const isHighlighted = (note) => {
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
                <div className="flex">
                    {WHITE_KEYS.map(key => (
                        <div
                            key={key}
                            className={`w-5 h-12 border border-white/10 rounded-b-sm flex items-end justify-center pb-0.5 text-[7px] transition-all ${isHighlighted(key)
                                ? 'bg-gradient-to-b from-violet-300 to-violet-500 text-white font-bold shadow-sm shadow-violet-500/30'
                                : 'bg-white/80 text-gray-500'
                                }`}
                        >
                            {key}
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 left-0 flex">
                    {WHITE_KEYS.map((key, i) => {
                        const blackKey = Object.entries(BLACK_KEYS).find(([_, idx]) => idx === i);
                        if (!blackKey) return <div key={i} className="w-5" />;

                        const [noteName] = blackKey;
                        return (
                            <div key={i} className="relative w-5">
                                <div
                                    className={`absolute -right-1.5 w-3 h-7 rounded-b z-10 ${isHighlighted(noteName)
                                        ? 'bg-gradient-to-b from-fuchsia-400 to-fuchsia-600 shadow-sm shadow-fuchsia-500/30'
                                        : 'bg-gray-700'
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
