import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Custom hook for managing multi-track audio playback
 * Uses Web Audio API for precise control
 */
export function useAudioEngine() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(60);
    const [waveformData, setWaveformData] = useState({});

    const audioContextRef = useRef(null);
    const tracksRef = useRef(new Map());
    const startTimeRef = useRef(0);
    const animationRef = useRef(null);

    // Initialize audio context
    const initContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Extract waveform data from audio buffer
    const extractWaveform = useCallback((audioBuffer, sampleCount = 200) => {
        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channelData.length / sampleCount);
        const waveform = [];

        for (let i = 0; i < sampleCount; i++) {
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(channelData[i * blockSize + j]);
            }
            waveform.push(sum / blockSize);
        }

        // Normalize
        const max = Math.max(...waveform);
        return waveform.map(v => v / max);
    }, []);

    // Load audio file into a track
    const loadTrack = useCallback(async (trackId, file) => {
        const context = initContext();

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);

            // Extract waveform data
            const waveform = extractWaveform(audioBuffer);
            setWaveformData(prev => ({ ...prev, [trackId]: waveform }));

            tracksRef.current.set(trackId, {
                buffer: audioBuffer,
                source: null,
                gainNode: context.createGain(),
                panNode: context.createStereoPanner(),
                analyser: context.createAnalyser(),
                muted: false,
                solo: false,
                volume: 0.8,
                pan: 0,
                fadeIn: 0,
                fadeOut: 0
            });

            // Update duration to longest track
            if (audioBuffer.duration > duration) {
                setDuration(audioBuffer.duration);
            }

            return { success: true, duration: audioBuffer.duration };
        } catch (error) {
            console.error("Failed to load track:", error);
            return { success: false, error };
        }
    }, [duration, initContext, extractWaveform]);

    // Apply fade envelope
    const applyFades = useCallback((track, gainNode, trackDuration) => {
        const context = audioContextRef.current;
        if (!context) return;

        const now = context.currentTime;
        const endTime = now + trackDuration;

        gainNode.gain.cancelScheduledValues(now);

        if (track.fadeIn > 0) {
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(track.volume, now + track.fadeIn);
        } else {
            gainNode.gain.setValueAtTime(track.volume, now);
        }

        if (track.fadeOut > 0) {
            gainNode.gain.setValueAtTime(track.volume, endTime - track.fadeOut);
            gainNode.gain.linearRampToValueAtTime(0, endTime);
        }
    }, []);

    // Start playback
    const play = useCallback(() => {
        const context = initContext();
        if (context.state === "suspended") {
            context.resume();
        }

        const tracks = tracksRef.current;
        const hasSoloTracks = Array.from(tracks.values()).some(t => t.solo);

        tracks.forEach((track, id) => {
            if (track.source) {
                track.source.stop();
            }

            const source = context.createBufferSource();
            source.buffer = track.buffer;

            // Connect: source -> gain -> pan -> destination
            source.connect(track.gainNode);
            track.gainNode.connect(track.panNode);
            track.panNode.connect(context.destination);

            // Apply current settings
            const shouldPlay = hasSoloTracks ? track.solo : !track.muted;

            if (shouldPlay) {
                applyFades(track, track.gainNode, track.buffer.duration - currentTime);
            } else {
                track.gainNode.gain.value = 0;
            }

            track.panNode.pan.value = track.pan;

            source.start(0, currentTime);
            track.source = source;
        });

        startTimeRef.current = context.currentTime - currentTime;
        setIsPlaying(true);

        // Update time
        const updateTime = () => {
            if (audioContextRef.current) {
                const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
                setCurrentTime(Math.min(elapsed, duration));

                if (elapsed < duration) {
                    animationRef.current = requestAnimationFrame(updateTime);
                } else {
                    stop();
                }
            }
        };
        animationRef.current = requestAnimationFrame(updateTime);
    }, [currentTime, duration, initContext, applyFades]);

    // Stop playback
    const stop = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        tracksRef.current.forEach((track) => {
            if (track.source) {
                try {
                    track.source.stop();
                } catch (e) { }
                track.source = null;
            }
        });

        setIsPlaying(false);
    }, []);

    // Pause playback
    const pause = useCallback(() => {
        stop();
    }, [stop]);

    // Seek to time
    const seek = useCallback((time) => {
        const wasPlaying = isPlaying;
        if (isPlaying) {
            stop();
        }
        setCurrentTime(Math.max(0, Math.min(time, duration)));
        if (wasPlaying) {
            setTimeout(play, 50);
        }
    }, [isPlaying, stop, duration, play]);

    // Update track volume
    const setTrackVolume = useCallback((trackId, volume) => {
        const track = tracksRef.current.get(trackId);
        if (track) {
            track.volume = volume;
            if (track.gainNode && !track.muted) {
                track.gainNode.gain.value = volume;
            }
        }
    }, []);

    // Update track pan
    const setTrackPan = useCallback((trackId, pan) => {
        const track = tracksRef.current.get(trackId);
        if (track) {
            track.pan = pan;
            if (track.panNode) {
                track.panNode.pan.value = pan;
            }
        }
    }, []);

    // Update track fade
    const setTrackFade = useCallback((trackId, fadeType, value) => {
        const track = tracksRef.current.get(trackId);
        if (track) {
            track[fadeType] = value;
        }
    }, []);

    // Toggle mute
    const toggleMute = useCallback((trackId) => {
        const track = tracksRef.current.get(trackId);
        if (track) {
            track.muted = !track.muted;
            if (track.gainNode) {
                track.gainNode.gain.value = track.muted ? 0 : track.volume;
            }
            return track.muted;
        }
        return false;
    }, []);

    // Toggle solo
    const toggleSolo = useCallback((trackId) => {
        const track = tracksRef.current.get(trackId);
        if (track) {
            track.solo = !track.solo;

            // Update all tracks based on solo state
            const hasSoloTracks = Array.from(tracksRef.current.values()).some(t => t.solo);

            tracksRef.current.forEach((t) => {
                if (t.gainNode) {
                    const shouldPlay = hasSoloTracks ? t.solo : !t.muted;
                    t.gainNode.gain.value = shouldPlay ? t.volume : 0;
                }
            });

            return track.solo;
        }
        return false;
    }, []);

    // Remove track
    const removeTrack = useCallback((trackId) => {
        const track = tracksRef.current.get(trackId);
        if (track?.source) {
            try {
                track.source.stop();
            } catch (e) { }
        }
        tracksRef.current.delete(trackId);
        setWaveformData(prev => {
            const next = { ...prev };
            delete next[trackId];
            return next;
        });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            tracksRef.current.forEach((track) => {
                if (track.source) {
                    try {
                        track.source.stop();
                    } catch (e) { }
                }
            });
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return {
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
    };
}
