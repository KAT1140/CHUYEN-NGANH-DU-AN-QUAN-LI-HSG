import React, { useEffect, useState } from 'react'
import { Card, Button, Row, Col, Statistic } from 'antd'
import { TeamOutlined, UserOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, fetchMe, getToken } from '../utils/auth'
import '../styles/Home.css'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function Home(){
  const [user, setUser] = useState(getUser())
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalStudents: 0,
    schedulesThisWeek: 0,
    daysUntilExam: 0,
    hsgExamDate: ''
  })
  const navigate = useNavigate()

  useEffect(()=>{
    // try refresh user from API if token present
    (async()=>{
      const me = await fetchMe()
      if (me) setUser(me)
    })()
  }, [])

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_BASE}/statistics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    }
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <Card className="welcome-card" title={user ? `Chào mừng, ${user.name}` : 'HSG Management'}>
          <p>Hệ thống quản lý đội học sinh giỏi. Bạn có thể quản lý đội, thành viên và các kì thi ở đây.</p>
          
          {user && (
            <>
              <Row gutter={[16, 16]} style={{marginTop: 24, marginBottom: 24}}>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="Tổng số đội tuyển"
                      value={stats.totalTeams}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="Tổng số học sinh"
                      value={stats.totalStudents}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <Statistic
                      title="Lịch học tuần này"
                      value={stats.schedulesThisWeek}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                      suffix="buổi"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card">
                    <Statistic
                      title={`Kỳ thi HSG Quốc gia (${stats.hsgExamDate})`}
                      value={stats.daysUntilExam}
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                      suffix="ngày"
                    />
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {!user && (
            <div style={{marginTop:16}}>
              <Link to="/login">
                <Button type="primary">
                  Hãy đăng nhập
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
