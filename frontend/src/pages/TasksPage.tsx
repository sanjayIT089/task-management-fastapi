import { Alert, Button, Card, Empty, Input, Select, Space, Typography, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AxiosError } from "axios";

import { createTask, deleteTask, fetchTasks, updateTask } from "../api/tasks";
import { TaskFormModal } from "../components/TaskFormModal";
import { TaskTable } from "../components/TaskTable";
import type { Task, TaskPriority, TaskStatus } from "../types";

interface TaskFormValues {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
}

export function TasksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "due_date">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const offset = (page - 1) * pageSize;

  const queryKey = useMemo(
    () => ["tasks", page, pageSize, statusFilter, priorityFilter, searchText, sortBy, sortOrder],
    [page, pageSize, statusFilter, priorityFilter, searchText, sortBy, sortOrder]
  );

  const tasksQuery = useQuery({
    queryKey,
    queryFn: () =>
      fetchTasks({
        offset,
        limit: pageSize,
        status: statusFilter,
        priority: priorityFilter,
        titleSearch: searchText || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      message.success("Task created");
      setIsFormOpen(false);
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      setFormError(error.response?.data?.detail ?? "Failed to create task. Please check your input and try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: number; payload: TaskFormValues }) => updateTask(taskId, payload),
    onSuccess: () => {
      message.success("Task updated");
      setIsFormOpen(false);
      setEditingTask(null);
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      setFormError(error.response?.data?.detail ?? "Failed to update task. Please check your input and try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      message.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      message.error("Failed to delete task. Please try again.");
    },
  });

  const tasks = tasksQuery.data?.items ?? [];
  const total = tasksQuery.data?.total ?? 0;
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Tasks
        </Typography.Title>
        <Button
          type="primary"
          disabled={isMutating}
          onClick={() => {
            setEditingTask(null);
            setFormError(null);
            setIsFormOpen(true);
          }}
        >
          New Task
        </Button>
      </div>
      <Space wrap size="middle">
        <Select<TaskStatus>
          allowClear
          placeholder="Filter by status"
          style={{ width: 180 }}
          value={statusFilter}
          options={[
            { label: "todo", value: "todo" },
            { label: "in_progress", value: "in_progress" },
            { label: "done", value: "done" },
          ]}
          onChange={(value) => {
            setPage(1);
            setStatusFilter(value);
          }}
        />
        <Select<TaskPriority>
          allowClear
          placeholder="Filter by priority"
          style={{ width: 180 }}
          value={priorityFilter}
          options={[
            { label: "low", value: "low" },
            { label: "medium", value: "medium" },
            { label: "high", value: "high" },
          ]}
          onChange={(value) => {
            setPage(1);
            setPriorityFilter(value);
          }}
        />
        <Input.Search
          allowClear
          placeholder="Search by title"
          style={{ width: 280 }}
          onSearch={(value) => {
            setPage(1);
            setSearchText(value.trim());
          }}
        />
      </Space>

      {tasksQuery.isError ? (
        <Alert
          type="error"
          message="Failed to load tasks"
          description="Please try again in a moment."
          showIcon
          action={
            <Button size="small" onClick={() => tasksQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : null}

      <Card bodyStyle={{ padding: 0 }}>
        <TaskTable
          tasks={tasks}
          loading={tasksQuery.isLoading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(nextSortBy, nextSortOrder) => {
            setPage(1);
            setSortBy(nextSortBy);
            setSortOrder(nextSortOrder);
          }}
          onEdit={(task) => {
            setEditingTask(task);
            setFormError(null);
            setIsFormOpen(true);
          }}
          onDelete={(taskId) => deleteMutation.mutate(taskId)}
          deleting={deleteMutation.isPending}
        />
      </Card>
      {!tasksQuery.isLoading && !tasksQuery.isError && tasks.length === 0 ? (
        <Card>
          <Empty description="No tasks found. Create your first task to get started." />
        </Card>
      ) : null}
      <TaskFormModal
        open={isFormOpen}
        loading={createMutation.isPending || updateMutation.isPending}
        title={editingTask ? "Edit Task" : "Create Task"}
        error={formError}
        initialValues={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description ?? "",
                status: editingTask.status,
                priority: editingTask.priority,
                due_date: editingTask.due_date,
              }
            : undefined
        }
        onCancel={() => {
          setIsFormOpen(false);
          setEditingTask(null);
          setFormError(null);
        }}
        onSubmit={(values: TaskFormValues) => {
          setFormError(null);
          if (editingTask) {
            updateMutation.mutate({ taskId: editingTask.id, payload: values });
            return;
          }
          createMutation.mutate(values);
        }}
      />
    </Space>
  );
}
