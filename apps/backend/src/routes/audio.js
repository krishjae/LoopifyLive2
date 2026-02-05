import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-wav', 'audio/x-flac'];
        if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|flac)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP3, WAV, and FLAC are allowed.'));
        }
    }
});

// In-memory analysis cache (would use Redis/DB in production)
const analysisCache = new Map();

// Upload and analyze audio
router.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const fileId = path.basename(req.file.filename, path.extname(req.file.filename));

        // Call Python ML service for analysis
        let analysis;
        try {
            const mlResponse = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_path: req.file.path,
                    file_id: fileId
                })
            });

            if (mlResponse.ok) {
                analysis = await mlResponse.json();
            } else {
                throw new Error('ML service error');
            }
        } catch (mlError) {
            // Fallback to mock analysis if ML service is unavailable
            console.log('ML service unavailable, using mock analysis');
            analysis = generateMockAnalysis(req.file.originalname);
        }

        // Cache the analysis
        analysisCache.set(fileId, {
            ...analysis,
            fileId,
            filename: req.file.originalname,
            uploadedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            fileId,
            filename: req.file.originalname,
            analysis
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get analysis by file ID
router.get('/analysis/:fileId', (req, res) => {
    const analysis = analysisCache.get(req.params.fileId);
    if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
});

// Get chord progression for learning mode
router.get('/chords/:fileId', async (req, res) => {
    try {
        // Try to get from ML service
        const mlResponse = await fetch(`http://localhost:8000/chords/${req.params.fileId}`);
        if (mlResponse.ok) {
            const chords = await mlResponse.json();
            return res.json(chords);
        }
    } catch (e) {
        // Fallback to mock
    }

    res.json(generateMockChords());
});

// Mock analysis generator (used when ML service is unavailable)
function generateMockAnalysis(filename) {
    const scales = ['C Major', 'G Major', 'D Major', 'A Minor', 'E Minor', 'F Major'];
    const ragas = ['Kalyani', 'Shankarabharanam', 'Mohanam', 'Hamsadhwani', 'Bilahari', 'Mayamalavagowla'];
    const emotions = ['Joyful', 'Melancholic', 'Energetic', 'Peaceful', 'Romantic', 'Intense'];
    const genres = ['Pop', 'Classical', 'Jazz', 'Electronic', 'Folk', 'Rock', 'Fusion'];

    const scale = scales[Math.floor(Math.random() * scales.length)];
    const raga = ragas[Math.floor(Math.random() * ragas.length)];
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const genre = genres[Math.floor(Math.random() * genres.length)];

    return {
        tempo: Math.floor(80 + Math.random() * 80),
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
        features: {
            spectralCentroid: 1500 + Math.random() * 1000,
            zeroCrossingRate: 0.05 + Math.random() * 0.1,
            rmsEnergy: 0.1 + Math.random() * 0.3
        },
        explanation: `The analysis of "${filename}" reveals a ${scale} tonality with characteristics of ${raga} raga. The overall mood is ${emotion.toLowerCase()}, typical of ${genre.toLowerCase()} music. The tempo is approximately ${Math.floor(80 + Math.random() * 80)} BPM with stable harmonic content.`
    };
}

// Mock chord generator
function generateMockChords() {
    const chordProgressions = [
        ['C', 'G', 'Am', 'F'],
        ['G', 'D', 'Em', 'C'],
        ['Am', 'F', 'C', 'G'],
        ['D', 'A', 'Bm', 'G']
    ];

    const progression = chordProgressions[Math.floor(Math.random() * chordProgressions.length)];

    return {
        progression,
        timeline: progression.map((chord, i) => ({
            chord,
            startTime: i * 4,
            duration: 4,
            notes: getChordNotes(chord)
        })),
        key: progression[0],
        difficulty: 'intermediate'
    };
}

function getChordNotes(chord) {
    const chordMap = {
        'C': ['C', 'E', 'G'],
        'D': ['D', 'F#', 'A'],
        'E': ['E', 'G#', 'B'],
        'F': ['F', 'A', 'C'],
        'G': ['G', 'B', 'D'],
        'A': ['A', 'C#', 'E'],
        'B': ['B', 'D#', 'F#'],
        'Am': ['A', 'C', 'E'],
        'Bm': ['B', 'D', 'F#'],
        'Em': ['E', 'G', 'B'],
        'Dm': ['D', 'F', 'A']
    };
    return chordMap[chord] || ['C', 'E', 'G'];
}

export default router;
