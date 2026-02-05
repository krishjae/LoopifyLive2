import { useState, useEffect } from "react";

export default function ChordDisplay({
    chords = [],
    currentTime = 0,
    onChordClick
}) {
    const [activeChordIndex, setActiveChordIndex] = useState(0);

    // Sync with audio playback time
    useEffect(() => {
        if (!chords.length) return;

        const idx = chords.findIndex((c, i) => {
            const next = chords[i + 1];
            return currentTime >= c.startTime && (!next || currentTime < next.startTime);
        });

        if (idx !== -1 && idx !== activeChordIndex) {
            setActiveChordIndex(idx);
        }
    }, [currentTime, chords]);

    if (!chords.length) {
        return (
            <div className="bg-surface/50 rounded-2xl p-6 border border-white/10 text-center text-white/50">
                Upload a song to detect chords
            </div>
        );
    }

    const activeChord = chords[activeChordIndex];

    return (
        <div className="bg-surface/50 rounded-2xl p-6 border border-white/10">
            {/* Current chord */}
            <div className="text-center mb-6">
                <div className="text-sm text-white/50 mb-2">Now Playing</div>
                <div className="text-7xl font-display font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                    {activeChord?.chord || '-'}
                </div>
                {activeChord?.notes && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                        {activeChord.notes.map((note, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm"
                            >
                                {note}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Chord progression timeline */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {chords.map((c, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setActiveChordIndex(i);
                            onChordClick?.(c, i);
                        }}
                        className={`
              flex-shrink-0 px-4 py-3 rounded-xl transition-all duration-200
              ${i === activeChordIndex
                                ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white scale-110 shadow-lg'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }
            `}
                    >
                        <div className="text-lg font-bold">{c.chord}</div>
                        <div className="text-xs opacity-60">{c.duration}s</div>
                    </button>
                ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-300"
                    style={{
                        width: `${(activeChordIndex / Math.max(chords.length - 1, 1)) * 100}%`
                    }}
                />
            </div>
        </div>
    );
}
