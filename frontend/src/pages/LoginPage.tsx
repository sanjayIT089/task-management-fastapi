import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { login } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (token) => {
      setToken(token);
      navigate("/", { replace: true });
    },
    onError: () => {
      setError("Invalid credentials. Try admin@example.com / admin123");
    },
  });

  const onFinish = (values: LoginFormValues) => {
    setError(null);
    loginMutation.mutate(values);
  };

  return (
    <div className="login-wrap">
      <Card style={{ width: 420 }}>
        <Typography.Title level={3}>Sign In</Typography.Title>
        <Typography.Paragraph type="secondary">
          Demo user: demo@example.com / demo1234
        </Typography.Paragraph>
        {error && <Alert style={{ marginBottom: 16 }} type="error" message={error} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email is required" }]}>
            <Input type="email" disabled={loginMutation.isPending} />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Password is required" }]}>
            <Input.Password disabled={loginMutation.isPending} />
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={loginMutation.isPending} disabled={loginMutation.isPending} block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
