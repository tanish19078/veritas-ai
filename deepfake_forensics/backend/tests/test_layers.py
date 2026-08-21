import os

import numpy as np

from app.layers.layer1_metadata import MetadataAnalyzer
from app.layers.layer2_biology import BiologicalAnalyzer
from app.layers.layer4_hybrid_model import AIModelAnalyzer
from app.layers.layer7_ela import ELAAnalyzer


def test_pulse_band_detects_cardiac_sinusoid():
    fps = 30.0
    t = np.arange(300) / fps
    # 1.2 Hz pulse (~72 BPM) on a slow drift, realistic amplitude.
    signal = 100.0 + 0.02 * t + 0.8 * np.sin(2 * np.pi * 1.2 * t)

    peak_hz, snr = BiologicalAnalyzer._pulse_band_metrics(signal, fps)

    assert peak_hz is not None
    assert abs(peak_hz - 1.2) < 0.15
    assert snr >= BiologicalAnalyzer.PULSE_SNR_THRESHOLD


def test_pulse_band_rejects_white_noise():
    rng = np.random.default_rng(7)
    signal = rng.normal(100.0, 0.5, size=300)

    peak_hz, snr = BiologicalAnalyzer._pulse_band_metrics(signal, 30.0)

    # Pure noise has no dominant cardiac peak; if a peak exists at all its
    # concentration must fall below the detection threshold.
    assert peak_hz is None or snr < BiologicalAnalyzer.PULSE_SNR_THRESHOLD


def test_pulse_band_flat_signal_has_no_peak():
    signal = np.full(300, 100.0)

    peak_hz, snr = BiologicalAnalyzer._pulse_band_metrics(signal, 30.0)

    assert peak_hz is None and snr is None


def test_metadata_layer_caps_score_and_reports_c2pa(photo_like_image):
    analyzer = MetadataAnalyzer()
    results = analyzer.analyze(photo_like_image)

    assert 0.0 <= results["score"] <= 0.4
    assert "c2pa" in results["details"]
    assert results["details"]["provenance_verified"] is False


def test_ela_layer_produces_preview_and_score(photo_like_image, tmp_path):
    analyzer = ELAAnalyzer()
    results = analyzer.analyze(photo_like_image, str(tmp_path))

    assert results["ela_image_path"].startswith("/uploads/ela_")
    expected_file = tmp_path / os.path.basename(results["ela_image_path"])
    assert expected_file.exists()
    assert results["score"] is not None
    assert 0.0 <= results["score"] <= 1.0


class _FakePretrainedPipeline:
    def __call__(self, pil_image, top_k=None):
        return [
            {"label": "artificial", "score": 0.9},
            {"label": "real", "score": 0.1},
        ]


def test_layer4_pretrained_score_used(photo_like_image):
    analyzer = AIModelAnalyzer()
    analyzer.mode = "pretrained"
    analyzer._load_pretrained = lambda: _FakePretrainedPipeline()

    score = analyzer.analyze(photo_like_image)

    assert abs(score - 0.9) < 1e-6
    assert analyzer.get_last_details()["method"] == "pretrained"


def test_layer4_auto_mode_merges_heuristic_stats(photo_like_image):
    analyzer = AIModelAnalyzer()
    analyzer.mode = "auto"
    analyzer._load_pretrained = lambda: _FakePretrainedPipeline()

    score = analyzer.analyze(photo_like_image)

    assert abs(score - 0.9) < 1e-6
    details = analyzer.get_last_details()
    assert details["mode"] == "auto"
    assert "heuristic_stats" in details


def test_layer4_falls_back_to_heuristic_when_pretrained_missing(photo_like_image):
    analyzer = AIModelAnalyzer()
    analyzer.mode = "auto"
    analyzer._load_pretrained = lambda: None

    score = analyzer.analyze(photo_like_image)

    assert 0.0 <= score <= 1.0
    assert analyzer.get_last_details()["method"] == "blur_entropy_color_heuristic"


def test_layer4_forced_heuristic_mode(photo_like_image):
    analyzer = AIModelAnalyzer()
    analyzer.mode = "heuristic"
    analyzer._load_pretrained = lambda: _FakePretrainedPipeline()

    score = analyzer.analyze(photo_like_image)

    assert 0.0 <= score <= 1.0
    assert analyzer.get_last_details()["method"] == "blur_entropy_color_heuristic"


def _synthetic_bgr_means(fps=30.0, seconds=10.0, pulse_hz=1.2):
    """Face-ROI channel means with a cardiac-band modulation on all channels."""
    t = np.arange(int(fps * seconds)) / fps
    pulse = 0.8 * np.sin(2 * np.pi * pulse_hz * t)
    drift = 0.01 * t
    b = 100.0 + pulse * 0.6 + drift
    g = 110.0 + pulse + drift
    r = 120.0 + pulse * 0.7 + drift
    return np.stack([b, g, r], axis=1)


def test_chrom_signal_recovers_cardiac_pulse():
    fps = 30.0
    means = _synthetic_bgr_means(pulse_hz=1.2)

    signal = BiologicalAnalyzer._chrom_pulse_signal(means, fps)
    peak_hz, snr = BiologicalAnalyzer._pulse_band_metrics(signal, fps)

    assert peak_hz is not None
    assert abs(peak_hz - 1.2) < 0.15
    assert snr >= BiologicalAnalyzer.PULSE_SNR_THRESHOLD


def test_chrom_waveform_is_normalized_and_bounded():
    means = _synthetic_bgr_means()

    waveform = BiologicalAnalyzer._downsample_waveform(
        BiologicalAnalyzer._chrom_pulse_signal(means, 30.0)
    )

    assert 1 <= len(waveform) <= 120
    assert all(0.0 <= v <= 1.0 for v in waveform)


def test_lighting_direction_variance_low_for_coherent_gradient():
    from app.layers.layer5_physics import PhysicsAnalyzer

    x = np.linspace(0, 255, 256, dtype=np.float32)
    gradient = np.tile(x, (256, 1)).astype(np.uint8)

    variance = PhysicsAnalyzer._quadrant_direction_variance(gradient)

    assert variance < 0.2


def test_lighting_direction_variance_high_for_conflicting_gradients():
    from app.layers.layer5_physics import PhysicsAnalyzer

    x = np.linspace(0, 255, 128, dtype=np.float32)
    left = np.tile(x, (128, 1))
    right = np.tile(x[::-1], (128, 1))
    conflicting = np.concatenate([left, right], axis=1).astype(np.uint8)

    variance = PhysicsAnalyzer._quadrant_direction_variance(conflicting)

    assert variance > 0.5


def test_glint_error_symmetry_math():
    from app.layers.layer5_physics import PhysicsAnalyzer

    assert PhysicsAnalyzer._glint_position_error((0.3, 0.4), (0.7, 0.4)) < 0.05
    assert PhysicsAnalyzer._glint_position_error((0.3, 0.4), (0.4, 0.4)) > 0.15
    assert PhysicsAnalyzer._glint_position_error((0.3, 0.4), (0.7, 0.9)) > 0.15


def test_physics_layer_runs_and_reports_details(photo_like_image):
    from app.layers.layer5_physics import PhysicsAnalyzer

    results = PhysicsAnalyzer().analyze(photo_like_image)

    assert "lighting" in results["details"]
    assert "eye_glint" in results["details"]
    assert results["score"] is None or 0.0 <= results["score"] <= 1.0
