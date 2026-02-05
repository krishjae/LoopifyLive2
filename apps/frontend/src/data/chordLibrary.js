/**
 * Comprehensive Chord Library with difficulty levels
 * Based on Kaggle Guitar Chords V3 and Audio Piano Triads datasets
 */

// Note name to semitone mapping (C = 0)
export const NOTE_TO_SEMITONE = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

export const SEMITONE_TO_NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Difficulty levels
export const DIFFICULTY_LEVELS = {
    1: { name: 'Beginner', description: 'Basic major chords' },
    2: { name: 'Easy', description: 'Major and minor chords' },
    3: { name: 'Medium', description: 'Adding 7th chords' },
    4: { name: 'Hard', description: 'Bar chords, suspended, add9' },
    5: { name: 'Expert', description: 'Jazz voicings, extended chords' }
};

// Chord interval patterns (semitones from root)
export const CHORD_FORMULAS = {
    // Basic (Level 1-2)
    'major': [0, 4, 7],
    'minor': [0, 3, 7],

    // 7th chords (Level 3)
    '7': [0, 4, 7, 10],
    'maj7': [0, 4, 7, 11],
    'm7': [0, 3, 7, 10],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],

    // Advanced (Level 4)
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    'add9': [0, 4, 7, 14],
    '7sus4': [0, 5, 7, 10],
    'm7b5': [0, 3, 6, 10],

    // Jazz (Level 5)
    '9': [0, 4, 7, 10, 14],
    'maj9': [0, 4, 7, 11, 14],
    'm9': [0, 3, 7, 10, 14],
    '11': [0, 4, 7, 10, 14, 17],
    '13': [0, 4, 7, 10, 14, 21],
    'dim7': [0, 3, 6, 9],
    'aug7': [0, 4, 8, 10],
    '6': [0, 4, 7, 9],
    'm6': [0, 3, 7, 9],
};

// Full chord definitions with difficulty levels
export const CHORD_LIBRARY = {
    // ====================
    // LEVEL 1: BEGINNER - Basic Major Chords
    // ====================
    'C': {
        notes: ['C', 'E', 'G'], formula: 'major', difficulty: 1,
        guitar: { fingering: [-1, 3, 2, 0, 1, 0], barFret: 0 },
        piano: { positions: [0, 4, 7] }
    },
    'G': {
        notes: ['G', 'B', 'D'], formula: 'major', difficulty: 1,
        guitar: { fingering: [3, 0, 0, 0, 2, 3], barFret: 0 },
        piano: { positions: [7, 11, 14] }
    },
    'D': {
        notes: ['D', 'F#', 'A'], formula: 'major', difficulty: 1,
        guitar: { fingering: [-1, -1, 0, 2, 3, 2], barFret: 0 },
        piano: { positions: [2, 6, 9] }
    },
    'A': {
        notes: ['A', 'C#', 'E'], formula: 'major', difficulty: 1,
        guitar: { fingering: [-1, 0, 2, 2, 2, 0], barFret: 0 },
        piano: { positions: [9, 13, 16] }
    },
    'E': {
        notes: ['E', 'G#', 'B'], formula: 'major', difficulty: 1,
        guitar: { fingering: [0, 0, 1, 2, 2, 0], barFret: 0 },
        piano: { positions: [4, 8, 11] }
    },

    // ====================
    // LEVEL 2: EASY - Minor Chords
    // ====================
    'Am': {
        notes: ['A', 'C', 'E'], formula: 'minor', difficulty: 2,
        guitar: { fingering: [-1, 0, 2, 2, 1, 0], barFret: 0 },
        piano: { positions: [9, 12, 16] }
    },
    'Em': {
        notes: ['E', 'G', 'B'], formula: 'minor', difficulty: 2,
        guitar: { fingering: [0, 0, 0, 2, 2, 0], barFret: 0 },
        piano: { positions: [4, 7, 11] }
    },
    'Dm': {
        notes: ['D', 'F', 'A'], formula: 'minor', difficulty: 2,
        guitar: { fingering: [-1, -1, 0, 2, 3, 1], barFret: 0 },
        piano: { positions: [2, 5, 9] }
    },
    'Bm': {
        notes: ['B', 'D', 'F#'], formula: 'minor', difficulty: 2,
        guitar: { fingering: [-1, 2, 4, 4, 3, 2], barFret: 2 },
        piano: { positions: [11, 14, 18] }
    },
    'F': {
        notes: ['F', 'A', 'C'], formula: 'major', difficulty: 2,
        guitar: { fingering: [1, 1, 2, 3, 3, 1], barFret: 1 },
        piano: { positions: [5, 9, 12] }
    },
    'Fm': {
        notes: ['F', 'Ab', 'C'], formula: 'minor', difficulty: 2,
        guitar: { fingering: [1, 1, 1, 3, 3, 1], barFret: 1 },
        piano: { positions: [5, 8, 12] }
    },

    // ====================
    // LEVEL 3: MEDIUM - 7th Chords
    // ====================
    'G7': {
        notes: ['G', 'B', 'D', 'F'], formula: '7', difficulty: 3,
        guitar: { fingering: [3, 0, 0, 0, 0, 1], barFret: 0 },
        piano: { positions: [7, 11, 14, 17] }
    },
    'D7': {
        notes: ['D', 'F#', 'A', 'C'], formula: '7', difficulty: 3,
        guitar: { fingering: [-1, -1, 0, 2, 1, 2], barFret: 0 },
        piano: { positions: [2, 6, 9, 12] }
    },
    'A7': {
        notes: ['A', 'C#', 'E', 'G'], formula: '7', difficulty: 3,
        guitar: { fingering: [-1, 0, 2, 0, 2, 0], barFret: 0 },
        piano: { positions: [9, 13, 16, 19] }
    },
    'E7': {
        notes: ['E', 'G#', 'B', 'D'], formula: '7', difficulty: 3,
        guitar: { fingering: [0, 0, 1, 0, 2, 0], barFret: 0 },
        piano: { positions: [4, 8, 11, 14] }
    },
    'Am7': {
        notes: ['A', 'C', 'E', 'G'], formula: 'm7', difficulty: 3,
        guitar: { fingering: [-1, 0, 2, 0, 1, 0], barFret: 0 },
        piano: { positions: [9, 12, 16, 19] }
    },
    'Em7': {
        notes: ['E', 'G', 'B', 'D'], formula: 'm7', difficulty: 3,
        guitar: { fingering: [0, 0, 0, 0, 2, 0], barFret: 0 },
        piano: { positions: [4, 7, 11, 14] }
    },
    'Cmaj7': {
        notes: ['C', 'E', 'G', 'B'], formula: 'maj7', difficulty: 3,
        guitar: { fingering: [-1, 3, 2, 0, 0, 0], barFret: 0 },
        piano: { positions: [0, 4, 7, 11] }
    },
    'Dm7': {
        notes: ['D', 'F', 'A', 'C'], formula: 'm7', difficulty: 3,
        guitar: { fingering: [-1, -1, 0, 2, 1, 1], barFret: 0 },
        piano: { positions: [2, 5, 9, 12] }
    },
    'Bdim': {
        notes: ['B', 'D', 'F'], formula: 'dim', difficulty: 3,
        guitar: { fingering: [-1, 2, 3, 4, 3, -1], barFret: 0 },
        piano: { positions: [11, 14, 17] }
    },

    // ====================
    // LEVEL 4: HARD - Suspended, Add, Bar Chords
    // ====================
    'Dsus2': {
        notes: ['D', 'E', 'A'], formula: 'sus2', difficulty: 4,
        guitar: { fingering: [-1, -1, 0, 2, 3, 0], barFret: 0 },
        piano: { positions: [2, 4, 9] }
    },
    'Dsus4': {
        notes: ['D', 'G', 'A'], formula: 'sus4', difficulty: 4,
        guitar: { fingering: [-1, -1, 0, 2, 3, 3], barFret: 0 },
        piano: { positions: [2, 7, 9] }
    },
    'Asus2': {
        notes: ['A', 'B', 'E'], formula: 'sus2', difficulty: 4,
        guitar: { fingering: [-1, 0, 2, 2, 0, 0], barFret: 0 },
        piano: { positions: [9, 11, 16] }
    },
    'Asus4': {
        notes: ['A', 'D', 'E'], formula: 'sus4', difficulty: 4,
        guitar: { fingering: [-1, 0, 2, 2, 3, 0], barFret: 0 },
        piano: { positions: [9, 14, 16] }
    },
    'Cadd9': {
        notes: ['C', 'E', 'G', 'D'], formula: 'add9', difficulty: 4,
        guitar: { fingering: [-1, 3, 2, 0, 3, 0], barFret: 0 },
        piano: { positions: [0, 4, 7, 14] }
    },
    'Gadd9': {
        notes: ['G', 'B', 'D', 'A'], formula: 'add9', difficulty: 4,
        guitar: { fingering: [3, 0, 0, 2, 0, 3], barFret: 0 },
        piano: { positions: [7, 11, 14, 21] }
    },
    'F#m': {
        notes: ['F#', 'A', 'C#'], formula: 'minor', difficulty: 4,
        guitar: { fingering: [2, 2, 2, 4, 4, 2], barFret: 2 },
        piano: { positions: [6, 9, 13] }
    },
    'C#m': {
        notes: ['C#', 'E', 'G#'], formula: 'minor', difficulty: 4,
        guitar: { fingering: [-1, 4, 6, 6, 5, 4], barFret: 4 },
        piano: { positions: [1, 4, 8] }
    },
    'Bb': {
        notes: ['Bb', 'D', 'F'], formula: 'major', difficulty: 4,
        guitar: { fingering: [-1, 1, 3, 3, 3, 1], barFret: 1 },
        piano: { positions: [10, 14, 17] }
    },

    // ====================
    // LEVEL 5: EXPERT - Jazz Voicings
    // ====================
    'Cmaj9': {
        notes: ['C', 'E', 'G', 'B', 'D'], formula: 'maj9', difficulty: 5,
        guitar: { fingering: [-1, 3, 2, 0, 0, 0], barFret: 0 },
        piano: { positions: [0, 4, 7, 11, 14] }
    },
    'Am9': {
        notes: ['A', 'C', 'E', 'G', 'B'], formula: 'm9', difficulty: 5,
        guitar: { fingering: [-1, 0, 2, 4, 1, 0], barFret: 0 },
        piano: { positions: [9, 12, 16, 19, 23] }
    },
    'Dm9': {
        notes: ['D', 'F', 'A', 'C', 'E'], formula: 'm9', difficulty: 5,
        guitar: { fingering: [-1, -1, 0, 2, 1, 0], barFret: 0 },
        piano: { positions: [2, 5, 9, 12, 16] }
    },
    'G13': {
        notes: ['G', 'B', 'D', 'F', 'A', 'E'], formula: '13', difficulty: 5,
        guitar: { fingering: [3, 0, 0, 0, 0, 0], barFret: 0 },
        piano: { positions: [7, 11, 14, 17, 21, 28] }
    },
    'C6': {
        notes: ['C', 'E', 'G', 'A'], formula: '6', difficulty: 5,
        guitar: { fingering: [-1, 3, 2, 2, 1, 0], barFret: 0 },
        piano: { positions: [0, 4, 7, 9] }
    },
    'Am6': {
        notes: ['A', 'C', 'E', 'F#'], formula: 'm6', difficulty: 5,
        guitar: { fingering: [-1, 0, 2, 2, 1, 2], barFret: 0 },
        piano: { positions: [9, 12, 16, 18] }
    },
    'Bdim7': {
        notes: ['B', 'D', 'F', 'Ab'], formula: 'dim7', difficulty: 5,
        guitar: { fingering: [-1, 2, 3, 1, 3, 1], barFret: 0 },
        piano: { positions: [11, 14, 17, 20] }
    },
    'Fmaj7': {
        notes: ['F', 'A', 'C', 'E'], formula: 'maj7', difficulty: 5,
        guitar: { fingering: [1, 0, 2, 2, 1, 0], barFret: 0 },
        piano: { positions: [5, 9, 12, 16] }
    },
};

/**
 * Get chords filtered by maximum difficulty level
 */
export function getChordsByDifficulty(maxLevel) {
    return Object.entries(CHORD_LIBRARY)
        .filter(([_, data]) => data.difficulty <= maxLevel)
        .reduce((acc, [name, data]) => {
            acc[name] = data;
            return acc;
        }, {});
}

/**
 * Get chord names for a specific difficulty level
 */
export function getChordNamesForLevel(level) {
    return Object.entries(CHORD_LIBRARY)
        .filter(([_, data]) => data.difficulty === level)
        .map(([name]) => name);
}

/**
 * Normalize note name (remove octave, handle flats/sharps)
 */
export function normalizeNote(note) {
    if (!note) return null;
    const normalized = note.replace(/[0-9]/g, '').toUpperCase();
    // Convert flats to sharps for consistency
    if (normalized === 'DB') return 'C#';
    if (normalized === 'EB') return 'D#';
    if (normalized === 'GB') return 'F#';
    if (normalized === 'AB') return 'G#';
    if (normalized === 'BB') return 'A#';
    return normalized;
}

/**
 * Convert notes to semitone set (position-independent)
 */
export function notesToSemitoneSet(notes) {
    const semitones = new Set();
    notes.forEach(note => {
        const normalized = normalizeNote(note);
        if (normalized && NOTE_TO_SEMITONE[normalized] !== undefined) {
            semitones.add(NOTE_TO_SEMITONE[normalized]);
        }
    });
    return semitones;
}

/**
 * Calculate chord match score
 * Returns { match: boolean, score: 0-100, missingNotes: [], extraNotes: [] }
 */
export function matchChord(playedNotes, targetChordName) {
    const chordData = CHORD_LIBRARY[targetChordName];
    if (!chordData) return { match: false, score: 0, missingNotes: [], extraNotes: [] };

    const targetNotes = chordData.notes.map(normalizeNote);
    const playedNormalized = playedNotes.map(normalizeNote).filter(Boolean);

    const targetSet = new Set(targetNotes);
    const playedSet = new Set(playedNormalized);

    const missingNotes = targetNotes.filter(n => !playedSet.has(n));
    const extraNotes = playedNormalized.filter(n => !targetSet.has(n));

    // Calculate score
    const matchedCount = targetNotes.filter(n => playedSet.has(n)).length;
    const accuracy = targetNotes.length > 0 ? (matchedCount / targetNotes.length) * 100 : 0;

    // Penalize extra notes slightly
    const penalty = Math.min(extraNotes.length * 5, 20);
    const score = Math.max(0, Math.round(accuracy - penalty));

    return {
        match: missingNotes.length === 0 && extraNotes.length <= 1,
        score,
        missingNotes,
        extraNotes,
        matchedNotes: matchedCount,
        totalNotes: targetNotes.length
    };
}

/**
 * Detect chord from played notes
 * Returns best matching chord or null
 */
export function detectChord(playedNotes, maxDifficulty = 5) {
    if (!playedNotes || playedNotes.length < 2) return null;

    const availableChords = getChordsByDifficulty(maxDifficulty);
    let bestMatch = null;
    let bestScore = 0;

    for (const [chordName, chordData] of Object.entries(availableChords)) {
        const result = matchChord(playedNotes, chordName);
        if (result.score > bestScore && result.score >= 60) {
            bestScore = result.score;
            bestMatch = {
                chord: chordName,
                ...result,
                data: chordData
            };
        }
    }

    return bestMatch;
}

/**
 * Chord simplification map: maps complex chords to simpler alternatives
 */
const CHORD_SIMPLIFICATION = {
    // 7th chords → basic triads
    'G7': 'G', 'D7': 'D', 'A7': 'A', 'E7': 'E', 'C7': 'C', 'F7': 'F', 'B7': 'B',
    'Am7': 'Am', 'Em7': 'Em', 'Dm7': 'Dm', 'Bm7': 'Bm', 'Fm7': 'Fm',
    'Cmaj7': 'C', 'Gmaj7': 'G', 'Dmaj7': 'D', 'Amaj7': 'A', 'Fmaj7': 'F',

    // Diminished → minor equivalent
    'Bdim': 'Bm', 'Bdim7': 'Bm', 'Cdim': 'Cm', 'Ddim': 'Dm',

    // Suspended → major equivalent
    'Dsus2': 'D', 'Dsus4': 'D', 'Asus2': 'A', 'Asus4': 'A',
    'Gsus2': 'G', 'Gsus4': 'G', 'Csus2': 'C', 'Csus4': 'C',

    // Add chords → basic triads
    'Cadd9': 'C', 'Gadd9': 'G', 'Dadd9': 'D', 'Aadd9': 'A',

    // Extended jazz → simpler versions
    'Cmaj9': 'Cmaj7', 'Am9': 'Am7', 'Dm9': 'Dm7', 'G13': 'G7',
    'C6': 'C', 'Am6': 'Am',

    // Bar chord alternatives
    'F#m': 'Em', 'C#m': 'Am', 'Bb': 'A',
};

/**
 * Get a difficulty-appropriate version of a chord
 * If the chord is too complex for the difficulty level, returns a simpler alternative
 */
export function getChordForDifficulty(chordName, maxDifficulty) {
    if (!chordName) return null;

    const chordData = CHORD_LIBRARY[chordName];

    // If chord doesn't exist in library, return as-is
    if (!chordData) return { chord: chordName, notes: [], isSimplified: false, original: chordName };

    // If chord is at or below difficulty level, return original
    if (chordData.difficulty <= maxDifficulty) {
        return {
            chord: chordName,
            notes: chordData.notes,
            guitar: chordData.guitar,
            piano: chordData.piano,
            isSimplified: false,
            original: chordName
        };
    }

    // Need to simplify - find an appropriate alternative
    let simplified = chordName;
    let iterations = 0;

    // Keep simplifying until we find one at or below difficulty level
    while (iterations < 5) {
        const simpler = CHORD_SIMPLIFICATION[simplified];
        if (!simpler) break;

        simplified = simpler;
        const simplerData = CHORD_LIBRARY[simplified];

        if (simplerData && simplerData.difficulty <= maxDifficulty) {
            return {
                chord: simplified,
                notes: simplerData.notes,
                guitar: simplerData.guitar,
                piano: simplerData.piano,
                isSimplified: true,
                original: chordName
            };
        }
        iterations++;
    }

    // Fallback: find the closest basic chord based on root note
    const rootNote = chordName.match(/^[A-G][#b]?/)?.[0];
    if (rootNote) {
        // Try major, then minor
        const majorChord = CHORD_LIBRARY[rootNote];
        if (majorChord && majorChord.difficulty <= maxDifficulty) {
            return {
                chord: rootNote,
                notes: majorChord.notes,
                guitar: majorChord.guitar,
                piano: majorChord.piano,
                isSimplified: true,
                original: chordName
            };
        }

        const minorChord = CHORD_LIBRARY[`${rootNote}m`];
        if (minorChord && minorChord.difficulty <= maxDifficulty) {
            return {
                chord: `${rootNote}m`,
                notes: minorChord.notes,
                guitar: minorChord.guitar,
                piano: minorChord.piano,
                isSimplified: true,
                original: chordName
            };
        }
    }

    // Last resort: return C major
    const cMajor = CHORD_LIBRARY['C'];
    return {
        chord: 'C',
        notes: cMajor.notes,
        guitar: cMajor.guitar,
        piano: cMajor.piano,
        isSimplified: true,
        original: chordName
    };
}

export default CHORD_LIBRARY;
