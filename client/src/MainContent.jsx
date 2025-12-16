import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Space } from 'antd'
import LoginPage from './pages/LoginPage'
import Schedule from './pages/Dashboard' 
import Teams from './pages/Teams'
import Scores from './pages/Scores'         
import Home from './pages/Home'           
import DangKi from './pages/dangki.jsx'   
import { getToken, getUser, removeToken } from './utils/auth'

const { Header, Content } = Layout

// Component chứa logic cần hook useNavigate
export default function MainContent(){ 
  const [user, setUser] = useState(getUser())
  const navigate = useNavigate() 

  useEffect(()=>{
    setUser(getUser())
  }, [])

useEffect(() => {
    // Hàm này sẽ chạy mỗi khi có tín hiệu 'auth-change'
    const handleAuthChange = () => {
      setUser(getUser()); // Cập nhật lại state user từ localStorage
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener('auth-change', handleAuthChange);

    // Hủy lắng nghe khi thoát
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

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
          <Link to="/" style={{textDecoration:'none', display:'flex', alignItems:'center', marginRight:24}}>
            <div style={{color:'#fff', fontWeight:700}}>HSG</div>
          </Link>
          <Menu theme="dark" mode="horizontal" selectable={false} style={{flex:1}}>
            <Menu.Item key="2"><Link to="/dashboard">Xem Lịch</Link></Menu.Item>
            <Menu.Item key="3"><Link to="/teams">Teams</Link></Menu.Item>
            <Menu.Item key="4"><Link to="/scores">Điểm</Link></Menu.Item>
          </Menu>
          {user ? (
            <div style={{color:'#fff'}}>
              <span style={{marginRight:12}}>{user.name}</span>
              <Button size="small" onClick={logout}>Logout</Button>
            </div>
          ) : (
            //Link tới Trang Đăng ký
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
            <Route path="/dashboard" element={<Protected><Schedule/></Protected>} />
            <Route path="/teams" element={<Protected><Teams/></Protected>} />
            <Route path="/scores" element={<Protected><Scores/></Protected>} />
            <Route path="*" element={<h1 style={{textAlign: 'center', marginTop: 100}}>404 - Trang không tồn tại</h1>} />
          </Routes>
        </Content>
      </Layout>
  )
  return (
      <Layout>
        <Header style={{display:'flex', alignItems:'center'}}>
          {/* ... Logo ... */}
          <Menu theme="dark" mode="horizontal" selectable={false} style={{flex:1}}>
            <Menu.Item key="2"><Link to="/dashboard">Xem Lịch</Link></Menu.Item>
            <Menu.Item key="3"><Link to="/teams">Teams</Link></Menu.Item>
            <Menu.Item key="4"><Link to="/scores">Điểm</Link></Menu.Item>
            <Menu.Item key="5"><Link to="/evaluations">Đánh giá</Link></Menu.Item> {/* <--- Thêm Menu Item */}
          </Menu>
          {/* ... User info ... */}
        </Header>
        <Content style={{padding:24}}>
          <Routes>
            {/* ... Các route cũ ... */}
            <Route path="/evaluations" element={<Protected><Evaluations/></Protected>} /> {/* <--- Thêm Route */}
            <Route path="*" element={<h1 style={{textAlign: 'center', marginTop: 100}}>404 - Trang không tồn tại</h1>} />
          </Routes>
        </Content>
      </Layout>
  )
}