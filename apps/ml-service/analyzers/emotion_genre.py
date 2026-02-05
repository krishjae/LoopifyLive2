"""
Emotion and Genre Classification
Uses spectral features and MFCCs for classification
"""

import numpy as np
from typing import Dict


# Simplified emotion profiles based on audio features
EMOTION_PROFILES = {
    "Joyful": {"tempo_range": (100, 140), "spectral_high": True, "energy_high": True},
    "Energetic": {"tempo_range": (120, 180), "spectral_high": True, "energy_high": True},
    "Peaceful": {"tempo_range": (60, 90), "spectral_high": False, "energy_high": False},
    "Melancholic": {"tempo_range": (60, 100), "spectral_high": False, "energy_high": False},
    "Romantic": {"tempo_range": (70, 110), "spectral_high": False, "energy_high": False},
    "Intense": {"tempo_range": (100, 160), "spectral_high": True, "energy_high": True},
    "Dreamy": {"tempo_range": (70, 100), "spectral_high": False, "energy_high": False},
    "Uplifting": {"tempo_range": (100, 130), "spectral_high": True, "energy_high": True},
}

# Simplified genre profiles based on audio features
GENRE_PROFILES = {
    "Pop": {"tempo_range": (100, 130), "mfcc_pattern": "balanced"},
    "Rock": {"tempo_range": (100, 140), "mfcc_pattern": "high_energy"},
    "Classical": {"tempo_range": (60, 120), "mfcc_pattern": "complex"},
    "Jazz": {"tempo_range": (80, 140), "mfcc_pattern": "complex"},
    "Electronic": {"tempo_range": (120, 150), "mfcc_pattern": "synthetic"},
    "Folk": {"tempo_range": (80, 120), "mfcc_pattern": "acoustic"},
    "Hip-Hop": {"tempo_range": (80, 115), "mfcc_pattern": "percussive"},
    "Fusion": {"tempo_range": (90, 130), "mfcc_pattern": "mixed"},
}


def classify_emotion(features: Dict) -> Dict:
    """
    Classify the emotional content of audio based on features
    """
    tempo = features.get("tempo", 120)
    spectral_centroid = features.get("spectral_centroid", 2000)
    rms_energy = features.get("rms_energy", 0.15)
    
    is_spectral_high = spectral_centroid > 2500
    is_energy_high = rms_energy > 0.2
    
    best_emotion = "Neutral"
    best_score = 0
    
    for emotion, profile in EMOTION_PROFILES.items():
        score = 0
        tempo_min, tempo_max = profile["tempo_range"]
        
        # Tempo fit
        if tempo_min <= tempo <= tempo_max:
            score += 0.4
        elif abs(tempo - tempo_min) < 20 or abs(tempo - tempo_max) < 20:
            score += 0.2
        
        # Spectral characteristics
        if profile["spectral_high"] == is_spectral_high:
            score += 0.3
        
        # Energy level
        if profile["energy_high"] == is_energy_high:
            score += 0.3
        
        if score > best_score:
            best_score = score
            best_emotion = emotion
    
    return {
        "emotion": best_emotion,
        "confidence": float(min(1.0, best_score + 0.3))  # Boost confidence a bit
    }


def classify_genre(features: Dict) -> Dict:
    """
    Classify the genre of audio based on features
    """
    tempo = features.get("tempo", 120)
    spectral_centroid = features.get("spectral_centroid", 2000)
    spectral_bandwidth = features.get("spectral_bandwidth", 2000)
    zcr = features.get("zero_crossing_rate", 0.1)
    rms_energy = features.get("rms_energy", 0.15)
    mfcc_mean = features.get("mfcc_mean", [0] * 13)
    
    # Feature-based classification heuristics
    is_complex = spectral_bandwidth > 2500
    is_synthetic = zcr < 0.08 and spectral_centroid > 3000
    is_percussive = zcr > 0.1 and rms_energy > 0.2
    is_acoustic = spectral_centroid < 2000 and not is_synthetic
    is_high_energy = rms_energy > 0.25
    
    best_genre = "Pop"
    best_score = 0
    
    for genre, profile in GENRE_PROFILES.items():
        score = 0
        tempo_min, tempo_max = profile["tempo_range"]
        
        # Tempo fit
        if tempo_min <= tempo <= tempo_max:
            score += 0.3
        
        # MFCC pattern matching (simplified)
        pattern = profile["mfcc_pattern"]
        
        if pattern == "complex" and is_complex:
            score += 0.4
        elif pattern == "synthetic" and is_synthetic:
            score += 0.4
        elif pattern == "percussive" and is_percussive:
            score += 0.4
        elif pattern == "acoustic" and is_acoustic:
            score += 0.4
        elif pattern == "high_energy" and is_high_energy:
            score += 0.4
        elif pattern == "balanced":
            score += 0.2
        elif pattern == "mixed":
            score += 0.25
        
        if score > best_score:
            best_score = score
            best_genre = genre
    
    return {
        "genre": best_genre,
        "confidence": float(min(1.0, best_score + 0.4))
    }
