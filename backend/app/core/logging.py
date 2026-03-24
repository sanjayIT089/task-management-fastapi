import json
import logging
import time
import uuid

from fastapi import Request, Response

from app.core.observability import metrics

logger = logging.getLogger("app.request")


async def structured_logging_middleware(request: Request, call_next) -> Response:
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)

    log_event = {
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": duration_ms,
    }
    logger.info(json.dumps(log_event))
    metrics.record_request(path=request.url.path, status_code=response.status_code)
    response.headers["x-request-id"] = request_id
    return response
