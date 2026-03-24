import { Alert, Button, DatePicker, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";

import type { TaskPriority, TaskStatus } from "../types";

interface TaskFormValues {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
}

interface TaskFormModalProps {
  open: boolean;
  loading?: boolean;
  initialValues?: TaskFormValues;
  error?: string | null;
  title: string;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

export function TaskFormModal({
  open,
  loading,
  initialValues,
  error,
  title,
  onCancel,
  onSubmit,
}: TaskFormModalProps) {
  const [form] = Form.useForm<TaskFormValues>();

  return (
    <Modal
      title={title}
      open={open}
      onCancel={() => {
        if (!loading) onCancel();
      }}
      footer={null}
      maskClosable={!loading}
      closable={!loading}
      keyboard={!loading}
      destroyOnClose
      afterOpenChange={(isOpen) => {
        if (isOpen) {
          form.setFieldsValue(
            initialValues ?? {
              title: "",
              description: "",
              status: "todo",
              priority: "medium",
              due_date: null,
            }
          );
        }
      }}
    > 
      {error ? <Alert type="error" message={error} style={{ marginBottom: 12 }} showIcon /> : null}
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSubmit(values)}
        initialValues={initialValues}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true, message: "Title is required" }]}>
          <Input maxLength={200} disabled={loading} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} maxLength={2000} disabled={loading} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true, message: "Status is required" }]}>
          <Select
            options={[
              { label: "todo", value: "todo" },
              { label: "in_progress", value: "in_progress" },
              { label: "done", value: "done" },
            ]}
            disabled={loading}
          />
        </Form.Item>
        <Form.Item name="priority" label="Priority" rules={[{ required: true, message: "Priority is required" }]}>
          <Select
            options={[
              { label: "low", value: "low" },
              { label: "medium", value: "medium" },
              { label: "high", value: "high" },
            ]}
            disabled={loading}
          />
        </Form.Item>
        <Form.Item
          name="due_date"
          label="Due Date"
          getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
          getValueFromEvent={(date) => (date ? date.toISOString() : null)}
        >
          <DatePicker showTime style={{ width: "100%" }} disabled={loading} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} disabled={loading} block>
          Save
        </Button>
      </Form>
    </Modal>
  );
}
