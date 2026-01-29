import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Card } from "antd";
import api from "../api/axios";

export default function ResetPasswordConfirm() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await api.post(`/password-reset-confirm/${uid}/${token}/`, { password: values.password });
      message.success("Password updated! Please login.");
      navigate("/login/worker"); // or a generic login choice
    } catch (err) {
      message.error("Link invalid or expired.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card title="Set New Password" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="New Password" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Reset Password
          </Button>
        </Form>
      </Card>
    </div>
  );
}