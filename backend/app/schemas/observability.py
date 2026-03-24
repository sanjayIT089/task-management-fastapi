from pydantic import BaseModel


class ObservabilityResponse(BaseModel):
    uptime_seconds: int
    started_at: str
    last_request_at: str | None
    total_requests: int
    path_counts: dict[str, int]
    status_counts: dict[str, int]
