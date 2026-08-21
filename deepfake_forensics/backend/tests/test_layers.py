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
