import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Configure multer for track uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `track-${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB for tracks
});

// In-memory track storage (would use DB in production)
const projects = new Map();

// Create new project
router.post('/project', (req, res) => {
    const projectId = uuidv4();
    projects.set(projectId, {
        id: projectId,
        name: req.body.name || 'Untitled Project',
        tracks: [],
        createdAt: new Date().toISOString()
    });
    res.json({ projectId, message: 'Project created' });
});

// Get project
router.get('/project/:projectId', (req, res) => {
    const project = projects.get(req.params.projectId);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
});

// Add track to project
router.post('/project/:projectId/track', upload.single('audio'), (req, res) => {
    const project = projects.get(req.params.projectId);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    if (project.tracks.length >= 12) {
        return res.status(400).json({ error: 'Maximum 12 tracks allowed' });
    }

    const track = {
        id: uuidv4(),
        name: req.body.name || req.file?.originalname || `Track ${project.tracks.length + 1}`,
        filename: req.file?.filename,
        filePath: req.file?.path,
        volume: 0.8,
        pan: 0,
        muted: false,
        solo: false,
        color: getTrackColor(project.tracks.length),
        regions: [{
            id: uuidv4(),
            startTime: 0,
            duration: 30, // Default 30 seconds
            fadeIn: 0,
            fadeOut: 0
        }]
    };

    project.tracks.push(track);
    res.json({ track, message: 'Track added' });
});

// Update track settings
router.patch('/project/:projectId/track/:trackId', (req, res) => {
    const project = projects.get(req.params.projectId);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const track = project.tracks.find(t => t.id === req.params.trackId);
    if (!track) {
        return res.status(404).json({ error: 'Track not found' });
    }

    // Update allowed fields
    const allowedFields = ['name', 'volume', 'pan', 'muted', 'solo', 'regions'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            track[field] = req.body[field];
        }
    }

    res.json({ track, message: 'Track updated' });
});

// Delete track
router.delete('/project/:projectId/track/:trackId', (req, res) => {
    const project = projects.get(req.params.projectId);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const index = project.tracks.findIndex(t => t.id === req.params.trackId);
    if (index === -1) {
        return res.status(404).json({ error: 'Track not found' });
    }

    project.tracks.splice(index, 1);
    res.json({ message: 'Track deleted' });
});

// Helper for track colors
function getTrackColor(index) {
    const colors = [
        '#8B5CF6', '#22C55E', '#F97316', '#3B82F6',
        '#EC4899', '#14B8A6', '#F59E0B', '#6366F1',
        '#EF4444', '#84CC16', '#06B6D4', '#A855F7'
    ];
    return colors[index % colors.length];
}

export default router;
