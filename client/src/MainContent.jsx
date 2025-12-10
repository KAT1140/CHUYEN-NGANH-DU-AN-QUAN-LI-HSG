import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Menu, Dropdown, Button } from 'antd'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Teams from './pages/Teams'
import Home from './pages/Home'
import { getToken, getUser, removeToken } from './utils/auth'

const { Header, Content } = Layout

// Component này chứa logic cần hook useNavigate
export default function MainContent(){ 
  const [user, setUser] = useState(getUser())
  const navigate = useNavigate() // useNavigate() giờ nằm bên trong Router context

  useEffect(()=>{
    setUser(getUser())
  }, [])

  function logout(){
    removeToken();
    setUser(null);
    navigate('/')
  }

  function Protected({ children }){
    if (!getToken()) return <Navigate to="/" replace />
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
            // Sửa lại đường dẫn Link để chuyển đến trang Login
            <Link to="/login"><Button type="primary">Login</Button></Link>
          )}
        </Header>
        <Content style={{padding:24}}>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/dashboard" element={<Protected><Dashboard/></Protected>} />
            <Route path="/teams" element={<Protected><Teams/></Protected>} />
          </Routes>
        </Content>
      </Layout>
  )
}