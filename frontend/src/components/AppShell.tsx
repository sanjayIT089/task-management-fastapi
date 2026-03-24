import { Button, Layout, Typography } from "antd";

import { useAuth } from "../hooks/useAuth";

const { Header, Content } = Layout;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="header">
        <Typography.Title level={4} style={{ color: "white", margin: 0 }}>
          Task Manager
        </Typography.Title>
        <Button onClick={logout}>Logout</Button>
      </Header>
      <Content className="content">{children}</Content>
    </Layout>
  );
}
