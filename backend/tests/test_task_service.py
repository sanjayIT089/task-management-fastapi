import pytest
from fastapi import HTTPException, status

from app.models.task import TaskStatus
from app.services.task_service import _validate_status_transition


def test_allows_valid_status_transitions() -> None:
    _validate_status_transition(TaskStatus.TODO, TaskStatus.IN_PROGRESS)
    _validate_status_transition(TaskStatus.IN_PROGRESS, TaskStatus.DONE)
    _validate_status_transition(TaskStatus.DONE, TaskStatus.IN_PROGRESS)


def test_allows_noop_status_transition() -> None:
    _validate_status_transition(TaskStatus.TODO, TaskStatus.TODO)


def test_rejects_invalid_status_transition() -> None:
    with pytest.raises(HTTPException) as exc:
        _validate_status_transition(TaskStatus.TODO, TaskStatus.DONE)

    assert exc.value.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    assert "Invalid status transition" in str(exc.value.detail)
