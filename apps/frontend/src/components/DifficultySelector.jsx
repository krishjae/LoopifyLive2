import { getChordNamesForLevel } from "../data/chordLibrary";
import ChordTooltip from "./ChordTooltip";

const LEVELS = [
    {
        level: 1,
        name: "Beginner",
        desc: "Basic major chords",
        color: "from-green-400 to-green-600",
        chordTypes: "C, G, D, A, E"
    },
    {
        level: 2,
        name: "Easy",
        desc: "Major & minor chords",
        color: "from-teal-400 to-teal-600",
        chordTypes: "+ Am, Em, Dm, F"
    },
    {
        level: 3,
        name: "Medium",
        desc: "Adding 7th chords",
        color: "from-purple-400 to-purple-600",
        chordTypes: "+ G7, Am7, Cmaj7"
    },
    {
        level: 4,
        name: "Hard",
        desc: "Bar & suspended chords",
        color: "from-orange-400 to-orange-600",
        chordTypes: "+ sus2, sus4, add9"
    },
    {
        level: 5,
        name: "Expert",
        desc: "Jazz voicings",
        color: "from-red-400 to-red-600",
        chordTypes: "+ 9ths, 13ths, dim7"
    },
];

export default function DifficultySelector({ value = 1, onChange, showChords = true }) {
    const availableChords = getChordNamesForLevel(value);
    const allChordsUpToLevel = LEVELS
        .filter(l => l.level <= value)
        .flatMap(l => getChordNamesForLevel(l.level));

    return (
        <div className="bg-surface/50 rounded-2xl p-6 border border-purple-500/10">
            <h3 className="text-lg font-semibold text-white mb-4">Difficulty Level</h3>

            <div className="flex items-center gap-2">
                {LEVELS.map((lvl) => (
                    <button
                        key={lvl.level}
                        onClick={() => onChange?.(lvl.level)}
                        className={`
              flex-1 py-4 rounded-xl transition-all duration-200 relative overflow-hidden
              ${value === lvl.level
                                ? `bg-gradient-to-br ${lvl.color} text-white shadow-lg scale-105`
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }
            `}
                    >
                        <div className="relative z-10">
                            <div className="text-2xl font-bold">{lvl.level}</div>
                            <div className="text-xs mt-1 opacity-80">{lvl.name}</div>
                        </div>

                        {value === lvl.level && (
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        )}
                    </button>
                ))}
            </div>

            {/* Description */}
            <div className="mt-4 p-4 rounded-xl bg-white/5">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">
                        {LEVELS.find(l => l.level === value)?.name}
                    </div>
                    <div className="text-xs text-white/40">
                        {allChordsUpToLevel.length} chords available
                    </div>
                </div>
                <div className="text-white/60 text-sm">
                    {LEVELS.find(l => l.level === value)?.desc}
                </div>

                {showChords && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="text-xs text-white/40 mb-2">Chord types at this level:</div>
                        <div className="text-sm text-fuchsia-400">
                            {LEVELS.find(l => l.level === value)?.chordTypes}
                        </div>
                    </div>
                )}
            </div>

            {/* Chord preview */}
            {showChords && (
                <div className="mt-4">
                    <div className="text-xs text-white/40 mb-2">New chords at Level {value}:</div>
                    <div className="flex flex-wrap gap-1.5">
                        {availableChords.slice(0, 10).map(chord => (
                            <ChordTooltip key={chord} chord={chord}>
                                <span
                                    className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs font-medium hover:bg-purple-500/30 hover:text-purple-300 cursor-pointer transition-colors"
                                >
                                    {chord}
                                </span>
                            </ChordTooltip>
                        ))}
                        {availableChords.length > 10 && (
                            <span className="px-2 py-1 text-white/40 text-xs">
                                +{availableChords.length - 10} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
