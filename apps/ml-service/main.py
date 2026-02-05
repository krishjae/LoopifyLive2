"""
Loopify Live - ML Service
Audio analysis API using librosa and FastAPI
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from analyzers.audio_features import extract_audio_features
from analyzers.scale_detector import detect_scale, detect_raga
from analyzers.emotion_genre import classify_emotion, classify_genre
from analyzers.chord_detector import detect_chords

app = FastAPI(title="Loopify Live ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for analysis results
analysis_cache = {}
chord_cache = {}


class AnalyzeRequest(BaseModel):
    file_path: str
    file_id: str


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ml-service"}


@app.post("/analyze")
async def analyze_audio(request: AnalyzeRequest):
    """Complete audio analysis: scale, raga, emotion, genre"""
    
    if not os.path.exists(request.file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    try:
        # Extract audio features
        features = extract_audio_features(request.file_path)
        
        # Run all analyzers
        scale_result = detect_scale(features)
        raga_result = detect_raga(features)
        emotion_result = classify_emotion(features)
        genre_result = classify_genre(features)
        
        analysis = {
            "tempo": features.get("tempo", 120),
            "key": scale_result.get("key", "C"),
            "scale": scale_result.get("scale", "C Major"),
            "raga": raga_result.get("raga", "Unknown"),
            "emotion": emotion_result.get("emotion", "Neutral"),
            "genre": genre_result.get("genre", "Unknown"),
            "confidence": {
                "scale": scale_result.get("confidence", 0.8),
                "raga": raga_result.get("confidence", 0.6),
                "emotion": emotion_result.get("confidence", 0.75),
                "genre": genre_result.get("confidence", 0.7)
            },
            "features": {
                "spectralCentroid": features.get("spectral_centroid", 2000),
                "zeroCrossingRate": features.get("zero_crossing_rate", 0.1),
                "rmsEnergy": features.get("rms_energy", 0.2)
            },
            "explanation": generate_explanation(scale_result, raga_result, emotion_result, genre_result, features)
        }
        
        # Cache the result
        analysis_cache[request.file_id] = analysis
        
        # Also detect chords for learning mode
        chords = detect_chords(features)
        chord_cache[request.file_id] = chords
        
        return analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chords/{file_id}")
async def get_chords(file_id: str):
    """Get chord progression for a previously analyzed file"""
    
    if file_id in chord_cache:
        return chord_cache[file_id]
    
    # Return mock chords if not cached
    return {
        "progression": ["C", "G", "Am", "F"],
        "timeline": [
            {"chord": "C", "startTime": 0, "duration": 4, "notes": ["C", "E", "G"]},
            {"chord": "G", "startTime": 4, "duration": 4, "notes": ["G", "B", "D"]},
            {"chord": "Am", "startTime": 8, "duration": 4, "notes": ["A", "C", "E"]},
            {"chord": "F", "startTime": 12, "duration": 4, "notes": ["F", "A", "C"]}
        ],
        "key": "C",
        "difficulty": "beginner"
    }


def generate_explanation(scale, raga, emotion, genre, features):
    """Generate a human-readable explanation of the analysis"""
    
    tempo = features.get("tempo", 120)
    
    explanation_parts = [
        f"This track is in {scale.get('scale', 'C Major')} with a tempo of approximately {int(tempo)} BPM.",
    ]
    
    if raga.get("confidence", 0) > 0.5:
        explanation_parts.append(
            f"The melodic patterns suggest characteristics of {raga.get('raga', 'Unknown')} raga in Indian classical music."
        )
    
    explanation_parts.append(
        f"The overall mood is {emotion.get('emotion', 'neutral').lower()}, "
        f"which is common in {genre.get('genre', 'pop').lower()} music."
    )
    
    spectral = features.get("spectral_centroid", 2000)
    if spectral > 3000:
        explanation_parts.append("The bright tonal quality indicates significant high-frequency content.")
    elif spectral < 1500:
        explanation_parts.append("The warm tonal quality suggests emphasis on lower frequencies.")
    
    return " ".join(explanation_parts)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
