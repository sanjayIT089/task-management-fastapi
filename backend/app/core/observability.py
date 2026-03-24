from collections import Counter
from datetime import datetime, timezone
from threading import Lock


class InMemoryMetrics:
    """Lightweight in-process metrics for local/take-home observability.

    In production, these counters would typically be exported to CloudWatch
    custom metrics, Prometheus/Grafana, or OpenTelemetry metrics.
    """

    def __init__(self) -> None:
        self._lock = Lock()
        self.started_at = datetime.now(timezone.utc)
        self.total_requests = 0
        self.path_counts: Counter[str] = Counter()
        self.status_counts: Counter[str] = Counter()
        self.last_request_at: datetime | None = None

    def record_request(self, path: str, status_code: int) -> None:
        with self._lock:
            self.total_requests += 1
            self.path_counts[path] += 1
            self.status_counts[str(status_code)] += 1
            self.last_request_at = datetime.now(timezone.utc)

    def snapshot(self) -> dict:
        with self._lock:
            now = datetime.now(timezone.utc)
            uptime_seconds = int((now - self.started_at).total_seconds())
            return {
                "uptime_seconds": uptime_seconds,
                "started_at": self.started_at.isoformat(),
                "last_request_at": self.last_request_at.isoformat() if self.last_request_at else None,
                "total_requests": self.total_requests,
                "path_counts": dict(self.path_counts),
                "status_counts": dict(self.status_counts),
            }


metrics = InMemoryMetrics()
