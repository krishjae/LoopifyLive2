import { useState, useRef, useCallback, useEffect } from "react";
import { detectChord, matchChord, normalizeNote } from "../data/chordLibrary";

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Convert MIDI note number to note name
 */
function midiToNoteName(midiNote) {
    const noteIndex = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;
    return `${NOTE_NAMES[noteIndex]}${octave}`;
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

    if (rms < 0.01) return -1;

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
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

/**
 * Convert frequency to note name
 */
function frequencyToNote(frequency) {
    if (!frequency || frequency < 20 || frequency > 5000) return null;
    const midiNote = 12 * Math.log2(frequency / 440) + 69;
    const roundedMidi = Math.round(midiNote);
    const noteIndex = ((roundedMidi % 12) + 12) % 12;
    const octave = Math.floor(roundedMidi / 12) - 1;
    return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Custom hook for chord detection with MIDI and Microphone support
 */
export function useChordDetection() {
    const [inputMode, setInputMode] = useState('midi'); // 'midi' | 'mic'
    const [isListening, setIsListening] = useState(false);
    const [activeNotes, setActiveNotes] = useState([]);
    const [detectedChord, setDetectedChord] = useState(null);
    const [midiAccess, setMidiAccess] = useState(null);
    const [midiInputs, setMidiInputs] = useState([]);
    const [selectedMidiInput, setSelectedMidiInput] = useState(null);
    const [error, setError] = useState(null);
    const [difficulty, setDifficulty] = useState(3);

    // Refs for audio processing
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const animationRef = useRef(null);
    const bufferRef = useRef(null);
    const noteHistoryRef = useRef([]);

    // ==================
    // MIDI Functions
    // ==================

    const initMidi = useCallback(async () => {
        if (!navigator.requestMIDIAccess) {
            setError('Web MIDI API not supported in this browser');
            return false;
        }

        try {
            const access = await navigator.requestMIDIAccess();
            setMidiAccess(access);

            const inputs = Array.from(access.inputs.values());
            setMidiInputs(inputs);

            if (inputs.length > 0) {
                setSelectedMidiInput(inputs[0]);
            }

            access.onstatechange = () => {
                setMidiInputs(Array.from(access.inputs.values()));
            };

            return true;
        } catch (err) {
            setError(`MIDI access denied: ${err.message}`);
            return false;
        }
    }, []);

    const handleMidiMessage = useCallback((event) => {
        const [status, note, velocity] = event.data;
        const command = status >> 4;
        const noteName = midiToNoteName(note);

        if (command === 9 && velocity > 0) {
            // Note On
            setActiveNotes(prev => {
                const normalized = normalizeNote(noteName);
                if (!prev.some(n => normalizeNote(n) === normalized)) {
                    return [...prev, noteName];
                }
                return prev;
            });
        } else if (command === 8 || (command === 9 && velocity === 0)) {
            // Note Off
            setActiveNotes(prev => {
                const normalized = normalizeNote(noteName);
                return prev.filter(n => normalizeNote(n) !== normalized);
            });
        }
    }, []);

    const startMidi = useCallback(async () => {
        setError(null);

        if (!midiAccess) {
            const success = await initMidi();
            if (!success) return;
        }

        if (selectedMidiInput) {
            selectedMidiInput.onmidimessage = handleMidiMessage;
            setIsListening(true);
        } else {
            setError('No MIDI input device selected');
        }
    }, [midiAccess, selectedMidiInput, initMidi, handleMidiMessage]);

    const stopMidi = useCallback(() => {
        if (selectedMidiInput) {
            selectedMidiInput.onmidimessage = null;
        }
        setIsListening(false);
        setActiveNotes([]);
        setDetectedChord(null);
    }, [selectedMidiInput]);

    // ==================
    // Microphone Functions
    // ==================

    const startMic = useCallback(async () => {
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
            noteHistoryRef.current = [];

            setIsListening(true);

            const detectPitch = () => {
                if (!analyserRef.current) return;

                analyserRef.current.getFloatTimeDomainData(bufferRef.current);
                const freq = autoCorrelate(bufferRef.current, audioContext.sampleRate);

                if (freq > 0 && freq < 2000) {
                    const note = frequencyToNote(freq);
                    if (note) {
                        // Add to history with timestamp
                        const now = Date.now();
                        noteHistoryRef.current.push({ note, time: now });

                        // Keep last 500ms of notes
                        noteHistoryRef.current = noteHistoryRef.current.filter(
                            n => now - n.time < 500
                        );

                        // Get unique notes from history
                        const uniqueNotes = [...new Set(noteHistoryRef.current.map(n => n.note))];
                        setActiveNotes(uniqueNotes);
                    }
                }

                animationRef.current = requestAnimationFrame(detectPitch);
            };

            animationRef.current = requestAnimationFrame(detectPitch);
        } catch (err) {
            setError(err.message || 'Failed to access microphone');
        }
    }, []);

    const stopMic = useCallback(() => {
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
        setActiveNotes([]);
        setDetectedChord(null);
        noteHistoryRef.current = [];
    }, []);

    // ==================
    // Unified Control
    // ==================

    const startListening = useCallback(async () => {
        if (inputMode === 'midi') {
            await startMidi();
        } else {
            await startMic();
        }
    }, [inputMode, startMidi, startMic]);

    const stopListening = useCallback(() => {
        if (inputMode === 'midi') {
            stopMidi();
        } else {
            stopMic();
        }
    }, [inputMode, stopMidi, stopMic]);

    // Detect chord when active notes change
    useEffect(() => {
        if (activeNotes.length >= 2) {
            const chord = detectChord(activeNotes, difficulty);
            setDetectedChord(chord);
        } else {
            setDetectedChord(null);
        }
    }, [activeNotes, difficulty]);

    // Match against target chord
    const matchTargetChord = useCallback((targetChordName) => {
        return matchChord(activeNotes, targetChordName);
    }, [activeNotes]);

    // Switch input mode
    const switchInputMode = useCallback((mode) => {
        if (isListening) {
            stopListening();
        }
        setInputMode(mode);
        setActiveNotes([]);
        setDetectedChord(null);
        setError(null);
    }, [isListening, stopListening]);

    // Select MIDI input
    const selectMidiInput = useCallback((input) => {
        if (isListening && inputMode === 'midi') {
            if (selectedMidiInput) {
                selectedMidiInput.onmidimessage = null;
            }
            input.onmidimessage = handleMidiMessage;
        }
        setSelectedMidiInput(input);
    }, [isListening, inputMode, selectedMidiInput, handleMidiMessage]);

    // Cleanup
    useEffect(() => {
        return () => {
            stopMic();
            stopMidi();
        };
    }, []);

    // Initialize MIDI on mount
    useEffect(() => {
        initMidi();
    }, [initMidi]);

    return {
        // State
        inputMode,
        isListening,
        activeNotes,
        detectedChord,
        midiInputs,
        selectedMidiInput,
        error,
        difficulty,

        // Actions
        startListening,
        stopListening,
        switchInputMode,
        selectMidiInput,
        matchTargetChord,
        setDifficulty,
        clearNotes: () => setActiveNotes([])
    };
}

export default useChordDetection;
