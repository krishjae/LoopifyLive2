import { getChordsByDifficulty } from "../data/chordLibrary";

const LEVELS = [
    {
        level: 1,
        name: "Beginner",
        desc: "Simple open chords",
        color: "emerald"
    },
    {
        level: 2,
        name: "Intermediate",
        desc: "Major & minor chords",
        color: "violet"
    },
    {
        level: 3,
        name: "Advanced",
        desc: "7th chords & extensions",
        color: "fuchsia"
    },
    {
        level: 4,
        name: "Expert",
        desc: "Jazz chords & voicings",
        color: "amber"
    },
    {
        level: 5,
        name: "Master",
        desc: "All chord types",
        color: "rose"
    },
];

const colorMap = {
    emerald: { dot: "bg-emerald-400", ring: "ring-emerald-400/30", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    violet: { dot: "bg-violet-400", ring: "ring-violet-400/30", text: "text-violet-400", bg: "bg-violet-500/10" },
    fuchsia: { dot: "bg-fuchsia-400", ring: "ring-fuchsia-400/30", text: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
    amber: { dot: "bg-amber-400", ring: "ring-amber-400/30", text: "text-amber-400", bg: "bg-amber-500/10" },
    rose: { dot: "bg-rose-400", ring: "ring-rose-400/30", text: "text-rose-400", bg: "bg-rose-500/10" },
};

export default function DifficultySelector({ value, onChange, showChords = false }) {
    const available = showChords ? Object.keys(getChordsByDifficulty(value)) : [];

    return (
        <div className="section-card rounded-2xl p-5">
            <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">Difficulty</div>

            {/* Step progress */}
            <div className="relative flex items-center justify-between mb-6">
                {/* Line behind dots */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/[0.06]" />

                {LEVELS.map((lvl) => {
                    const c = colorMap[lvl.color];
                    const active = lvl.level === value;
                    const passed = lvl.level < value;

                    return (
                        <button
                            key={lvl.level}
                            onClick={() => onChange(lvl.level)}
                            className={`relative z-10 flex flex-col items-center gap-2 group`}
                        >
                            <div
                                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                  ${active
                                        ? `${c.dot} text-black ring-4 ${c.ring} scale-110`
                                        : passed
                                            ? `${c.bg} ${c.text} ring-1 ring-white/[0.06]`
                                            : "bg-white/[0.06] text-white/30 ring-1 ring-white/[0.04]"
                                    }
                `}
                            >
                                {lvl.level}
                            </div>
                            <span className={`text-[10px] font-medium transition-colors ${active ? c.text : "text-white/25 group-hover:text-white/40"}`}>
                                {lvl.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Description */}
            {LEVELS.map((lvl) =>
                lvl.level === value ? (
                    <p key={lvl.level} className="text-white/30 text-xs mb-3">{lvl.desc}</p>
                ) : null
            )}

            {/* Available chords */}
            {showChords && available.length > 0 && (
                <div>
                    <div className="text-white/20 text-[10px] uppercase tracking-wider mb-2">Available Chords</div>
                    <div className="flex flex-wrap gap-1.5">
                        {available.slice(0, 16).map((chord) => (
                            <span key={chord} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-white/35 border border-white/[0.06]">
                                {chord}
                            </span>
                        ))}
                        {available.length > 16 && (
                            <span className="text-[10px] text-white/20">+{available.length - 16}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
