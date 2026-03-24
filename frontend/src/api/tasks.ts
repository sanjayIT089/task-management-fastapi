import { apiClient } from "./client";
import type { Task, TaskListResponse, TaskPriority, TaskStatus } from "../types";

export interface ListTaskParams {
  offset: number;
  limit: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  titleSearch?: string;
  sortBy?: "created_at" | "due_date";
  sortOrder?: "asc" | "desc";
}

export async function fetchTasks(params: ListTaskParams): Promise<TaskListResponse> {
  const query = {
    offset: params.offset,
    limit: params.limit,
    status_filter: params.status,
    priority_filter: params.priority,
    title_search: params.titleSearch,
    sort_by: params.sortBy,
    sort_order: params.sortOrder,
  };
  const { data } = await apiClient.get<TaskListResponse>("/tasks", { params: query });
  return data;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await apiClient.post<Task>("/tasks", payload);
  return data;
}

export async function updateTask(taskId: number, payload: Partial<CreateTaskPayload>): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${taskId}`, payload);
  return data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`);
}
