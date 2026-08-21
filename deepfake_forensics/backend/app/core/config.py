import os


def env_float(name: str, default: float) -> float:
    """Reads a float from the environment, falling back to `default`."""
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


class Settings:
    PROJECT_NAME: str = "Universal Deepfake Forensics System"
    API_V1_STR: str = "/api/v1"
    ALLOWED_ORIGINS: list = ["*"]

    # Layer 4 detector mode: "auto" | "pretrained" | "heuristic".
    # Docker deployments default to heuristic-only (no torch dependency).
    LAYER4_MODE: str = os.getenv("LAYER4_MODE", "auto")
    LAYER4_MODEL_NAME: str = os.getenv("LAYER4_MODEL_NAME", "umm-maybe/AI-image-detector")

settings = Settings()
