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


def test_analyze_video_endpoint(client, faceless_video):
    with open(faceless_video, "rb") as video_file:
        response = client.post(
            "/api/v1/analyze",
            files={"file": ("clip.mp4", video_file, "video/mp4")},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["media_type"] == "video"
    # ELA is image-only and must stay disabled for videos.
    assert data["ela_url"] is None


def test_history_pagination_and_limit(client):
    first_page = client.get("/api/v1/history?limit=1&skip=0")
    second_page = client.get("/api/v1/history?limit=1&skip=1")

    assert first_page.status_code == second_page.status_code == 200
    assert len(first_page.json()) <= 1

    all_records = client.get("/api/v1/history?limit=50").json()
    if len(all_records) >= 2:
        assert first_page.json()[0]["id"] == all_records[0]["id"]
        assert second_page.json()[0]["id"] == all_records[1]["id"]
