import React from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function LoginPage(){
  const navigate = useNavigate()
  const onFinish = async (values) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      const data = await res.json()
      if (!res.ok) return message.error(data.error || 'Login failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user || null))
      message.success('Đăng nhập thành công')
      navigate('/')
    } catch (err) {
      message.error('Lỗi mạng')
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>
      <Card title="HSG Login" style={{width:360}}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{required:true}]}> <Input/> </Form.Item>
          <Form.Item name="password" label="Password" rules={[{required:true}]}> <Input.Password/> </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Login</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
