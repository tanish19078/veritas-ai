import pytest

from app.core.config import env_float
from app.core.orchestrator import ForensicsOrchestrator, MIN_ACTIVE_WEIGHT


@pytest.fixture(scope="module")
def orchestrator():
    return ForensicsOrchestrator()


ALL_LAYER_KEYS = [
    "metadata",
    "biology_rppg",
    "math_forensics",
    "ai_model",
    "physics",
    "early_signature",
    "ela",
]


class TestAggregate:
    def test_weights_renormalize_over_active_layers(self, orchestrator):
        scores = {"math_forensics": 0.2, "ai_model": 0.8}
        final, dominant, sufficient = orchestrator._aggregate(scores)

        expected = (0.2 * 0.25 + 0.8 * 0.25) / 0.5
        assert final == pytest.approx(expected)
        assert sufficient is True

    def test_abstaining_layers_do_not_dilute(self, orchestrator):
        all_active = {key: 0.6 for key in ALL_LAYER_KEYS}
        subset = {"math_forensics": 0.6, "ai_model": 0.6}

        final_all, _, _ = orchestrator._aggregate(all_active)
        final_subset, _, _ = orchestrator._aggregate(subset)

        assert final_all == pytest.approx(final_subset)

    def test_metadata_alone_is_insufficient_evidence(self, orchestrator):
        final, dominant, sufficient = orchestrator._aggregate({"metadata": 0.9})

        assert sufficient is False
        assert dominant == []

    def test_dominant_signal_counts_as_sufficient_evidence(self, orchestrator):
        final, dominant, sufficient = orchestrator._aggregate(
            {"early_signature": 0.95, "metadata": 0.0}
        )

        assert "early_signature" in dominant
        assert final >= 0.95
        assert sufficient is True

    def test_no_signals_yields_zero_score(self, orchestrator):
        final, dominant, sufficient = orchestrator._aggregate({})

        assert final == 0.0
        assert dominant == []
        assert sufficient is False

    def test_min_active_weight_is_meaningful(self):
        # Guard against someone zeroing out the evidence threshold.
        assert 0.0 < MIN_ACTIVE_WEIGHT <= 0.5


class TestVerdict:
    def test_verdict_thresholds(self, orchestrator):
        assert orchestrator._verdict(0.95) == "AI-Generated"
        assert orchestrator._verdict(0.76) == "AI-Generated"
        assert orchestrator._verdict(0.75) == "Suspicious / Inconclusive"
        assert orchestrator._verdict(0.41) == "Suspicious / Inconclusive"
        assert orchestrator._verdict(0.4) == "Real"
        assert orchestrator._verdict(0.0) == "Real"


class TestScoreHelper:
    def test_score_none_for_missing_or_invalid(self, orchestrator):
        assert orchestrator._score(None) is None
        assert orchestrator._score({}) is None
        assert orchestrator._score({"score": None}) is None
        assert orchestrator._score({"score": "not-a-number"}) is None

    def test_score_casts_numbers(self, orchestrator):
        assert orchestrator._score({"score": 0.5}) == 0.5
        assert orchestrator._score({"score": "0.25"}) == 0.25


class TestEmptyLayer:
    def test_empty_layer_abstains_without_anomaly(self, orchestrator):
        result = orchestrator._empty_layer("decode failed")

        assert result["score"] is None
        assert result["anomalies"] == []
        assert result["details"]["reason"] == "decode failed"


def test_env_float_parses_valid_values(monkeypatch):
    monkeypatch.setenv("TEST_FLOAT", "1.5")
    assert env_float("TEST_FLOAT", 0.0) == 1.5


def test_env_float_falls_back_on_garbage(monkeypatch):
    monkeypatch.setenv("TEST_FLOAT", "garbage")
    assert env_float("TEST_FLOAT", 0.7) == 0.7


def test_env_float_falls_back_when_unset(monkeypatch):
    monkeypatch.delenv("TEST_FLOAT", raising=False)
    assert env_float("TEST_FLOAT", 0.3) == 0.3
