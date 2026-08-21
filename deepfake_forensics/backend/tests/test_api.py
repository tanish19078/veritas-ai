import io

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def _png_bytes():
    from PIL import Image

    buffer = io.BytesIO()
    Image.new("RGB", (64, 64), color=(120, 130, 140)).save(buffer, format="PNG")
    return buffer.getvalue()


def test_analyze_endpoint_returns_verdict(client):
    response = client.post(
        "/api/v1/analyze",
        files={"file": ("test_image.png", io.BytesIO(_png_bytes()), "image/png")},
    )

    assert response.status_code == 200
    data = response.json()
    assert "verdict" in data
    assert "confidence" in data
    assert data["media_type"] == "image"
    assert 0.0 <= data["confidence"] <= 1.0


def test_analyze_rejects_unsupported_type(client):
    response = client.post(
        "/api/v1/analyze",
        files={"file": ("evil.exe", io.BytesIO(b"MZ..."), "application/octet-stream")},
    )

    assert response.status_code == 400


def test_history_returns_typed_records(client):
    response = client.get("/api/v1/history?limit=5")

    assert response.status_code == 200
    records = response.json()
    assert isinstance(records, list)
    for record in records:
        assert set(record) >= {"id", "filename", "verdict", "confidence"}
