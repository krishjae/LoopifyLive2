import { useRef, useState, useEffect, useCallback } from "react";

export default function Timeline({
    tracks = [],
    currentTime = 0,
    duration = 60,
    isPlaying = false,
    onSeek,
    onTrackSelect,
    selectedTrackId,
    onRegionUpdate,
    onSplitRegion,
    waveformData = {}
}) {
    const timelineRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [activeTool, setActiveTool] = useState('select');
    const [dragging, setDragging] = useState(null);

    const pixelsPerSecond = 10 * zoom;
    const totalWidth = Math.max(duration * pixelsPerSecond, 800);

    function handleTimelineClick(e) {
        if (activeTool !== 'select') return;
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollLeft;
        const time = (x - 128) / pixelsPerSecond;
        onSeek?.(Math.max(0, Math.min(duration, time)));
    }

    function handleRegionClick(e, track, region) {
        e.stopPropagation();

        if (activeTool === 'cut') {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickTime = region.startTime + (clickX / pixelsPerSecond);
            onSplitRegion?.(track.id, region.id, clickTime);
        } else {
            onTrackSelect?.(track.id);
        }
    }

    function handleTrimStart(e, track, region, edge) {
        e.stopPropagation();
        setDragging({ type: 'trim', trackId: track.id, regionId: region.id, edge, startX: e.clientX, originalRegion: { ...region } });
    }

    function handleDragMove(e) {
        if (!dragging) return;

        if (dragging.type === 'trim') {
            const deltaX = e.clientX - dragging.startX;
            const deltaTime = deltaX / pixelsPerSecond;

            let newStart = dragging.originalRegion.startTime;
            let newDuration = dragging.originalRegion.duration;

            if (dragging.edge === 'left') {
                newStart = Math.max(0, dragging.originalRegion.startTime + deltaTime);
                newDuration = dragging.originalRegion.duration - deltaTime;
            } else {
                newDuration = Math.max(0.5, dragging.originalRegion.duration + deltaTime);
            }

            if (newDuration >= 0.5) {
                onRegionUpdate?.(dragging.trackId, dragging.regionId, {
                    startTime: newStart,
                    duration: newDuration
                });
            }
        }
    }

    function handleDragEnd() {
        setDragging(null);
    }

    useEffect(() => {
        if (dragging) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            return () => {
                document.removeEventListener('mousemove', handleDragMove);
                document.removeEventListener('mouseup', handleDragEnd);
            };
        }
    }, [dragging]);

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    const markerInterval = zoom < 0.5 ? 30 : zoom < 1 ? 10 : 5;
    const markers = [];
    for (let t = 0; t <= duration; t += markerInterval) {
        markers.push(t);
    }

    const renderWaveform = useCallback((track, region, width) => {
        const trackWaveform = waveformData[track.id];
        const barCount = Math.min(100, Math.max(20, Math.floor(width / 4)));

        if (trackWaveform && trackWaveform.length > 0) {
            const step = Math.floor(trackWaveform.length / barCount);
            return (
                <div className="flex items-center justify-center h-full gap-px px-1">
                    {Array.from({ length: barCount }, (_, i) => {
                        const dataIndex = Math.min(i * step, trackWaveform.length - 1);
                        const amplitude = trackWaveform[dataIndex] || 0;
                        return (
                            <div
                                key={i}
                                className="waveform-bar w-0.5 rounded-sm"
                                style={{
                                    height: `${Math.max(10, amplitude * 80)}%`,
                                    background: track.color,
                                    opacity: 0.7
                                }}
                            />
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full gap-px px-1">
                {Array.from({ length: barCount }, (_, i) => {
                    const x = i / barCount;
                    const wave1 = Math.sin(x * Math.PI * 8) * 0.3;
                    const wave2 = Math.sin(x * Math.PI * 16 + 0.5) * 0.2;
                    const wave3 = Math.sin(x * Math.PI * 4) * 0.5;
                    const height = Math.abs(wave1 + wave2 + wave3) * 60 + 20;

                    return (
                        <div
                            key={i}
                            className="waveform-bar w-0.5 rounded-sm transition-all duration-75"
                            style={{
                                height: `${height}%`,
                                background: track.color,
                                opacity: 0.6
                            }}
                        />
                    );
                })}
            </div>
        );
    }, [waveformData]);

    const tools = [
        { id: 'select', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', color: 'violet' },
        { id: 'cut', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z', color: 'fuchsia' },
        { id: 'trim', icon: 'M4 6h16M4 12h16m-7 6h7', color: 'amber' }
    ];

    const getToolActiveClass = (tool) => {
        const colors = { violet: 'bg-violet-500 text-white', fuchsia: 'bg-fuchsia-500 text-white', amber: 'bg-amber-500 text-black' };
        return activeTool === tool.id ? colors[tool.color] : 'text-white/40 hover:text-white/70';
    };

    return (
        <div className="section-card rounded-2xl overflow-hidden">
            {/* Timeline header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] bg-black/10">
                <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Timeline</span>
                    <span className="text-white font-mono text-xs bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.04]">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Editing tools */}
                    <div className="flex bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.04]">
                        {tools.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${getToolActiveClass(tool)}`}
                                title={`${tool.id.charAt(0).toUpperCase() + tool.id.slice(1)} tool`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                                </svg>
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-white/[0.06]" />

                    {/* Zoom controls */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                            className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/40 hover:bg-white/[0.08] hover:text-white/70 transition text-xs flex items-center justify-center"
                        >
                            −
                        </button>
                        <span className="text-white/30 text-[10px] w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                            className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/40 hover:bg-white/[0.08] hover:text-white/70 transition text-xs flex items-center justify-center"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* Time ruler */}
            <div
                className="relative h-6 bg-black/20 border-b border-white/[0.04] overflow-hidden cursor-pointer"
                onClick={handleTimelineClick}
            >
                <div
                    className="relative h-full"
                    style={{ width: totalWidth }}
                >
                    {markers.map((t) => (
                        <div
                            key={t}
                            className="absolute top-0 h-full flex flex-col items-center"
                            style={{ left: 128 + t * pixelsPerSecond }}
                        >
                            <div className="h-2.5 w-px bg-white/15" />
                            <span className="text-[9px] text-white/25 mt-0.5 font-mono">{formatTime(t)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tracks area */}
            <div
                ref={timelineRef}
                className="relative overflow-x-auto overflow-y-auto"
                style={{ maxHeight: "420px" }}
                onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
            >
                <div style={{ width: totalWidth, minHeight: tracks.length * 64 || 120 }}>
                    {tracks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-28 text-white/20">
                            <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p className="text-xs">Upload tracks to see them here</p>
                        </div>
                    ) : (
                        tracks.map((track, idx) => (
                            <div
                                key={track.id}
                                onClick={() => onTrackSelect?.(track.id)}
                                className={`relative h-14 border-b border-white/[0.03] cursor-pointer transition-colors ${selectedTrackId === track.id
                                    ? "bg-violet-500/[0.06]"
                                    : "hover:bg-white/[0.02]"
                                    }`}
                            >
                                {/* Track label */}
                                <div className="absolute left-0 top-0 h-full w-32 bg-bg-primary/90 border-r border-white/[0.06] flex items-center px-3 z-10">
                                    <div
                                        className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                                        style={{ background: track.color, boxShadow: `0 0 6px ${track.color}40` }}
                                    />
                                    <span className="text-xs text-white truncate font-medium">{track.name}</span>
                                </div>

                                {/* Track regions */}
                                {track.regions?.map((region) => {
                                    const regionWidth = region.duration * pixelsPerSecond;
                                    return (
                                        <div
                                            key={region.id}
                                            onClick={(e) => handleRegionClick(e, track, region)}
                                            className={`absolute top-1 bottom-1 rounded-lg overflow-hidden cursor-pointer transition-all ${activeTool === 'cut' ? 'hover:ring-1 hover:ring-fuchsia-400' : ''
                                                } ${selectedTrackId === track.id ? 'ring-1 ring-white/15' : ''}`}
                                            style={{
                                                left: 128 + region.startTime * pixelsPerSecond,
                                                width: regionWidth,
                                                background: `linear-gradient(180deg, ${track.color}40, ${track.color}15)`
                                            }}
                                        >
                                            <div className="h-full relative">
                                                {renderWaveform(track, region, regionWidth)}
                                            </div>

                                            {(track.fadeIn || region.fadeIn) > 0 && (
                                                <div
                                                    className="absolute left-0 top-0 bottom-0 fade-in-overlay pointer-events-none"
                                                    style={{ width: (track.fadeIn || region.fadeIn) * pixelsPerSecond }}
                                                />
                                            )}

                                            {(track.fadeOut || region.fadeOut) > 0 && (
                                                <div
                                                    className="absolute right-0 top-0 bottom-0 fade-out-overlay pointer-events-none"
                                                    style={{ width: (track.fadeOut || region.fadeOut) * pixelsPerSecond }}
                                                />
                                            )}

                                            {(activeTool === 'trim' || activeTool === 'select') && (
                                                <>
                                                    <div
                                                        onMouseDown={(e) => handleTrimStart(e, track, region, 'left')}
                                                        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/0 hover:bg-white/20 transition-colors"
                                                    >
                                                        <div className="absolute left-px top-1/2 -translate-y-1/2 w-px h-5 bg-white/40 rounded-full" />
                                                    </div>
                                                    <div
                                                        onMouseDown={(e) => handleTrimStart(e, track, region, 'right')}
                                                        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/0 hover:bg-white/20 transition-colors"
                                                    >
                                                        <div className="absolute right-px top-1/2 -translate-y-1/2 w-px h-5 bg-white/40 rounded-full" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-violet-400 z-20 pointer-events-none"
                        style={{ left: 128 + currentTime * pixelsPerSecond }}
                    >
                        <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-violet-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
