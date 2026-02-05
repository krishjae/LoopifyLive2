"""
Audio Feature Extraction using librosa
"""

import numpy as np

try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False


def extract_audio_features(file_path: str) -> dict:
    """
    Extract audio features from an audio file.
    Returns a dictionary of features used by other analyzers.
    """
    
    if not LIBROSA_AVAILABLE:
        # Return mock features if librosa is not installed
        return generate_mock_features()
    
    try:
        # Load audio file
        y, sr = librosa.load(file_path, sr=22050, duration=120)  # Limit to 2 minutes
        
        # Tempo and beat tracking
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        
        # Pitch/chroma features for scale detection
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        
        # Spectral features
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
        spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
        spectral_bandwidth = np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))
        
        # Zero crossing rate
        zcr = np.mean(librosa.feature.zero_crossing_rate(y))
        
        # RMS energy
        rms = np.mean(librosa.feature.rms(y=y))
        
        # MFCCs for genre/emotion classification
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfccs, axis=1)
        mfcc_std = np.std(mfccs, axis=1)
        
        # Pitch contour
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_mean = np.mean(pitches[pitches > 0]) if np.any(pitches > 0) else 440
        
        # Onset detection for rhythm analysis
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        
        return {
            "tempo": float(tempo),
            "chroma_mean": chroma_mean.tolist(),
            "spectral_centroid": float(spectral_centroid),
            "spectral_rolloff": float(spectral_rolloff),
            "spectral_bandwidth": float(spectral_bandwidth),
            "zero_crossing_rate": float(zcr),
            "rms_energy": float(rms),
            "mfcc_mean": mfcc_mean.tolist(),
            "mfcc_std": mfcc_std.tolist(),
            "pitch_mean": float(pitch_mean),
            "onset_strength": float(np.mean(onset_env)),
            "duration": float(len(y) / sr),
            "sample_rate": sr
        }
        
    except Exception as e:
        print(f"Error extracting features: {e}")
        return generate_mock_features()


def generate_mock_features():
    """Generate mock features when librosa is unavailable"""
    
    # Simulated chroma for C Major
    chroma_c_major = [1.0, 0.2, 0.8, 0.2, 0.9, 0.7, 0.2, 0.9, 0.2, 0.7, 0.2, 0.3]
    
    return {
        "tempo": 120.0,
        "chroma_mean": chroma_c_major,
        "spectral_centroid": 2200.0,
        "spectral_rolloff": 4500.0,
        "spectral_bandwidth": 2000.0,
        "zero_crossing_rate": 0.08,
        "rms_energy": 0.15,
        "mfcc_mean": [0.0] * 13,
        "mfcc_std": [1.0] * 13,
        "pitch_mean": 440.0,
        "onset_strength": 0.5,
        "duration": 180.0,
        "sample_rate": 22050
    }
