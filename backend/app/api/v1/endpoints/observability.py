from fastapi import APIRouter

from app.core.observability import metrics
from app.schemas.observability import ObservabilityResponse

router = APIRouter(tags=["Observability"])


@router.get("/observability", response_model=ObservabilityResponse)
def observability_snapshot() -> ObservabilityResponse:
    # Lightweight endpoint for take-home projects. In production, use this data
    # as a source for metrics exporters (CloudWatch/Prometheus/OpenTelemetry).
    return ObservabilityResponse(**metrics.snapshot())
