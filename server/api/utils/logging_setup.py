import io
import logging
import os
import sys
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path
from typing import Optional


_ORIGINAL_STDOUT = sys.stdout
_ORIGINAL_STDERR = sys.stderr


class _StreamToLogger(io.TextIOBase):
    def __init__(self, logger: logging.Logger, level: int) -> None:
        self.logger = logger
        self.level = level
        self._buffer = ""

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
    log_file = log_dir_path / "backend.log"

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    console_handler = logging.StreamHandler(_ORIGINAL_STDOUT)
    console_handler.setFormatter(formatter)

    file_handler = TimedRotatingFileHandler(
        filename=str(log_file),
        when="midnight",
        interval=1,
        backupCount=30,
        encoding="utf-8",
    )
    file_handler.suffix = "%Y-%m-%d"
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
