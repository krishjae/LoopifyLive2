import { useState, useRef, useCallback, useEffect } from "react";

// Note frequencies (A4 = 440Hz)
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Scale definitions (semitone intervals from root)
export const SCALES = {
    major: { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
    minor: { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
    harmonicMinor: { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11] },
    melodicMinor: { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11] },
    pentatonicMajor: { name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9] },
    pentatonicMinor: { name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10] },
    blues: { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
    dorian: { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
    mixolydian: { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10] },
};

/**
 * Convert frequency to note name and octave
 */
function frequencyToNote(frequency) {
    if (!frequency || frequency < 20) return null;

    // A4 = 440Hz, MIDI note 69
    const midiNote = 12 * Math.log2(frequency / 440) + 69;
    const roundedMidi = Math.round(midiNote);
    const noteIndex = ((roundedMidi % 12) + 12) % 12;
    const octave = Math.floor(roundedMidi / 12) - 1;
    const noteName = NOTE_NAMES[noteIndex];
    const cents = Math.round((midiNote - roundedMidi) * 100);

    return {
        name: noteName,
        octave,
        fullName: `${noteName}${octave}`,
        midi: roundedMidi,
        frequency,
        cents,
        noteIndex
    };
}

/**
 * Get notes in a scale
 */
export function getScaleNotes(rootNote, scaleType) {
    const rootIndex = NOTE_NAMES.indexOf(rootNote.replace(/[0-9]/g, '').toUpperCase());
    if (rootIndex === -1) return [];

    const scale = SCALES[scaleType];
    if (!scale) return [];

    return scale.intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return NOTE_NAMES[noteIndex];
    });
}

/**
 * Check if a note is in the scale
 */
export function isNoteInScale(noteName, rootNote, scaleType) {
    const scaleNotes = getScaleNotes(rootNote, scaleType);
    const normalizedNote = noteName.replace(/[0-9]/g, '').toUpperCase();
    return scaleNotes.includes(normalizedNote);
}

/**
 * Autocorrelation-based pitch detection
 */
function autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    let rms = 0;

    for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.01) return -1; // Too quiet

    let r1 = 0, r2 = SIZE - 1;
    const threshold = 0.2;

    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buffer[i]) < threshold) {
            r1 = i;
            break;
        }
    }

    for (let i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buffer[SIZE - i]) < threshold) {
            r2 = SIZE - i;
            break;
        }
    }

    buffer = buffer.slice(r1, r2);
    const newSize = buffer.length;

    const c = new Array(newSize).fill(0);
    for (let i = 0; i < newSize; i++) {
        for (let j = 0; j < newSize - i; j++) {
            c[i] = c[i] + buffer[j] * buffer[j + i];
        }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;

    let maxval = -1, maxpos = -1;
    for (let i = d; i < newSize; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }

    let T0 = maxpos;

    // Parabolic interpolation
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

/**
 * Custom hook for real-time pitch detection
 */
export function usePitchDetection() {
    const [isListening, setIsListening] = useState(false);
    const [detectedNote, setDetectedNote] = useState(null);
    const [frequency, setFrequency] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState(null);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const animationRef = useRef(null);
    const bufferRef = useRef(null);

    const startListening = useCallback(async () => {
        try {
            setError(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            analyserRef.current = analyser;

            bufferRef.current = new Float32Array(analyser.fftSize);

            setIsListening(true);

            const detectPitch = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getFloatTimeDomainData(bufferRef.current);
                const freq = autoCorrelate(bufferRef.current, audioContext.sampleRate);

                if (freq > 0 && freq < 2000) {
                    const note = frequencyToNote(freq);
                    setDetectedNote(note);
                    setFrequency(freq);
                    setConfidence(Math.min(1, Math.abs(note?.cents || 0) < 20 ? 1 : 0.5));
                } else {
                    setDetectedNote(null);
                    setFrequency(null);
                    setConfidence(0);
                }

                animationRef.current = requestAnimationFrame(detectPitch);
            };

            animationRef.current = requestAnimationFrame(detectPitch);
        } catch (err) {
            console.error('Failed to access microphone:', err);
            setError(err.message || 'Failed to access microphone');
        }
    }, []);

    const stopListening = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setIsListening(false);
        setDetectedNote(null);
        setFrequency(null);
        setConfidence(0);
    }, []);

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return {
        isListening,
        detectedNote,
        frequency,
        confidence,
        error,
        startListening,
        stopListening
    };
}

export default usePitchDetection;
