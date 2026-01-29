import  { useState, useEffect } from 'react';
import { Drawer, Form, Input, Select, Button, message, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const EditProfileDrawer = ({ visible, onClose, initialData, onUpdate }: any) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_BASE_URL;

  // Synchronize form with initialData when it changes or drawer opens
  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [visible, initialData, form]);

  const onFinish = async (values: any) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('worker_type', values.worker_type || '');
    formData.append('experience', values.experience || '');
    formData.append('location', values.location || '');
    formData.append('kin_name', values.kin_name || '');
    formData.append('kin_phone', values.kin_phone || '');
    formData.append('expected_salary', values.expected_salary || '');

    // FIX: Check for the file object correctly in Ant Design Upload structure
    if (values.passport_img && values.passport_img.fileList && values.passport_img.fileList[0]) {
      formData.append('passport_img', values.passport_img.fileList[0].originFileObj);
    }

    await axios.patch(`${API}/api/worker/dashboard/update_profile/`, formData, {
      headers: { 
        Authorization: `Token ${token}`,
        'Content-Type': 'multipart/form-data' 
      }
    });

    message.success("Profile updated successfully!");
    onUpdate(); // This triggers fetchProfile in the parent
    onClose();
  } catch (err) {
    message.error("Failed to update profile.");
  } finally {
    setLoading(false);
  }
};
  return (
    <Drawer
      title="Edit My Job Profile"
      placement="right"
      size={window.innerWidth > 500 ? 450 : '100%'}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => form.submit()} 
            type="primary" 
            loading={loading} 
            className="bg-[#f3a82f] border-none"
          >
            Save Changes
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="worker_type" label="Job Category" rules={[{ required: true }]}>
          <Select placeholder="Select your primary skill">
            <Option value="nanny">Nanny / Babysitter</Option>
            <Option value="house_cleaner">House Cleaner</Option>
            <Option value="cook">Professional Cook</Option>
            <Option value="gardener">Gardener</Option>
          </Select>
        </Form.Item>

        <Form.Item name="experience" label="Years of Experience">
          <Select>
            <Option value="none">No experience yet</Option>
            <Option value="less_year">Less than 1 year</Option>
            <Option value="1_3yr">1 - 3 years</Option>
            <Option value="3_5yr">3 - 5 years</Option>
            <Option value="5plus_yr">More than 5 years</Option>
          </Select>
        </Form.Item>

        <Form.Item name="expected_salary" label="Expected Salary" rules={[{ required: true }]}>
          <Input placeholder="Ksh 15,000" />
        </Form.Item>

        <Form.Item name="location" label="Current Residential Area" rules={[{ required: true }]}>
          <Input placeholder="e.g. Kilimani, Nairobi" />
        </Form.Item>

        <Form.Item name="kin_name" label="Next of Kin Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Mary Jane (Mother)" />
        </Form.Item>

        <Form.Item name="kin_phone" label="Next of Kin Phone Number" rules={[{ required: true }]}>
          <Input placeholder="e.g. 0712345678" inputMode="numeric" />
        </Form.Item>

        <Form.Item 
        name="passport_img" // Changed from passport_image to passport_img
        label="Update Passport Image"
        >
        <Upload 
            maxCount={1} 
            beforeUpload={() => false} 
            listType="picture"
        >
            <Button icon={<UploadOutlined />} block>Click to Upload Photo</Button>
        </Upload>
        </Form.Item>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-700 text-xs">
          <strong>Security Note:</strong> To change your Full Name or ID Number, please contact support. These fields are locked for verification security.
        </div>
      </Form>
    </Drawer>
  );
};

export default EditProfileDrawer;