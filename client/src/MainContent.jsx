// File: client/src/MainContent.jsx

import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Space } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import ThemeToggle from './components/UI/ThemeToggle'
import './styles/MainContent.css'

// Import đầy đủ các trang
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Schedule' 
import Teams from './pages/Teams'
import TeamsTest from './pages/TeamsTest'
import Scores from './pages/Scores'         
import Home from './pages/Home'           
import Welcome from './pages/Welcome'     // <--- Import Welcome page
import Evaluations from './pages/Evaluations' // <--- Đã import Đánh giá
import Students from './pages/Students'       // <--- Đã import Học sinh
import TeachersPage from './pages/TeachersPage' // <--- Import Giáo viên
import Statistics from './pages/Statistics'     // <--- Import Thống kê

import { getToken, getUser, removeToken } from './utils/auth'

const { Header, Content } = Layout

export default function MainContent(){ 
  const [user, setUser] = useState(null) // Mặc định null
  const navigate = useNavigate() 
  const location = useLocation() // Để theo dõi route changes

  // Chỉ hiện menu "Học sinh" nếu là Giáo viên/Admin
  const canManage = user && user.role !== 'user';

  // Function để check trang hiện tại
  const isCurrentPage = (path) => {
    return location.pathname === path;
  };

  // Load user từ localStorage sau khi component mount
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Lắng nghe sự kiện đăng nhập/đăng xuất để cập nhật menu ngay lập tức
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
    setUser(null); // Cập nhật state ngay lập tức
    navigate('/welcome'); // Chuyển về trang Welcome
  }

  function Protected({ children }){
    if (!getToken()) return <Navigate to="/login" replace />
    return children
  }

  return (
      <Layout>
        <Header className="main-header">
          <div className="main-header-left">
            <Link to="/" className="main-logo-link">
              <div className="main-logo-text">HSG Manager</div>
            </Link>
          </div>

          {/* MENU CHÍNH - Ẩn menu item của trang hiện tại */}
          {user && (
            <Menu theme="dark" mode="horizontal" selectable={false} className="main-menu">
              {!isCurrentPage('/dashboard') && (
                <Menu.Item key="2"><Link to="/dashboard">Xem Lịch</Link></Menu.Item>
              )}
              {!isCurrentPage('/teams') && (
                <Menu.Item key="3"><Link to="/teams">Đội Tuyển</Link></Menu.Item>
              )}
              {!isCurrentPage('/scores') && (
                <Menu.Item key="4"><Link to="/scores">Điểm Số</Link></Menu.Item>
              )}
              {!isCurrentPage('/evaluations') && (
                <Menu.Item key="5"><Link to="/evaluations">Đánh Giá</Link></Menu.Item>
              )}
              {!isCurrentPage('/statistics') && (
                <Menu.Item key="8"><Link to="/statistics">Thống Kê</Link></Menu.Item>
              )}
              
              {/* Menu Quản lý học sinh (Chỉ Teacher/Admin thấy) */}
              {canManage && !isCurrentPage('/students') && (
                <Menu.Item key="6"><Link to="/students">Học Sinh</Link></Menu.Item>
              )}
              {canManage && !isCurrentPage('/teachers') && (
                <Menu.Item key="7"><Link to="/teachers">Giáo Viên</Link></Menu.Item>
              )}
            </Menu>
          )}
          
          {user ? (
            <div className="main-user-info">
              <span className="main-username">Xin chào, <strong>{user.name}</strong></span>
              <ThemeToggle size="middle" style={{ marginLeft: '12px', marginRight: '12px' }} />
              <Button size="small" onClick={logout} danger>Đăng xuất</Button>
            </div>
          ) : (
            <Space> 
              <ThemeToggle size="middle" />
              <Link to="/login"><Button type="primary">Đăng Nhập</Button></Link>
            </Space>
          )}
        </Header>

        <Content className="main-content">
          <Routes>
            <Route path="/" element={user ? <Home/> : <Welcome/>} />
            <Route path="/welcome" element={<Welcome/>} />
            <Route path="/login" element={<LoginPage/>} />
            
            <Route path="/dashboard" element={<Protected><Dashboard/></Protected>} />
            <Route path="/teams" element={<Protected><Teams/></Protected>} />
            <Route path="/scores" element={<Protected><Scores/></Protected>} />
            <Route path="/evaluations" element={<Protected><Evaluations/></Protected>} />
            <Route path="/statistics" element={<Protected><Statistics/></Protected>} />
            <Route path="/students" element={<Protected><Students/></Protected>} />
            <Route path="/teachers" element={<Protected><TeachersPage/></Protected>} />
            
            <Route path="*" element={<h1 className="not-found">404 - Trang không tồn tại</h1>} />
          </Routes>
        </Content>
      </Layout>
  )
}