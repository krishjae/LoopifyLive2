import express from 'express';
import cors from 'cors';
import audioRoutes from './routes/audio.js';
import tracksRoutes from './routes/tracks.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/audio', audioRoutes);
app.use('/api/tracks', tracksRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🎵 Loopify Live API running on http://localhost:${PORT}`);
});
