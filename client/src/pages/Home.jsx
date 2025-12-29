import React, { useEffect, useState } from 'react'
import { Card, Button, Row, Col, Statistic, List, Avatar, Tag, Progress, Timeline, Alert, Typography, Space, Divider } from 'antd'
import { TeamOutlined, UserOutlined, CalendarOutlined, TrophyOutlined, BookOutlined, StarOutlined, ClockCircleOutlined, FireOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, fetchMe, getToken } from '../utils/auth'
import AppLayout from '../components/Layout/AppLayout'
import AppCard from '../components/UI/AppCard'
import dayjs from 'dayjs'
import '../styles/Home.css'

const { Title, Text, Paragraph } = Typography
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function Home(){
  const [user, setUser] = useState(getUser())
  const [personalData, setPersonalData] = useState({})
  const [myTeam, setMyTeam] = useState(null)
  const [myScores, setMyScores] = useState([])
  const [myEvaluations, setMyEvaluations] = useState([])
  const [mySchedules, setMySchedules] = useState([])
  const [teacherStats, setTeacherStats] = useState({})
  const [loading, setLoading] = useState(false)
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
      fetchPersonalData()
    }
  }, [user])

  const fetchPersonalData = async () => {
    setLoading(true)
    try {
      const token = getToken()
      
      if (user.role === 'user') {
        // Fetch student personal data
        await fetchStudentData(token)
      } else if (user.role === 'teacher') {
        // Fetch teacher personal data
        await fetchTeacherData(token)
      } else {
        // Admin - fetch general stats
        await fetchAdminData(token)
      }
      
    } catch (err) {
      console.error('Error fetching personal data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentData = async (token) => {
    try {
      // Get student info and team
      const meResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (meResponse.ok) {
        const meData = await meResponse.json()
        setPersonalData(meData)
        if (meData.student?.team) {
          setMyTeam(meData.student.team)
        }
      }

      // Get my scores
      const scoresResponse = await fetch(`${API_BASE}/scores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json()
        setMyScores(scoresData.scores?.slice(0, 5) || [])
      }

      // Get my evaluations
      const evalResponse = await fetch(`${API_BASE}/evaluations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (evalResponse.ok) {
        const evalData = await evalResponse.json()
        setMyEvaluations(evalData.evaluations?.slice(0, 3) || [])
      }

      // Get my schedules
      const scheduleResponse = await fetch(`${API_BASE}/schedules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json()
        const upcoming = scheduleData.schedules?.filter(s => {
          const scheduleDate = dayjs(s.date)
          return scheduleDate.isAfter(dayjs()) && scheduleDate.isBefore(dayjs().add(7, 'day'))
        }).slice(0, 5) || []
        setMySchedules(upcoming)
      }
    } catch (err) {
      console.error('Error fetching student data:', err)
    }
  }

  const fetchTeacherData = async (token) => {
    try {
      // Get teacher info
      const meResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (meResponse.ok) {
        const meData = await meResponse.json()
        setPersonalData(meData)
      }

      // Get teacher teams
      const teamsResponse = await fetch(`${API_BASE}/teams/teacher-teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json()
        setMyTeam(teamsData.teams?.[0] || null) // First team for display
      }

      // Get students for evaluation
      const studentsResponse = await fetch(`${API_BASE}/evaluations/students-for-evaluation`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setTeacherStats({
          totalStudents: studentsData.students?.length || 0,
          studentsData: studentsData.students || []
        })
      }

      // Get recent evaluations
      const evalResponse = await fetch(`${API_BASE}/evaluations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (evalResponse.ok) {
        const evalData = await evalResponse.json()
        setMyEvaluations(evalData.evaluations?.slice(0, 5) || [])
      }

      // Get my schedules
      const scheduleResponse = await fetch(`${API_BASE}/schedules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json()
        const upcoming = scheduleData.schedules?.filter(s => {
          const scheduleDate = dayjs(s.date)
          return scheduleDate.isAfter(dayjs()) && scheduleDate.isBefore(dayjs().add(7, 'day'))
        }).slice(0, 5) || []
        setMySchedules(upcoming)
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err)
    }
  }

  const fetchAdminData = async (token) => {
    try {
      // Get general stats for admin
      const statsResponse = await fetch(`${API_BASE}/statistics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setPersonalData(statsData)
      }
    } catch (err) {
      console.error('Error fetching admin data:', err)
    }
  }

  // Render content based on user role
  const renderPersonalContent = () => {
    if (!user) return null

    if (user.role === 'user') {
      return renderStudentDashboard()
    } else if (user.role === 'teacher') {
      return renderTeacherDashboard()
    } else {
      return renderAdminDashboard()
    }
  }

  const renderStudentDashboard = () => (
    <>
      {/* Student Personal Info */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <AppCard title="Thông tin cá nhân" variant="glass">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Họ và tên: </Text>
                    <Text>{personalData.student?.name || user.name}</Text>
                  </div>
                  <div>
                    <Text strong>Mã số học sinh: </Text>
                    <Text>{personalData.student?.studentId || user.email}</Text>
                  </div>
                  <div>
                    <Text strong>Khối: </Text>
                    <Tag color="blue">{personalData.student?.grade || 'Chưa xác định'}</Tag>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Đội tuyển: </Text>
                    <Tag color="green">{myTeam?.name || 'Chưa có đội'}</Tag>
                  </div>
                  <div>
                    <Text strong>Môn học: </Text>
                    <Tag color="orange">{myTeam?.subject || 'Chưa xác định'}</Tag>
                  </div>
                  <div>
                    <Text strong>Trạng thái: </Text>
                    <Tag color="success">Đang học tập</Tag>
                  </div>
                </Space>
              </Col>
            </Row>
          </AppCard>
        </Col>
      </Row>

      {/* Student Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Tổng số bài kiểm tra"
              value={myScores.length}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </AppCard>
        </Col>
        <Col xs={24} sm={8}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Điểm trung bình"
              value={myScores.length > 0 ? (myScores.reduce((sum, s) => sum + s.score, 0) / myScores.length).toFixed(1) : 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="/10"
            />
          </AppCard>
        </Col>
        <Col xs={24} sm={8}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Đánh giá gần đây"
              value={myEvaluations.length}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </AppCard>
        </Col>
      </Row>

      {/* Student Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <AppCard title="Thao tác nhanh" variant="glass">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} md={6}>
                <Link to="/schedule">
                  <Button 
                    type="default" 
                    icon={<CalendarOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#722ed1', color: '#722ed1' }}
                  >
                    Lịch học của tôi
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/scores">
                  <Button 
                    type="default" 
                    icon={<BookOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#13c2c2', color: '#13c2c2' }}
                  >
                    Điểm số của tôi
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/evaluations">
                  <Button 
                    type="default" 
                    icon={<EyeOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#eb2f96', color: '#eb2f96' }}
                  >
                    Đánh giá của tôi
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/teams">
                  <Button 
                    type="default" 
                    icon={<TeamOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#1890ff', color: '#1890ff' }}
                  >
                    Đội tuyển của tôi
                  </Button>
                </Link>
              </Col>
            </Row>
          </AppCard>
        </Col>
      </Row>

      {/* Student Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <AppCard 
            title="Điểm số gần đây" 
            variant="glass"
            extra={<Link to="/scores">Xem tất cả</Link>}
          >
            <List
              dataSource={myScores}
              locale={{ emptyText: 'Chưa có điểm số nào' }}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<BookOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={
                      <div>
                        {item.testName}
                        <Tag color={item.score >= 8 ? 'green' : item.score >= 6 ? 'blue' : 'orange'} style={{ marginLeft: 8 }}>
                          {item.score}/{item.maxScore || 10}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <CalendarOutlined /> {dayjs(item.examDate).format('DD/MM/YYYY')}
                        {item.award && <Tag color="gold" style={{ marginLeft: 8 }}>{item.award}</Tag>}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </AppCard>
        </Col>

        <Col xs={24} lg={12}>
          <AppCard 
            title="Đánh giá từ giáo viên" 
            variant="glass"
            extra={<Link to="/evaluations">Xem tất cả</Link>}
          >
            <List
              dataSource={myEvaluations}
              locale={{ emptyText: 'Chưa có đánh giá nào' }}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<StarOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                    title={
                      <div>
                        Đánh giá từ giáo viên
                        {item.rating && (
                          <Tag color={item.rating >= 8 ? 'green' : item.rating >= 6 ? 'blue' : 'orange'} style={{ marginLeft: 8 }}>
                            {item.rating}/10
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <CalendarOutlined /> {dayjs(item.date).format('DD/MM/YYYY')}
                        </div>
                        <div style={{ 
                          maxWidth: '300px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {item.content}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </AppCard>
        </Col>
      </Row>
    </>
  )

  const renderTeacherDashboard = () => (
    <>
      {/* Teacher Personal Info */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <AppCard title="Thông tin giáo viên" variant="glass">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Họ và tên: </Text>
                    <Text>{personalData.teacher?.fullName || user.name}</Text>
                  </div>
                  <div>
                    <Text strong>Email: </Text>
                    <Text>{user.email}</Text>
                  </div>
                  <div>
                    <Text strong>Môn dạy: </Text>
                    <Tag color="blue">{personalData.teacher?.subject || 'Chưa xác định'}</Tag>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Tổ môn: </Text>
                    <Text>{personalData.teacher?.department || 'Chưa xác định'}</Text>
                  </div>
                  <div>
                    <Text strong>Chuyên môn: </Text>
                    <Text>{personalData.teacher?.specialization || 'Chưa cập nhật'}</Text>
                  </div>
                  <div>
                    <Text strong>Đội phụ trách: </Text>
                    <Tag color="green">{myTeam?.name || 'Chưa có đội'}</Tag>
                  </div>
                </Space>
              </Col>
            </Row>
          </AppCard>
        </Col>
      </Row>

      {/* Teacher Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Học sinh phụ trách"
              value={teacherStats.totalStudents || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </AppCard>
        </Col>
        <Col xs={24} sm={8}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Đánh giá đã tạo"
              value={myEvaluations.length}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </AppCard>
        </Col>
        <Col xs={24} sm={8}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Lịch dạy tuần này"
              value={mySchedules.length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </AppCard>
        </Col>
      </Row>

      {/* Teacher Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <AppCard title="Thao tác nhanh" variant="glass">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} md={6}>
                <Link to="/schedule">
                  <Button 
                    type="default" 
                    icon={<CalendarOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#722ed1', color: '#722ed1' }}
                  >
                    Lịch dạy của tôi
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/evaluations">
                  <Button 
                    type="default" 
                    icon={<EditOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#eb2f96', color: '#eb2f96' }}
                  >
                    Đánh giá học sinh
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/scores">
                  <Button 
                    type="default" 
                    icon={<BookOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#13c2c2', color: '#13c2c2' }}
                  >
                    Điểm số học sinh
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/teams">
                  <Button 
                    type="default" 
                    icon={<TeamOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#1890ff', color: '#1890ff' }}
                  >
                    Quản lý đội
                  </Button>
                </Link>
              </Col>
            </Row>
          </AppCard>
        </Col>
      </Row>

      {/* Teacher Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <AppCard 
            title="Lịch dạy sắp tới" 
            variant="glass"
            extra={<Link to="/schedule">Xem tất cả</Link>}
          >
            <List
              dataSource={mySchedules}
              locale={{ emptyText: 'Không có lịch dạy sắp tới' }}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={
                      <div>
                        {item.title}
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {dayjs(item.date).format('DD/MM')}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <ClockCircleOutlined /> {item.time?.slice(0, 5)} • {item.subject}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </AppCard>
        </Col>

        <Col xs={24} lg={12}>
          <AppCard 
            title="Đánh giá gần đây" 
            variant="glass"
            extra={<Link to="/evaluations">Xem tất cả</Link>}
          >
            <List
              dataSource={myEvaluations}
              locale={{ emptyText: 'Chưa có đánh giá nào' }}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<StarOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                    title={
                      <div>
                        {item.member?.name || 'Học sinh'}
                        {item.rating && (
                          <Tag color={item.rating >= 8 ? 'green' : item.rating >= 6 ? 'blue' : 'orange'} style={{ marginLeft: 8 }}>
                            {item.rating}/10
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <CalendarOutlined /> {dayjs(item.date).format('DD/MM/YYYY')}
                        </div>
                        <div style={{ 
                          maxWidth: '300px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {item.content}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </AppCard>
        </Col>
      </Row>
    </>
  )

  const renderAdminDashboard = () => (
    <>
      {/* Admin Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Tổng số đội tuyển"
              value={personalData.totalTeams || 9}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </AppCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Tổng số học sinh"
              value={personalData.totalStudents || 246}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </AppCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <AppCard variant="stats" size="small">
            <Statistic
              title="Tổng số giáo viên"
              value={personalData.totalTeachers || 54}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </AppCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <AppCard variant="stats" size="small">
            <Statistic
              title={`Kỳ thi HSG`}
              value={dayjs('2025-04-15').diff(dayjs(), 'day')}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              suffix="ngày"
            />
          </AppCard>
        </Col>
      </Row>

      {/* Admin Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <AppCard title="Thao tác quản trị" variant="glass">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} md={6}>
                <Link to="/teams">
                  <Button 
                    type="default" 
                    icon={<TeamOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#1890ff', color: '#1890ff' }}
                  >
                    Quản lý đội tuyển
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/students">
                  <Button 
                    type="default" 
                    icon={<UserOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#52c41a', color: '#52c41a' }}
                  >
                    Quản lý học sinh
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/teachers">
                  <Button 
                    type="default" 
                    icon={<BookOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#fa8c16', color: '#fa8c16' }}
                  >
                    Quản lý giáo viên
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Link to="/statistics">
                  <Button 
                    type="default" 
                    icon={<TrophyOutlined />}
                    style={{ width: '100%', height: '60px', borderColor: '#722ed1', color: '#722ed1' }}
                  >
                    Xem thống kê
                  </Button>
                </Link>
              </Col>
            </Row>
          </AppCard>
        </Col>
      </Row>
    </>
  )

  return (
    <AppLayout 
      title="Trang chủ HSG Manager" 
      subtitle="Hệ thống quản lý đội tuyển học sinh giỏi"
    >
      {user ? (
        <>
          <AppCard 
            title={`Chào mừng, ${user.name}`}
            variant="glass"
            size="large"
          >
            <Alert
              message={`Bạn đang đăng nhập với quyền ${user.role === 'admin' ? 'Quản trị viên' : user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          </AppCard>
          
          {/* Render personalized content based on user role */}
          {renderPersonalContent()}
        </>
      ) : (
        <AppCard 
          title="HSG Management"
          variant="glass"
          size="large"
        >
          <p>Hệ thống quản lý đội học sinh giỏi. Bạn có thể quản lý đội, thành viên và các kì thi ở đây.</p>
          <div style={{marginTop:16}}>
            <Link to="/login">
              <Button type="primary" size="large">
                Hãy đăng nhập
              </Button>
            </Link>
          </div>
        </AppCard>
      )}
    </AppLayout>
  )
}
