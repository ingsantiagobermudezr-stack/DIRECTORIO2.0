import io
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional


_ORIGINAL_STDOUT = sys.stdout
_ORIGINAL_STDERR = sys.stderr


class _StreamToLogger(io.TextIOBase):
    def __init__(self, logger: logging.Logger, level: int) -> None:
        self.logger = logger
        self.level = level
        self._buffer = ""


class _DailyDateFileHandler(logging.Handler):
    """Escribe en un archivo con nombre por fecha: backend-YYYY-MM-DD.log."""

    def __init__(self, log_dir: Path, encoding: str = "utf-8") -> None:
        super().__init__()
        self.log_dir = log_dir
        self.encoding = encoding
        self._current_date: str | None = None
        self._stream = None

    def _ensure_stream(self) -> None:
        current_date = datetime.now().strftime("%Y-%m-%d")
        if self._stream is not None and self._current_date == current_date:
            return

        if self._stream is not None:
            try:
                self._stream.close()
            except Exception:
                pass

        file_path = self.log_dir / f"backend-{current_date}.log"
        self._stream = open(file_path, mode="a", encoding=self.encoding)
        self._current_date = current_date

    def emit(self, record: logging.LogRecord) -> None:
        try:
            self._ensure_stream()
            msg = self.format(record)
            self._stream.write(msg + "\n")
            self._stream.flush()
        except Exception:
            self.handleError(record)

    def close(self) -> None:
        try:
            if self._stream is not None:
                self._stream.close()
        finally:
            self._stream = None
            super().close()

    def write(self, message: str) -> int:
        if not message:
            return 0

        self._buffer += message
        while "\n" in self._buffer:
            line, self._buffer = self._buffer.split("\n", 1)
            line = line.strip()
            if line:
                self.logger.log(self.level, line)

        return len(message)

    def flush(self) -> None:
        line = self._buffer.strip()
        if line:
            self.logger.log(self.level, line)
        self._buffer = ""


def configure_daily_logging(logs_dir: Optional[str] = None, level: int = logging.INFO) -> None:
    root_logger = logging.getLogger()
    if getattr(root_logger, "_daily_log_configured", False):
        return

    configured_logs_dir = logs_dir or os.getenv("APP_LOG_DIR")
    if configured_logs_dir:
        log_dir_path = Path(configured_logs_dir).resolve()
    else:
        # server/api/utils/logging_setup.py -> server/logs
        log_dir_path = Path(__file__).resolve().parents[2] / "logs"

    log_dir_path.mkdir(parents=True, exist_ok=True)
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console_handler = logging.StreamHandler(_ORIGINAL_STDOUT)
    console_handler.setFormatter(formatter)

    file_handler = _DailyDateFileHandler(log_dir=log_dir_path, encoding="utf-8")
    file_handler.setFormatter(formatter)

    root_logger.handlers.clear()
    root_logger.setLevel(level)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    # Forzamos propagación a root para capturar logs de librerías/servidor.
    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi", "sqlalchemy"):
        lib_logger = logging.getLogger(logger_name)
        lib_logger.handlers.clear()
        lib_logger.propagate = True

    sys.stdout = _StreamToLogger(logging.getLogger("console.stdout"), logging.INFO)
    sys.stderr = _StreamToLogger(logging.getLogger("console.stderr"), logging.ERROR)

    root_logger._daily_log_configured = True
    logging.getLogger(__name__).info("Logs diarios habilitados en %s", log_dir_path)
