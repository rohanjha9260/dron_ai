"""
In-Memory Thread-Safe TTL Cache

Provides an in-memory FIFO TTL cache with deepcopy protection to avoid
cache corruption via reference leaks in multi-threaded application workers.
"""

import copy
import threading
import time
from typing import Any, Optional


class InMemoryTTLCache:
    """Thread-safe in-memory FIFO TTL cache with deepcopy protection."""

    def __init__(self, ttl_seconds: int = 600, maxsize: int = 128):
        self._ttl_seconds = ttl_seconds
        self._maxsize = maxsize
        self._cache: dict = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve a value from the cache if present and not expired.
        Returns a deep copy of the cached object to prevent mutation.
        """
        now = time.monotonic()
        with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return None
            expires_at, value = entry
            if expires_at < now:
                self._cache.pop(key, None)
                return None
            return copy.deepcopy(value)

    def set(self, key: str, value: Any) -> None:
        """
        Store a value in the cache with the configured TTL.
        Safely refreshes existing keys and evicts the oldest entry
        in FIFO order when maxsize is exceeded.
        """
        with self._lock:
            if key in self._cache:
                self._cache.pop(key)
            elif len(self._cache) >= self._maxsize:
                self._cache.pop(next(iter(self._cache)))
            self._cache[key] = (time.monotonic() + self._ttl_seconds, copy.deepcopy(value))

    def clear(self) -> None:
        """Evict all items from the cache."""
        with self._lock:
            self._cache.clear()

    def __len__(self) -> int:
        """Return the current number of cached items."""
        with self._lock:
            return len(self._cache)
