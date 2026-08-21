import os

import numpy as np

from app.layers.layer1_metadata import MetadataAnalyzer
from app.layers.layer2_biology import BiologicalAnalyzer
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
