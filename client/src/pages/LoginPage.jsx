import React, { useEffect } from 'react'
import { Card, Form, Input, Button, message, Checkbox } from 'antd'
// ĐÃ SỬA LỖI: Thêm Link vào import
import { useNavigate, Link } from 'react-router-dom' 
import { setToken, setUser } from '../utils/auth' 

export default function LoginPage(){
  const navigate = useNavigate()
  const [form] = Form.useForm()
  
  // Load email đã lưu khi component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail')
    const rememberMe = localStorage.getItem('rememberMe') === 'true'
    
    if (savedEmail && rememberMe) {
      form.setFieldsValue({ 
        email: savedEmail,
        remember: true
      })
    }
  }, [form])
  
  const onFinish = async (values) => {
    try {
      message.loading({ content: 'Đang đăng nhập...', key: 'loginLoading' });
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        message.error({ content: data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email/Mật khẩu.', key: 'loginLoading' });
        return 
      }
      
      // Lưu hoặc xóa thông tin đăng nhập dựa trên checkbox
      if (values.remember) {
        localStorage.setItem('savedEmail', values.email)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('savedEmail')
        localStorage.removeItem('rememberMe')
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
        <Form form={form} onFinish={onFinish} layout="vertical">
          {/* TRƯỜNG EMAIL */}
          <Form.Item name="email" label="Email" rules={[{required:true, message: 'Vui lòng nhập Email!'}]}> 
            <Input/> 
          </Form.Item>
          
          {/* TRƯỜNG MẬT KHẨU  */}
          <Form.Item name="password" label="Mật khẩu" rules={[{required:true, message: 'Vui lòng nhập Mật khẩu!'}]}> 
            <Input.Password/> 
          </Form.Item>
          
          {/* CHECKBOX LƯU THÔNG TIN ĐĂNG NHẬP */}
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Lưu thông tin đăng nhập</Checkbox>
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