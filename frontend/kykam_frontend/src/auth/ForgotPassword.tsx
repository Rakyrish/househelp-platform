import { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import api from "../api/axios";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      await api.post("/password-reset-request/", values);
      message.success("Check your email for the reset link!");
    } catch (err) {
      message.error("Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card title="Forgot Password" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Enter your registered email" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Send Reset Link
          </Button>
        </Form>
      </Card>
    </div>
  );
}
