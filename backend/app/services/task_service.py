from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task import SortOrder, TaskCreate, TaskSortBy, TaskUpdate

ALLOWED_STATUS_TRANSITIONS: dict[TaskStatus, set[TaskStatus]] = {
    TaskStatus.TODO: {TaskStatus.IN_PROGRESS},
    TaskStatus.IN_PROGRESS: {TaskStatus.DONE},
    TaskStatus.DONE: {TaskStatus.IN_PROGRESS},
}


def _validate_status_transition(current: TaskStatus, new: TaskStatus) -> None:
    if new == current:
        return
    if new not in ALLOWED_STATUS_TRANSITIONS.get(current, set()):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Invalid status transition: '{current.value}' -> '{new.value}'. "
                "Allowed transitions: todo -> in_progress, in_progress -> done, done -> in_progress."
            ),
        )


def create_task(db: Session, owner_id: int, payload: TaskCreate) -> Task:
    task = Task(owner_id=owner_id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def list_tasks(
    db: Session,
    owner_id: int,
    offset: int = 0,
    limit: int = 20,
    status_filter: TaskStatus | None = None,
    priority_filter: TaskPriority | None = None,
    title_search: str | None = None,
    sort_by: TaskSortBy = TaskSortBy.CREATED_AT,
    sort_order: SortOrder = SortOrder.DESC,
) -> tuple[list[Task], int]:
    query = db.query(Task).filter(Task.owner_id == owner_id)

    if status_filter is not None:
        query = query.filter(Task.status == status_filter)
    if priority_filter is not None:
        query = query.filter(Task.priority == priority_filter)
    if title_search:
        query = query.filter(Task.title.ilike(f"%{title_search}%"))

    total = query.count()

    sort_column = Task.created_at if sort_by == TaskSortBy.CREATED_AT else Task.due_date
    sort_expression = sort_column.asc() if sort_order == SortOrder.ASC else sort_column.desc()

    items = query.order_by(sort_expression).offset(offset).limit(limit).all()
    return items, total


def get_task_by_id(db: Session, owner_id: int, task_id: int) -> Task:
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == owner_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def update_task(db: Session, owner_id: int, task_id: int, payload: TaskUpdate) -> Task:
    task = get_task_by_id(db=db, owner_id=owner_id, task_id=task_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] is not None:
        _validate_status_transition(task.status, update_data["status"])

    for field, value in update_data.items():
        setattr(task, field, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, owner_id: int, task_id: int) -> None:
    task = get_task_by_id(db=db, owner_id=owner_id, task_id=task_id)
    db.delete(task)
    db.commit()
