import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Space } from 'antd' // Thêm Space
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard' 
import Teams from './pages/Teams'         
import Home from './pages/Home'           
import DangKi from './pages/dangki.jsx'   
import { getToken, getUser, removeToken } from './utils/auth'

const { Header, Content } = Layout

// Component này chứa logic cần hook useNavigate
export default function MainContent(){ 
  const [user, setUser] = useState(getUser())
  const navigate = useNavigate() 

  useEffect(()=>{
    setUser(getUser())
  }, [])

  function logout(){
    removeToken();
    setUser(null);
    navigate('/')
  }

  function Protected({ children }){
    if (!getToken()) return <Navigate to="/login" replace />
    return children
  }

  return (
      <Layout>
        <Header style={{display:'flex', alignItems:'center'}}>
          <div style={{color:'#fff', fontWeight:700, marginRight:24}}>HSG</div>
          <Menu theme="dark" mode="horizontal" selectable={false} style={{flex:1}}>
            <Menu.Item key="1"><Link to="/">Home</Link></Menu.Item>
            <Menu.Item key="2"><Link to="/dashboard">Dashboard</Link></Menu.Item>
            <Menu.Item key="3"><Link to="/teams">Teams</Link></Menu.Item>
          </Menu>
          {user ? (
            <div style={{color:'#fff'}}>
              <span style={{marginRight:12}}>{user.name}</span>
              <Button size="small" onClick={logout}>Logout</Button>
            </div>
          ) : (
            // THÊM Link tới Trang Đăng ký
            <Space> 
              <Link to="/dangki">
                <Button>Đăng Ký</Button> 
              </Link>
              <Link to="/login">
                <Button type="primary">Đăng Nhập</Button>
              </Link>
            </Space>
          )}
        </Header>
        <Content style={{padding:24}}>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/dangki" element={<DangKi/>} />
            <Route path="/dashboard" element={<Protected><Dashboard/></Protected>} />
            <Route path="/teams" element={<Protected><Teams/></Protected>} />
            <Route path="*" element={<h1 style={{textAlign: 'center', marginTop: 100}}>404 - Trang không tồn tại</h1>} />
          </Routes>
        </Content>
      </Layout>
  )
}