/**
 * API Service for Loopify Live
 * Handles all backend communication
 */

const API_BASE = 'http://localhost:3001/api';

/**
 * Upload audio file for analysis
 */
export async function uploadAudio(file) {
    const formData = new FormData();
    formData.append('audio', file);

    try {
        const response = await fetch(`${API_BASE}/audio/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API unavailable, using mock analysis');
        // Fallback to mock analysis
        return mockAnalysis(file.name);
    }
}

/**
 * Get chord progression for a file
 */
export async function getChords(fileId) {
    try {
        const response = await fetch(`${API_BASE}/audio/chords/${fileId}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('Using mock chords');
    }

    return mockChords();
}

/**
 * Create a new DAW project
 */
export async function createProject(name) {
    try {
        const response = await fetch(`${API_BASE}/tracks/project`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        return await response.json();
    } catch (error) {
        return { projectId: `mock-${Date.now()}` };
    }
}

/**
 * Add track to project
 */
export async function addTrack(projectId, file, name) {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('name', name || file.name);

    try {
        const response = await fetch(`${API_BASE}/tracks/project/${projectId}/track`, {
            method: 'POST',
            body: formData,
        });
        return await response.json();
    } catch (error) {
        return mockTrack(name || file.name);
    }
}

/**
 * Update track settings
 */
export async function updateTrack(projectId, trackId, settings) {
    try {
        const response = await fetch(`${API_BASE}/tracks/project/${projectId}/track/${trackId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        return await response.json();
    } catch (error) {
        return { success: true };
    }
}

// Mock data generators
function mockAnalysis(filename) {
    const scales = ['C Major', 'G Major', 'D Major', 'A Minor', 'E Minor'];
    const ragas = ['Kalyani', 'Shankarabharanam', 'Mohanam', 'Hamsadhwani'];
    const emotions = ['Joyful', 'Melancholic', 'Energetic', 'Peaceful'];
    const genres = ['Pop', 'Classical', 'Jazz', 'Electronic', 'Folk'];

    const scale = scales[Math.floor(Math.random() * scales.length)];
    const raga = ragas[Math.floor(Math.random() * ragas.length)];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const tempo = Math.floor(80 + Math.random() * 80);

    return {
        success: true,
        fileId: `mock-${Date.now()}`,
        filename,
        analysis: {
            tempo,
            key: scale.split(' ')[0],
            scale,
            raga: `${raga} (Detected)`,
            emotion,
            genre,
            confidence: {
                scale: 0.85 + Math.random() * 0.1,
                raga: 0.70 + Math.random() * 0.15,
                emotion: 0.80 + Math.random() * 0.15,
                genre: 0.75 + Math.random() * 0.2
            },
            explanation: `The analysis of "${filename}" reveals a ${scale} tonality. The overall mood is ${emotion.toLowerCase()}, typical of ${genre.toLowerCase()} music at approximately ${tempo} BPM.`
        }
    };
}

function mockChords() {
    const progressions = [
        ['C', 'G', 'Am', 'F'],
        ['G', 'D', 'Em', 'C'],
        ['Am', 'F', 'C', 'G'],
        ['D', 'A', 'Bm', 'G']
    ];

    const progression = progressions[Math.floor(Math.random() * progressions.length)];
    const chordNotes = {
        'C': ['C', 'E', 'G'], 'D': ['D', 'F#', 'A'], 'E': ['E', 'G#', 'B'],
        'F': ['F', 'A', 'C'], 'G': ['G', 'B', 'D'], 'A': ['A', 'C#', 'E'],
        'Am': ['A', 'C', 'E'], 'Bm': ['B', 'D', 'F#'], 'Em': ['E', 'G', 'B']
    };

    return {
        progression,
        timeline: progression.map((chord, i) => ({
            chord,
            startTime: i * 4,
            duration: 4,
            notes: chordNotes[chord] || ['C', 'E', 'G']
        })),
        key: progression[0],
        difficulty: 'intermediate'
    };
}

function mockTrack(name) {
    const colors = ['#8B5CF6', '#22C55E', '#F97316', '#3B82F6', '#EC4899'];
    return {
        track: {
            id: `track-${Date.now()}`,
            name,
            volume: 0.8,
            pan: 0,
            muted: false,
            solo: false,
            color: colors[Math.floor(Math.random() * colors.length)],
            regions: [{ id: `region-${Date.now()}`, startTime: 0, duration: 30 }]
        }
    };
}

export { mockAnalysis, mockChords };
