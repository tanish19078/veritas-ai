import os

import pytest

from app.core.orchestrator import ForensicsOrchestrator

VALID_VERDICTS = {"Real", "Suspicious / Inconclusive", "AI-Generated", "Inconclusive"}


@pytest.fixture(scope="module")
def orchestrator():
    return ForensicsOrchestrator()


def _assert_result_structure(results):
    assert results["verdict"] in VALID_VERDICTS
    assert 0.0 <= results["confidence"] <= 1.0
    assert isinstance(results["layer_scores"], dict)
    for value in results["layer_scores"].values():
        assert 0.0 <= value <= 1.0
    for key in ["metadata", "math", "ai_model", "physics", "early_signature"]:
        assert key in results["details"]
    assert results["explanation"]


def test_photo_like_image_pipeline(orchestrator, photo_like_image):
    results = orchestrator.analyze_media(photo_like_image)
    _assert_result_structure(results)

    # Abstaining layers must not appear in layer_scores.
    assert "biology_rppg" not in results["layer_scores"]
    assert "physics" not in results["layer_scores"]

    # ELA runs on still images and produces a preview file.
    assert results["ela_url"]
    ela_file = os.path.join(
        os.path.dirname(photo_like_image), os.path.basename(results["ela_url"])
    )
    assert os.path.exists(ela_file)


def test_smooth_image_pipeline(orchestrator, smooth_image):
    results = orchestrator.analyze_media(smooth_image)
    _assert_result_structure(results)


def test_garbage_file_is_inconclusive(orchestrator, tmp_path):
    path = tmp_path / "garbage.jpg"
    path.write_bytes(b"this is not image data" * 50)

    results = orchestrator.analyze_media(str(path))

    # Only metadata votes (weight 0.10 < MIN_ACTIVE_WEIGHT), so the verdict
    # must be inconclusive instead of a confident "Real".
    assert results["verdict"] == "Inconclusive"
    assert "math_forensics" not in results["layer_scores"]
    assert "ai_model" not in results["layer_scores"]
    assert "ela" not in results["layer_scores"]


def test_missing_file_returns_error(orchestrator, tmp_path):
    results = orchestrator.analyze_media(str(tmp_path / "does_not_exist.jpg"))
    assert results == {"error": "File not found"}


def test_faceless_video_pipeline(orchestrator, faceless_video):
    results = orchestrator.analyze_media(faceless_video)
    _assert_result_structure(results)

    # No faces detected -> biology abstains; ELA is skipped for videos.
    assert "biology_rppg" not in results["layer_scores"]
    assert "ela" not in results["layer_scores"]
    assert results["ela_url"] is None
