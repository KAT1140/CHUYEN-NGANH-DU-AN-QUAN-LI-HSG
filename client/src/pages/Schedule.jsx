import React, { useState, useEffect } from 'react'
import { Card, Button, List, Tag, Empty, message, Spin, Space, Input, Select, DatePicker } from 'antd'
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, UserOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { getToken, getUser } from '../utils/auth'
import AppLayout from '../components/Layout/AppLayout'
import AppCard from '../components/UI/AppCard'
import '../styles/Scores.css'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function Schedule() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(getUser())
  const [filterSubject, setFilterSubject] = useState(null)
  const [filterDate, setFilterDate] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/schedules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const sorted = (data.schedules || []).sort((a, b) => {
          return new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
        })
        setSchedules(sorted)
      } else {
        message.error('Không thể tải lịch')
      }
    } catch (err) {
      console.error('Error fetching schedules:', err)
      message.error('Lỗi khi tải lịch')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        message.success('Xóa lịch thành công')
        fetchSchedules()
      } else {
        message.error('Không thể xóa lịch')
      }
    } catch (err) {
      console.error('Error deleting schedule:', err)
      message.error('Lỗi khi xóa lịch')
    }
  }

  const filteredSchedules = schedules.filter(s => {
    const matchSubject = !filterSubject || s.subject === filterSubject
    const matchDate = !filterDate || s.date === filterDate.format('YYYY-MM-DD')
    return matchSubject && matchDate
  })

  const subjects = [...new Set(schedules.map(s => s.subject))].filter(Boolean)

  const renderScheduleItem = (item) => {
    const isAdmin = user?.role === 'admin'
    const isTeacher = user?.role === 'teacher'

    return (
      <Card
        key={item.id}
        style={{ marginBottom: 16, borderLeft: `4px solid ${getSubjectColor(item.subject)}` }}
        hoverable
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 12 }}>
              <Tag color={getSubjectColor(item.subject)} style={{ fontSize: 12 }}>
                {item.subject || 'Không xác định'}
              </Tag>
              {item.status && <Tag>{item.status}</Tag>}
            </div>

            <h3 style={{ margin: '8px 0' }}>{item.title || 'Không có tiêu đề'}</h3>

            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                {dayjs(item.date).format('dddd, DD/MM/YYYY')}
              </div>
              {item.time && (
                <div>
                  <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  {item.time}
                </div>
              )}
              {item.location && (
                <div>
                  <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  {item.location}
                </div>
              )}
              {item.description && (
                <div style={{ color: '#666', fontStyle: 'italic' }}>
                  {item.description}
                </div>
              )}
            </Space>
          </div>

          {(isAdmin || isTeacher) && (
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => navigate(`/schedule/${item.id}`)}
              />
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(item.id)}
              />
            </Space>
          )}
        </div>
      </Card>
    )
  }

  const getSubjectColor = (subject) => {
    const colors = {
      'Toán': '#1890ff',
      'Lý': '#52c41a',
      'Hóa': '#fa8c16',
      'Sinh': '#13c2c2',
      'Văn': '#eb2f96',
      'Anh': '#722ed1',
      'Địa': '#faad14',
      'Lịch sử': '#f5222d'
    }
    return colors[subject] || '#1890ff'
  }

  return (
    <AppLayout
      title="Lịch Biểu HSG"
      subtitle="Xem và quản lý lịch ôn tập, thi đấu"
    >
      <div style={{ marginBottom: 24 }}>
        <AppCard
          title="Bộ lọc"
          variant="glass"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <label style={{ marginRight: 12 }}>Môn học:</label>
              <Select
                placeholder="Tất cả môn học"
                style={{ width: 200 }}
                allowClear
                value={filterSubject}
                onChange={setFilterSubject}
                options={subjects.map(s => ({ label: s, value: s }))}
              />
            </div>
            <div>
              <label style={{ marginRight: 12 }}>Ngày:</label>
              <DatePicker
                placeholder="Tất cả ngày"
                value={filterDate}
                onChange={setFilterDate}
              />
            </div>
          </Space>
        </AppCard>
      </div>

      <AppCard
        title={`Danh sách lịch (${filteredSchedules.length})`}
        variant="glass"
        extra={
          user?.role === 'admin' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/schedule/new')}
            >
              Thêm lịch
            </Button>
          )
        }
      >
        <Spin spinning={loading}>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map(renderScheduleItem)
          ) : (
            <Empty description="Không có lịch nào" />
          )}
        </Spin>
      </AppCard>
    </AppLayout>
  )
}
