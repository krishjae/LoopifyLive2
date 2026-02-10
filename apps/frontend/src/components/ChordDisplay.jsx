import { useEffect, useState, useRef } from "react";

export default function ChordDisplay({ chords, currentTime, onChordClick }) {
    const [activeChordIndex, setActiveChordIndex] = useState(0);
    const activeRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!chords?.length) return;
        const idx = chords.findIndex((c, i) => {
            const next = chords[i + 1];
            return currentTime >= c.startTime && (!next || currentTime < next.startTime);
        });
        if (idx !== -1 && idx !== activeChordIndex) {
            setActiveChordIndex(idx);
        }
    }, [currentTime, chords]);

    useEffect(() => {
        if (activeRef.current && scrollRef.current) {
            activeRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center"
            });
        }
    }, [activeChordIndex]);

    const totalDuration = chords?.length
        ? chords[chords.length - 1]?.startTime + 4
        : 1;

    return (
        <div className="section-card rounded-2xl p-5">
            {/* Now Playing */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Now Playing</span>
                </div>
                <span className="text-white/20 text-xs font-mono">{chords?.length || 0} chords</span>
            </div>

            {/* Current chord big display */}
            <div className="text-center py-5 mb-4">
                <div className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 mb-1">
                    {chords?.[activeChordIndex]?.chord || "—"}
                </div>
                <div className="text-[10px] font-mono text-white/25">
                    {chords?.[activeChordIndex] && `${chords[activeChordIndex].startTime.toFixed(1)}s`}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-white/[0.06] mb-4 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
            </div>

            {/* Chord pills timeline */}
            <div className="flex flex-wrap gap-1.5" ref={scrollRef}>
                {chords?.map((chord, idx) => (
                    <button
                        key={idx}
                        ref={idx === activeChordIndex ? activeRef : null}
                        onClick={() => onChordClick?.(chord, idx)}
                        className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-all duration-200 cursor-pointer
              ${idx === activeChordIndex
                                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
                                : idx < activeChordIndex
                                    ? "bg-white/[0.04] text-white/30"
                                    : "bg-white/[0.03] text-white/40 hover:bg-white/[0.06]"
                            }
            `}
                    >
                        <span className="text-[10px] opacity-50">{idx + 1}</span>
                        {chord.chord}
                    </button>
                ))}
            </div>
        </div>
    );
}
