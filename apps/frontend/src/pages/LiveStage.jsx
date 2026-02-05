import { useState, useRef, useCallback } from "react";
import MixerChannel from "../components/MixerChannel";
import Timeline from "../components/Timeline";
import LiveIntelligence from "../components/LiveIntelligence";
import PianoKeyboard from "../components/PianoKeyboard";
import { useAudioEngine } from "../hooks/useAudioEngine";

const TRACK_COLORS = [
  "#8B5CF6", "#C026D3", "#F59E0B", "#3B82F6",
  "#EC4899", "#14B8A6", "#EF4444", "#6366F1",
  "#22C55E", "#84CC16", "#06B6D4", "#A855F7"
];

export default function LiveStage() {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [scaleSettings, setScaleSettings] = useState({ rootNote: 'C', scaleType: 'major', scaleNotes: [] });
  const [detectedNote, setDetectedNote] = useState(null);

  const fileInputRef = useRef(null);

  const {
    isPlaying,
    currentTime,
    duration,
    waveformData,
    play,
    pause,
    stop,
    seek,
    loadTrack,
    removeTrack,
    setTrackVolume,
    setTrackPan,
    setTrackFade,
    toggleMute,
    toggleSolo
  } = useAudioEngine();

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      if (tracks.length >= 12) {
        alert("Maximum 12 tracks allowed");
        break;
      }

      const trackId = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const color = TRACK_COLORS[tracks.length % TRACK_COLORS.length];

      const newTrack = {
        id: trackId,
        name: file.name.replace(/\.[^/.]+$/, ""),
        volume: 0.8,
        pan: 0,
        muted: false,
        solo: false,
        color,
        file,
        fadeIn: 0,
        fadeOut: 0,
        regions: [{
          id: `region-${trackId}`,
          startTime: 0,
          duration: 30,
          fadeIn: 0,
          fadeOut: 0
        }]
      };

      setTracks(prev => [...prev, newTrack]);

      // Load into audio engine
      const result = await loadTrack(trackId, file);
      if (result.success) {
        setTracks(prev => prev.map(t =>
          t.id === trackId
            ? { ...t, regions: [{ ...t.regions[0], duration: result.duration }] }
            : t
        ));
      }
    }

    e.target.value = "";
  }

  function handleVolumeChange(trackId, volume) {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, volume } : t
    ));
    setTrackVolume(trackId, volume);
  }

  function handlePanChange(trackId, pan) {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, pan } : t
    ));
    setTrackPan(trackId, pan);
  }

  function handleFadeChange(trackId, fadeType, value) {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, [fadeType]: value } : t
    ));
    setTrackFade(trackId, fadeType, value);
  }

  function handleMuteToggle(trackId) {
    const muted = toggleMute(trackId);
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, muted } : t
    ));
  }

  function handleSoloToggle(trackId) {
    const solo = toggleSolo(trackId);
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, solo } : t
    ));
  }

  function handleNameChange(trackId, name) {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? { ...t, name } : t
    ));
  }

  function handleDeleteTrack(trackId) {
    removeTrack(trackId);
    setTracks(prev => prev.filter(t => t.id !== trackId));
    if (selectedTrackId === trackId) {
      setSelectedTrackId(null);
    }
  }

  function handleRegionUpdate(trackId, regionId, updates) {
    setTracks(prev => prev.map(t =>
      t.id === trackId ? {
        ...t,
        regions: t.regions.map(r =>
          r.id === regionId ? { ...r, ...updates } : r
        )
      } : t
    ));
  }

  function handleSplitRegion(trackId, regionId, splitTime) {
    setTracks(prev => prev.map(t => {
      if (t.id !== trackId) return t;

      const regionIndex = t.regions.findIndex(r => r.id === regionId);
      if (regionIndex === -1) return t;

      const region = t.regions[regionIndex];
      const relativeTime = splitTime - region.startTime;

      if (relativeTime <= 0.5 || relativeTime >= region.duration - 0.5) {
        return t; // Don't split if too close to edges
      }

      const newRegions = [...t.regions];

      // First part
      newRegions[regionIndex] = {
        ...region,
        duration: relativeTime
      };

      // Second part
      newRegions.splice(regionIndex + 1, 0, {
        id: `region-${Date.now()}`,
        startTime: splitTime,
        duration: region.duration - relativeTime,
        fadeIn: 0,
        fadeOut: region.fadeOut
      });

      return { ...t, regions: newRegions };
    }));
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  }

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);

  return (
    <main className="px-6 lg:px-10 pt-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full glass-surface text-white/70 text-sm mb-3">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 mr-3 animate-pulse" />
            Live Performance Tools
          </div>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="text-3xl md:text-4xl font-display font-bold bg-transparent border-b-2 border-transparent 
                       hover:border-white/20 focus:border-fuchsia-500 outline-none text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 rounded-full glow-btn font-semibold shadow-lg shadow-purple-500/30 hover:shadow-fuchsia-500/50 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Tracks
          </button>
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => seek(0)}
          className="w-10 h-10 rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>

        <button
          onClick={() => isPlaying ? pause() : play()}
          className="w-16 h-16 rounded-full glow-btn flex items-center justify-center shadow-lg shadow-fuchsia-500/40"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => { stop(); seek(0); }}
          className="w-10 h-10 rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6V6z" />
          </svg>
        </button>

        <div className="ml-4 font-mono text-xl text-white bg-black/30 px-4 py-2 rounded-lg">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Timeline */}
        <Timeline
          tracks={tracks}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={seek}
          onTrackSelect={setSelectedTrackId}
          selectedTrackId={selectedTrackId}
          onRegionUpdate={handleRegionUpdate}
          onSplitRegion={handleSplitRegion}
          waveformData={waveformData}
        />

        {/* Mixer */}
        <div className="bg-surface/50 rounded-2xl border border-purple-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Mixer</h3>
            <span className="text-white/50 text-sm">{tracks.length}/12 tracks</span>
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <div className="text-5xl mb-4">🎛️</div>
              <p>No tracks yet. Click "Add Tracks" to upload audio files.</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {tracks.map((track) => (
                <div key={track.id} className="relative group">
                  <MixerChannel
                    track={track}
                    onVolumeChange={handleVolumeChange}
                    onPanChange={handlePanChange}
                    onMuteToggle={handleMuteToggle}
                    onSoloToggle={handleSoloToggle}
                    onNameChange={handleNameChange}
                    onFadeChange={handleFadeChange}
                  />
                  <button
                    onClick={() => handleDeleteTrack(track.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm 
                               opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center
                               shadow-lg shadow-red-500/30"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add track button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-28 h-full min-h-[380px] rounded-xl border-2 border-dashed border-white/20 
                           hover:border-fuchsia-500/50 transition-colors flex flex-col items-center justify-center text-white/40
                           hover:text-fuchsia-400"
              >
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Add Track</span>
              </button>
            </div>
          )}
        </div>

        {/* Selected track info */}
        {selectedTrack && (
          <div className="bg-surface/50 rounded-2xl border border-purple-500/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Track Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/50 text-sm mb-1">Name</div>
                <div className="text-white font-medium truncate">
                  {selectedTrack.name}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/50 text-sm mb-1">Volume</div>
                <div className="text-white font-medium">
                  {selectedTrack.volume === 0 ? '-∞ dB' : `${Math.round(20 * Math.log10(selectedTrack.volume))} dB`}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/50 text-sm mb-1">Pan</div>
                <div className="text-white font-medium">
                  {selectedTrack.pan === 0 ? 'Center' : selectedTrack.pan > 0 ? `R ${Math.round(selectedTrack.pan * 100)}%` : `L ${Math.round(Math.abs(selectedTrack.pan) * 100)}%`}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/50 text-sm mb-1">Fade In</div>
                <div className="text-fuchsia-400 font-medium">
                  {selectedTrack.fadeIn?.toFixed(1) || '0.0'}s
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/50 text-sm mb-1">Fade Out</div>
                <div className="text-amber-400 font-medium">
                  {selectedTrack.fadeOut?.toFixed(1) || '0.0'}s
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Intelligence */}
        <LiveIntelligence
          onScaleChange={setScaleSettings}
          onDetectedNote={setDetectedNote}
        />

        {/* Piano Keyboard with scale guide */}
        <PianoKeyboard
          scaleNotes={scaleSettings.scaleNotes}
          detectedNote={detectedNote}
          showScaleGuide={true}
          octaves={3}
        />
      </div>
    </main>
  );
}
