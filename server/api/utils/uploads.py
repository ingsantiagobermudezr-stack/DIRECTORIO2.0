import os
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def ensure_upload_dir(base_dir: str, category: str) -> Path:
    target = Path(base_dir) / category
    target.mkdir(parents=True, exist_ok=True)
    return target


def _safe_extension(filename: str) -> str:
    ext = Path(filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Formato no soportado. Use: .jpg, .jpeg, .png o .webp",
        )
    return ext


async def save_upload_file(upload: UploadFile, destination_dir: Path) -> str:
    ext = _safe_extension(upload.filename or "")
    content = await upload.read()

    if not content:
        raise HTTPException(status_code=400, detail="Archivo vacío")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 5MB")

    file_name = f"{uuid4().hex}{ext}"
    file_path = destination_dir / file_name

    with open(file_path, "wb") as f:
        f.write(content)

    return file_name


def build_public_url(file_name: str, category: str) -> str:
    return f"/uploads/{category}/{file_name}"


def get_upload_root() -> str:
    custom = os.getenv("UPLOADS_DIR")
    if custom:
        return custom

    # server/uploads
    current = Path(__file__).resolve()
    return str(current.parents[2] / "uploads")
