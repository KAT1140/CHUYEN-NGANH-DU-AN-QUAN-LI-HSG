import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import AppCard from '../components/UI/AppCard';

// Địa chỉ API của bạn
const REGISTER_API_URL = '/api/auth/register'; 

const DangKi = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý gửi form và kết nối API
  const handleSubmit = async (values) => {
    setIsLoading(true);
    message.loading({ content: 'Đang xử lý đăng ký...', key: 'register' });

    try {
      const response = await fetch(REGISTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        message.error({ 
          content: data.message || 'Đăng ký thất bại. Vui lòng thử lại.', 
          key: 'register' 
        });
        return;
      }
      
      // Xử lý thành công
      message.success({ 
        content: 'Đăng ký thành công! Vui lòng đăng nhập.', 
        key: 'register' 
      });
      
      // Reset form và chuyển hướng
      form.resetFields();
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      console.error('Đăng ký thất bại:', error);
      message.error({ 
        content: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.', 
        key: 'register' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout 
      title="Đăng ký HSG Manager" 
      subtitle="Tạo tài khoản mới để truy cập hệ thống"
    >
      <div style={{display:'flex', justifyContent:'center', paddingTop: '2rem'}}>
        <AppCard 
          title="Đăng ký tài khoản" 
          variant="glass"
          style={{width: 400, maxWidth: '100%'}}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            {/* Trường Tên người dùng */}
            <Form.Item 
              name="name" 
              label="Tên người dùng" 
              rules={[
                { required: true, message: 'Vui lòng nhập tên người dùng!' },
                { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
              ]}
            >
              <Input size="large" placeholder="Nhập tên của bạn" />
            </Form.Item>

            {/* Trường Email */}
            <Form.Item 
              name="email" 
              label="Email" 
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input size="large" placeholder="Nhập email của bạn" />
            </Form.Item>

            {/* Trường Mật khẩu */}
            <Form.Item 
              name="password" 
              label="Mật khẩu" 
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password size="large" placeholder="Nhập mật khẩu" />
            </Form.Item>

            {/* Nút Đăng ký */}
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={isLoading}
                style={{width:'100%'}}
              >
                Đăng Ký
              </Button>
            </Form.Item>
            
            {/* Liên kết đăng nhập */}
            <Form.Item style={{textAlign: 'center', marginBottom: 0}}>
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </Form.Item>
          </Form>
        </AppCard>
      </div>
    </AppLayout>
  );
};

export default DangKi;