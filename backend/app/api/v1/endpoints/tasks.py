from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import (
    SortOrder,
    TaskCreate,
    TaskListResponse,
    TaskPriority,
    TaskRead,
    TaskSortBy,
    TaskStatus,
    TaskUpdate,
)
from app.services.task_service import (
    create_task,
    delete_task,
    get_task_by_id,
    list_tasks,
    update_task,
)
from app.services.audit_service import record_task_audit_event

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task_endpoint(
    payload: TaskCreate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskRead:
    task = create_task(db=db, owner_id=current_user.id, payload=payload)
    background_tasks.add_task(
        record_task_audit_event,
        "task_created",
        {
            "task_id": task.id,
            "owner_id": current_user.id,
            "status": task.status.value,
            "priority": task.priority.value,
        },
    )
    return TaskRead.model_validate(task)


@router.get("", response_model=TaskListResponse)
def list_tasks_endpoint(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    offset: Annotated[int, Query(ge=0, le=10000)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    status_filter: TaskStatus | None = None,
    priority_filter: TaskPriority | None = None,
    title_search: Annotated[str | None, Query(min_length=1, max_length=200)] = None,
    sort_by: TaskSortBy = TaskSortBy.CREATED_AT,
    sort_order: SortOrder = SortOrder.DESC,
) -> TaskListResponse:
    tasks, total = list_tasks(
        db=db,
        owner_id=current_user.id,
        offset=offset,
        limit=limit,
        status_filter=status_filter,
        priority_filter=priority_filter,
        title_search=title_search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return TaskListResponse(
        items=[TaskRead.model_validate(task) for task in tasks],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{task_id}", response_model=TaskRead)
def get_task_endpoint(
    task_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskRead:
    task = get_task_by_id(db=db, owner_id=current_user.id, task_id=task_id)
    return TaskRead.model_validate(task)


@router.patch("/{task_id}", response_model=TaskRead)
def update_task_endpoint(
    task_id: int,
    payload: TaskUpdate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TaskRead:
    existing_task = get_task_by_id(db=db, owner_id=current_user.id, task_id=task_id)
    old_status = existing_task.status
    task = update_task(db=db, owner_id=current_user.id, task_id=task_id, payload=payload)
    if payload.status is not None and task.status != old_status:
        background_tasks.add_task(
            record_task_audit_event,
            "task_status_updated",
            {
                "task_id": task.id,
                "owner_id": current_user.id,
                "from_status": old_status.value,
                "to_status": task.status.value,
            },
        )
    return TaskRead.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(
    task_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    delete_task(db=db, owner_id=current_user.id, task_id=task_id)
