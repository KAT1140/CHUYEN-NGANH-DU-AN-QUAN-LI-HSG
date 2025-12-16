// File: client/src/MainContent.jsx

import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Space } from 'antd'

// Import các trang
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard' 
import Teams from './pages/Teams'
import Scores from './pages/Scores'         
import Home from './pages/Home'           
import DangKi from './pages/dangki.jsx'
import Evaluations from './pages/Evaluations' // <--- MỚI: Import trang Đánh giá
import Students from './pages/Students'       // <--- MỚI: Import trang Học sinh

import { getToken, getUser, removeToken } from './utils/auth'

const { Header, Content } = Layout

export default function MainContent(){ 
  const [user, setUser] = useState(getUser())
  const navigate = useNavigate() 

  // Kiểm tra quyền: Chỉ hiện menu "Học sinh" nếu không phải là user thường
  const canManage = user && user.role !== 'user';

  // Lắng nghe sự kiện thay đổi đăng nhập/đăng xuất
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getUser()); 
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  function logout(){
    removeToken();
    navigate('/'); // Về trang chủ sau khi đăng xuất
  }

  // Component bảo vệ Route (chưa đăng nhập thì đá về login)
  function Protected({ children }){
    if (!getToken()) return <Navigate to="/login" replace />
    return children
  }

  return (
      <Layout>
        <Header style={{display:'flex', alignItems:'center'}}>
          {/* Logo */}
          <Link to="/" style={{textDecoration:'none', display:'flex', alignItems:'center', marginRight:24}}>
            <div style={{color:'#fff', fontWeight:700, fontSize: 18}}>HSG Manager</div>
          </Link>

          {/* Menu Chính */}
          <Menu theme="dark" mode="horizontal" selectable={false} style={{flex:1}}>
            <Menu.Item key="2"><Link to="/dashboard">Xem Lịch</Link></Menu.Item>
            <Menu.Item key="3"><Link to="/teams">Đội Tuyển</Link></Menu.Item>
            <Menu.Item key="4"><Link to="/scores">Điểm Số</Link></Menu.Item>
            <Menu.Item key="5"><Link to="/evaluations">Đánh Giá</Link></Menu.Item>
            
            {/* Menu Quản lý học sinh - Chỉ hiện với Teacher/Admin */}
            {canManage && (
              <Menu.Item key="6"><Link to="/students">Học Sinh</Link></Menu.Item>
            )}
          </Menu>
          
          {/* Khu vực thông tin User bên phải */}
          {user ? (
            <div style={{color:'#fff'}}>
              <span style={{marginRight:12}}>Xin chào, <strong>{user.name}</strong></span>
              <Button size="small" onClick={logout} danger>Đăng xuất</Button>
            </div>
          ) : (
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

        {/* Nội dung trang */}
        <Content style={{padding:24, minHeight: '80vh'}}>
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/dangki" element={<DangKi/>} />
            
            {/* Các trang cần đăng nhập mới xem được */}
            <Route path="/dashboard" element={<Protected><Dashboard/></Protected>} />
            <Route path="/teams" element={<Protected><Teams/></Protected>} />
            <Route path="/scores" element={<Protected><Scores/></Protected>} />
            <Route path="/evaluations" element={<Protected><Evaluations/></Protected>} />
            
            {/* Trang quản lý học sinh */}
            <Route path="/students" element={<Protected><Students/></Protected>} />
            
            <Route path="*" element={<h1 style={{textAlign: 'center', marginTop: 100}}>404 - Trang không tồn tại</h1>} />
          </Routes>
        </Content>
      </Layout>
  )
}