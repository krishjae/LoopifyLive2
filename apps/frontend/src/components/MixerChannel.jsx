export default function MixerChannel({
    track,
    onVolumeChange,
    onPanChange,
    onMuteToggle,
    onSoloToggle,
    onNameChange,
    onFadeChange
}) {
    const {
        id,
        name = "Track",
        volume = 0.8,
        pan = 0,
        muted = false,
        solo = false,
        color = "#8B5CF6",
        fadeIn = 0,
        fadeOut = 0
    } = track;

    // Simulate VU meter levels with more realistic behavior
    const vuLevel = muted ? 0 : Math.random() * 60 + 20;
    const vuLevel2 = muted ? 0 : Math.random() * 50 + 25;

    return (
        <div className="mixer-channel flex flex-col items-center bg-surface/50 rounded-xl p-4 border border-purple-500/10 w-28">
            {/* Track name */}
            <input
                type="text"
                value={name}
                onChange={(e) => onNameChange?.(id, e.target.value)}
                className="w-full text-center text-sm text-white bg-transparent border-b border-white/20 
                   focus:border-fuchsia-500 outline-none mb-3 truncate"
                style={{ color }}
            />

            {/* Stereo VU Meter */}
            <div className="flex gap-1 mb-3">
                {[vuLevel, vuLevel2].map((level, i) => (
                    <div key={i} className="relative w-2.5 h-32 bg-black/40 rounded-full overflow-hidden">
                        <div
                            className="absolute bottom-0 w-full rounded-full transition-all duration-75"
                            style={{
                                height: `${level}%`,
                                background: level > 85
                                    ? `linear-gradient(to top, ${color}, #f59e0b, #ef4444)`
                                    : `linear-gradient(to top, ${color}, ${color}99)`
                            }}
                        />
                        {/* Level markers */}
                        <div className="absolute inset-0 flex flex-col justify-between py-1">
                            {[0, -6, -12, -24, -48].map((db) => (
                                <div key={db} className="h-px bg-white/15" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Volume fader */}
            <div className="relative w-full h-36 flex justify-center mb-3">
                <div className="relative w-2 h-full bg-white/10 rounded-full">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange?.(id, parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ writingMode: "vertical-lr", direction: "rtl" }}
                    />
                    <div
                        className="absolute bottom-0 w-full rounded-full transition-all"
                        style={{
                            height: `${volume * 100}%`,
                            background: `linear-gradient(to top, ${color}, ${color}cc)`
                        }}
                    />
                    {/* Fader handle */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 w-7 h-4 rounded bg-gradient-to-b from-white to-gray-200 shadow-lg transition-all"
                        style={{ bottom: `calc(${volume * 100}% - 8px)` }}
                    />
                </div>
            </div>

            {/* Volume display */}
            <div className="text-xs text-white/50 mb-2 font-mono">
                {volume === 0 ? '-∞' : `${Math.round(20 * Math.log10(volume))}dB`}
            </div>

            {/* Pan knob */}
            <div className="flex items-center gap-1 mb-3">
                <span className="text-xs text-white/30">L</span>
                <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={pan}
                    onChange={(e) => onPanChange?.(id, parseFloat(e.target.value))}
                    className="w-14 h-1 bg-white/20 rounded appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                     [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
                />
                <span className="text-xs text-white/30">R</span>
            </div>

            {/* Fade controls */}
            <div className="w-full space-y-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-6">FI</span>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={fadeIn}
                        onChange={(e) => onFadeChange?.(id, 'fadeIn', parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-white/15 rounded appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                         [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-fuchsia-400"
                    />
                    <span className="text-xs text-white/40 w-6 text-right">{fadeIn.toFixed(1)}s</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-6">FO</span>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={fadeOut}
                        onChange={(e) => onFadeChange?.(id, 'fadeOut', parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-white/15 rounded appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                         [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-amber-400"
                    />
                    <span className="text-xs text-white/40 w-6 text-right">{fadeOut.toFixed(1)}s</span>
                </div>
            </div>

            {/* Mute / Solo buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onMuteToggle?.(id)}
                    className={`w-9 h-7 rounded text-xs font-bold transition-all ${muted
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                        : "bg-white/10 text-white/50 hover:bg-white/20"
                        }`}
                >
                    M
                </button>
                <button
                    onClick={() => onSoloToggle?.(id)}
                    className={`w-9 h-7 rounded text-xs font-bold transition-all ${solo
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                        : "bg-white/10 text-white/50 hover:bg-white/20"
                        }`}
                >
                    S
                </button>
            </div>

            {/* Color indicator */}
            <div
                className="w-full h-1.5 rounded-full mt-3"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
            />
        </div>
    );
}
