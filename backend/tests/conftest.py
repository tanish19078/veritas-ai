import os
import sys

import cv2
import numpy as np
import pytest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


def _write_photo_like_image(path, size=(640, 480), seed=42):
    """High-frequency noise + gradient, similar to a natural camera photo."""
    rng = np.random.default_rng(seed)
    img = rng.integers(0, 256, size=(size[1], size[0], 3), dtype=np.uint8)
    img = cv2.GaussianBlur(img, (3, 3), 0)
    gradient = np.tile(np.linspace(30, 220, size[0], dtype=np.uint8), (size[1], 1))
    img[:, :, 0] = ((img[:, :, 0].astype(np.int32) + gradient.astype(np.int32)) // 2).astype(np.uint8)
    cv2.imwrite(str(path), img)
    return str(path)


def _write_smooth_image(path, size=(640, 480)):
    """Oversmoothed gradient with almost no high-frequency content."""
    x = np.linspace(0, 255, size[0], dtype=np.float32)
    y = np.linspace(0, 255, size[1], dtype=np.float32)
    xx, yy = np.meshgrid(x, y)
    img = np.stack([(xx + yy) / 2.0] * 3, axis=-1).astype(np.uint8)
    img = cv2.GaussianBlur(img, (31, 31), 0)
    cv2.imwrite(str(path), img)
    return str(path)


def _write_test_video(path, frames=90, fps=30.0, size=(320, 240)):
    """Synthetic video of a pulsing blob (no faces)."""
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(str(path), fourcc, fps, size)
    if not writer.isOpened():
        return False
    for i in range(frames):
        frame = np.full((size[1], size[0], 3), 60, dtype=np.uint8)
        pulse = int(40 * (0.5 + 0.5 * np.sin(2 * np.pi * 1.2 * i / fps)))
        cv2.circle(frame, (size[0] // 2, size[1] // 2), 50, (0, 80 + pulse, 0), -1)
        writer.write(frame)
    writer.release()
    return True


@pytest.fixture
def photo_like_image(tmp_path):
    return _write_photo_like_image(tmp_path / "photo_like.jpg")


@pytest.fixture
def smooth_image(tmp_path):
    return _write_smooth_image(tmp_path / "smooth.png")


@pytest.fixture
def faceless_video(tmp_path):
    path = tmp_path / "faceless.mp4"
    if not _write_test_video(path):
        pytest.skip("cv2.VideoWriter could not open mp4v codec on this system")
    return str(path)
