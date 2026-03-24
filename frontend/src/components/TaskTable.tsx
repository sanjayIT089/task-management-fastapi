import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SortOrder } from "antd/es/table/interface";

import type { Task, TaskPriority, TaskStatus } from "../types";

const statusColor: Record<TaskStatus, string> = {
  todo: "default",
  in_progress: "processing",
  done: "success",
};

const priorityColor: Record<TaskPriority, string> = {
  low: "green",
  medium: "gold",
  high: "red",
};

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  sortBy: "created_at" | "due_date";
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: "created_at" | "due_date", sortOrder: "asc" | "desc") => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  deleting?: boolean;
}

export function TaskTable({
  tasks,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
  deleting,
}: TaskTableProps) {
  const mapSortOrder = (value: "asc" | "desc"): SortOrder => (value === "asc" ? "ascend" : "descend");
  const columns: ColumnsType<Task> = [
    { title: "Title", dataIndex: "title" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: TaskStatus) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (priority: TaskPriority) => <Tag color={priorityColor[priority]}>{priority}</Tag>,
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      sorter: true,
      sortOrder: sortBy === "due_date" ? mapSortOrder(sortOrder) : null,
      render: (dueDate: string | null) => (dueDate ? new Date(dueDate).toLocaleString() : "-"),
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      sorter: true,
      sortOrder: sortBy === "created_at" ? mapSortOrder(sortOrder) : null,
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, task) => (
        <Space>
          <Button size="small" onClick={() => onEdit(task)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete task"
            description="Are you sure you want to delete this task?"
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: deleting }}
            disabled={deleting}
            onConfirm={() => onDelete(task.id)}
          >
            <Button size="small" danger loading={deleting}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={tasks}
      loading={loading}
      locale={{ emptyText: "No tasks found" }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        onChange: onPageChange,
      }}
      onChange={(_, __, sorter) => {
        if (Array.isArray(sorter) || !sorter.order) {
          onSortChange("created_at", "desc");
          return;
        }
        const nextSortBy = sorter.field === "due_date" ? "due_date" : "created_at";
        const nextSortOrder = sorter.order === "ascend" ? "asc" : "desc";
        onSortChange(nextSortBy, nextSortOrder);
      }}
    />
  );
}
