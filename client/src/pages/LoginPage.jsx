import React from 'react'
import { Card, Form, Input, Button, message } from 'antd'
// ĐÃ SỬA LỖI: Thêm Link vào import
import { useNavigate, Link } from 'react-router-dom' 
import { setToken, setUser } from '../utils/auth' 

export default function LoginPage(){
  const navigate = useNavigate()
  
  const onFinish = async (values) => {
    try {
      message.loading({ content: 'Đang đăng nhập...', key: 'loginLoading' });
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        message.error({ content: data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email/Mật khẩu.', key: 'loginLoading' });
        return 
      }
      
      // Lưu token và thông tin người dùng bằng utility functions
      setToken(data.token) 
      setUser(data.user || null) 
      
      message.success({ content: 'Đăng nhập thành công', key: 'loginLoading', duration: 1 });
      navigate('/dashboard') 
      
    } catch (err) {
      message.error({ content: 'Lỗi mạng hoặc server không phản hồi.', key: 'loginLoading' });
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>
      <Card title="HSG Login" style={{width:360}}>
        <Form onFinish={onFinish} layout="vertical">
          {/* TRƯỜNG EMAIL */}
          <Form.Item name="email" label="Email" rules={[{required:true, message: 'Vui lòng nhập Email!'}]}> 
            <Input/> 
          </Form.Item>
          
          {/* TRƯỜNG MẬT KHẨU  */}
          <Form.Item name="password" label="Mật khẩu" rules={[{required:true, message: 'Vui lòng nhập Mật khẩu!'}]}> 
            <Input.Password/> 
          </Form.Item>
          
          {/* NÚT SUBMIT */}
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{width:'100%'}}>Đăng Nhập</Button>
          </Form.Item>
          
          {/* LIÊN KẾT ĐĂNG KÝ */}
          <Form.Item style={{textAlign: 'center', marginBottom: 0}}>
            Chưa có tài khoản? <Link to="/dangki">Đăng ký ngay</Link>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}