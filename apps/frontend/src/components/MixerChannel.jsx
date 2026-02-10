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

    const vuLevel = muted ? 0 : Math.random() * 60 + 20;
    const vuLevel2 = muted ? 0 : Math.random() * 50 + 25;

    return (
        <div className="flex flex-col items-center bg-white/[0.02] rounded-xl p-3.5 border border-white/[0.06] w-24 min-w-[96px]">
            {/* Track name */}
            <input
                type="text"
                value={name}
                onChange={(e) => onNameChange?.(id, e.target.value)}
                className="w-full text-center text-[11px] text-white bg-transparent border-b border-white/[0.08]
                   focus:border-violet-500/50 outline-none mb-2.5 truncate font-medium"
                style={{ color }}
            />

            {/* Stereo VU Meter */}
            <div className="flex gap-0.5 mb-2.5">
                {[vuLevel, vuLevel2].map((level, i) => (
                    <div key={i} className="relative w-2 h-28 bg-black/30 rounded-sm overflow-hidden">
                        <div
                            className="absolute bottom-0 w-full rounded-sm transition-all duration-75"
                            style={{
                                height: `${level}%`,
                                background: level > 85
                                    ? `linear-gradient(to top, ${color}, #f59e0b, #ef4444)`
                                    : `linear-gradient(to top, ${color}cc, ${color}66)`
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col justify-between py-0.5">
                            {[0, -6, -12, -24, -48].map((db) => (
                                <div key={db} className="h-px bg-white/[0.08]" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Volume fader */}
            <div className="relative w-full h-28 flex justify-center mb-2.5">
                <div className="relative w-1.5 h-full bg-white/[0.06] rounded-full">
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
                            background: `linear-gradient(to top, ${color}, ${color}88)`
                        }}
                    />
                    <div
                        className="absolute left-1/2 -translate-x-1/2 w-6 h-3 rounded-sm bg-gradient-to-b from-gray-100 to-gray-300 shadow-md transition-all"
                        style={{ bottom: `calc(${volume * 100}% - 6px)` }}
                    />
                </div>
            </div>

            {/* Volume display */}
            <div className="text-[10px] text-white/30 mb-2 font-mono">
                {volume === 0 ? '-∞' : `${Math.round(20 * Math.log10(volume))}dB`}
            </div>

            {/* Pan knob */}
            <div className="flex items-center gap-0.5 mb-2.5">
                <span className="text-[9px] text-white/20">L</span>
                <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={pan}
                    onChange={(e) => onPanChange?.(id, parseFloat(e.target.value))}
                    className="w-12 h-0.5 bg-white/10 rounded appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                     [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm"
                />
                <span className="text-[9px] text-white/20">R</span>
            </div>

            {/* Fade controls */}
            <div className="w-full space-y-1.5 mb-2.5">
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-white/25 w-4">FI</span>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={fadeIn}
                        onChange={(e) => onFadeChange?.(id, 'fadeIn', parseFloat(e.target.value))}
                        className="flex-1 h-0.5 bg-white/[0.06] rounded appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 
                         [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-fuchsia-400"
                    />
                    <span className="text-[9px] text-white/25 w-5 text-right font-mono">{fadeIn.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-white/25 w-4">FO</span>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={fadeOut}
                        onChange={(e) => onFadeChange?.(id, 'fadeOut', parseFloat(e.target.value))}
                        className="flex-1 h-0.5 bg-white/[0.06] rounded appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 
                         [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-amber-400"
                    />
                    <span className="text-[9px] text-white/25 w-5 text-right font-mono">{fadeOut.toFixed(1)}</span>
                </div>
            </div>

            {/* Mute / Solo buttons */}
            <div className="flex gap-1.5">
                <button
                    onClick={() => onMuteToggle?.(id)}
                    className={`w-8 h-6 rounded-md text-[10px] font-bold transition-all ${muted
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                        : "bg-white/[0.06] text-white/30 hover:bg-white/[0.1] hover:text-white/60"
                        }`}
                >
                    M
                </button>
                <button
                    onClick={() => onSoloToggle?.(id)}
                    className={`w-8 h-6 rounded-md text-[10px] font-bold transition-all ${solo
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                        : "bg-white/[0.06] text-white/30 hover:bg-white/[0.1] hover:text-white/60"
                        }`}
                >
                    S
                </button>
            </div>

            {/* Color indicator */}
            <div
                className="w-full h-1 rounded-full mt-2.5"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }}
            />
        </div>
    );
}
