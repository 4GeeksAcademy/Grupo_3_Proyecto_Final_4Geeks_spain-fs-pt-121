import time

class FxRateCache:
    def __init__(self, ttl_seconds=600):
        self.ttl_seconds = ttl_seconds
        self._store = {}

    def get(self, base):
        base = (base or "").upper().strip()
        item = self._store.get(base)

        if not item:
            return None

        if time.time() > item["expires_at"]:
            del self._store[base]
            return None

        return item["data"]

    def set(self, base, data):
        base = (base or "").upper().strip()
        self._store[base] = {
            "expires_at": time.time() + self.ttl_seconds,
            "data": data
        }