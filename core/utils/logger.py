import logging
import sys
from typing import Callable, List, Optional
from datetime import datetime

# Global callbacks for WebSocket log broadcasting
_log_listeners: List[Callable[[dict], None]] = []

def register_log_listener(callback: Callable[[dict], None]):
    if callback not in _log_listeners:
        _log_listeners.append(callback)

def unregister_log_listener(callback: Callable[[dict], None]):
    if callback in _log_listeners:
        _log_listeners.remove(callback)

class WebSocketBroadcastHandler(logging.Handler):
    """Logging handler that forwards records to registered WebSocket listeners."""
    def emit(self, record: logging.LogRecord):
        try:
            msg = self.format(record)
            payload = {
                "timestamp": datetime.fromtimestamp(record.created).strftime("%H:%M:%S.%f")[:-3],
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
                "formatted": msg
            }
            for listener in list(_log_listeners):
                try:
                    listener(payload)
                except Exception:
                    pass
        except Exception:
            self.handleError(record)

_ws_handler = WebSocketBroadcastHandler()
_ws_formatter = logging.Formatter("[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s", datefmt="%H:%M:%S")
_ws_handler.setFormatter(_ws_formatter)

def get_logger(name: str = "etl") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(
            logging.Formatter("[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s", datefmt="%H:%M:%S")
        )
        logger.addHandler(console_handler)
        logger.addHandler(_ws_handler)
    elif _ws_handler not in logger.handlers:
        logger.addHandler(_ws_handler)
    return logger
