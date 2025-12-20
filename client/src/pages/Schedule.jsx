// File: client/src/pages/Schedule.jsx

import React, { useState, useEffect } from 'react'
import { Layout, Calendar, Card, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, message } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, EditOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

const { Header, Content } = Layout

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Màu sắc cho môn học
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
  };
  return colors[subject] || '#1890ff';
};

// Hàm helper fetch có xác thực
async function fetchAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    return { error: 'Unauthorized' };
  }

  return res;
}

export default function Schedule(){
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teacherSubject, setTeacherSubject] = useState(null);
  
  // --- THÊM STATE QUẢN LÝ SỬA ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // -------------------------------

  const [form] = Form.useForm();
  
  // Lấy role để phân quyền (chỉ admin/teacher được thêm/sửa/xóa)
  const userRole = localStorage.getItem('userRole') || 'user';
  const canManageSchedule = userRole !== 'user'; 

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth(`${API_BASE}/schedules`);
      if (res && res.error === 'Unauthorized') {
        message.error('Phiên đăng nhập hết hạn');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (err) {
      message.error('Lỗi tải lịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchTeacherSubject();
  }, []);

  // Lấy môn của giáo viên nếu user là teacher
  const fetchTeacherSubject = async () => {
    if (userRole === 'teacher') {
      try {
        const res = await fetchAuth(`${API_BASE}/auth/me`);
        if (res.ok) {
          const data = await res.json();
          if (data.teacher && data.teacher.subject) {
            setTeacherSubject(data.teacher.subject);
          }
        }
      } catch (err) {
        console.error('Error fetching teacher subject:', err);
      }
    }
  };

  const getSchedulesForDate = (date) => {
    return schedules.filter(schedule => 
      dayjs(schedule.date).isSame(date, 'day')
    );
  };

  const daySchedules = getSchedulesForDate(selectedDate);

  // --- HÀM MỞ MODAL ĐỂ THÊM ---
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    const initialValues = { 
      date: selectedDate, 
      type: 'event'
    };
    // Nếu là giáo viên, tự động điền môn
    if (teacherSubject) {
      initialValues.subject = teacherSubject;
    }
    form.setFieldsValue(initialValues);
    setIsModalVisible(true);
  };

  // --- HÀM MỞ MODAL ĐỂ SỬA ---
  const openEditModal = (schedule) => {
    setIsEditMode(true);
    setEditingId(schedule.id);
    form.setFieldsValue({
      title: schedule.title,
      description: schedule.description,
      date: dayjs(schedule.date),
      time: schedule.time ? dayjs(schedule.time, 'HH:mm:ss') : null,
      subject: schedule.subject
    });
    setIsModalVisible(true);
  };

  // --- HÀM XỬ LÝ LƯU (CẢ THÊM VÀ SỬA) ---
  const handleSaveEvent = async (values) => {
    const isEdit = isEditMode;
    const url = isEdit ? `${API_BASE}/schedules/${editingId}` : `${API_BASE}/schedules`;
    const method = isEdit ? 'PUT' : 'POST';
    const actionName = isEdit ? 'Cập nhật' : 'Tạo';

    try {
      message.loading({ content: `Đang ${actionName} lịch...`, key: 'saveSchedule' });
      
      const payload = {
        title: values.title,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time ? values.time.format('HH:mm:ss') : '09:00:00',
        type: 'event',
        subject: values.subject
      };

      const res = await fetchAuth(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.error === 'Unauthorized') {
        message.error({ content: 'Phiên đăng nhập hết hạn', key: 'saveSchedule' });
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        message.error({ content: data.error || `Lỗi ${actionName} lịch`, key: 'saveSchedule' });
        return;
      }

      message.success({ content: `${actionName} lịch thành công`, key: 'saveSchedule', duration: 1 });
      fetchSchedules();
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      message.error({ content: 'Lỗi mạng', key: 'saveSchedule' });
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch này?')) return;
    try {
      message.loading({ content: 'Đang xóa...', key: 'deleteSchedule' });
      const res = await fetchAuth(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });

      if (res.error === 'Unauthorized') {
        message.error({ content: 'Phiên đăng nhập hết hạn', key: 'deleteSchedule' });
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        message.error({ content: data.error || 'Lỗi xóa lịch', key: 'deleteSchedule' });
        return;
      }

      message.success({ content: 'Xóa lịch thành công', key: 'deleteSchedule', duration: 1 });
      fetchSchedules();
    } catch (err) {
      message.error('Lỗi mạng');
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const getListData = (value) => {
    const dateSchedules = getSchedulesForDate(value);
    return dateSchedules.map(schedule => ({
      type: schedule.type === 'meeting' ? 'success' : 'processing',
      content: schedule.title,
    }))
  }

  const dateCellRender = (value) => {
    const dateSchedules = getSchedulesForDate(value);
    return (
      <ul style={{ listStyle: 'none', padding: '2px', margin: 0 }}>
        {dateSchedules.slice(0, 2).map((schedule) => {
          // Rút gọn title: "Toán - Ôn tập chương" -> "Ôn tập chương"
          const shortTitle = schedule.title ? schedule.title.split(' - ').pop() : '';
          return (
            <li key={schedule.id} style={{marginBottom: 4}}>
              <div style={{
                background: schedule.subject ? getSubjectColor(schedule.subject) : '#1890ff',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                <span style={{fontWeight: 600}}>{schedule.time ? schedule.time.slice(0, 5) : ''}</span>
                <span style={{opacity: 0.9}}>{shortTitle}</span>
              </div>
            </li>
          );
        })}
        {dateSchedules.length > 2 && (
          <li style={{
            fontSize: 10, 
            color: '#999', 
            textAlign: 'center',
            padding: '2px',
            background: '#f0f0f0',
            borderRadius: 3
          }}>
            +{dateSchedules.length - 2} lịch
          </li>
        )}
      </ul>
    )
  }

  return (
    <Layout className="dashboard-layout">
      <Header style={{background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)'}}>
        <div className="dashboard-logo">HSG Management - Lịch Biểu</div>
      </Header>
      <Content className="dashboard-content">
        <div className="dashboard-grid">
          {/* Calendar */}
          <Card className="dashboard-calendar-card">
            <Calendar 
              value={selectedDate}
              onChange={handleDateSelect}
              dateCellRender={dateCellRender}
            />
          </Card>

          {/* Sidebar: Events for selected date */}
          <div>
            <Card 
              className="dashboard-sidebar-card"
              title={
                <span>
                  <ClockCircleOutlined style={{marginRight: 8}} />
                  Lịch ngày {selectedDate.format('DD/MM/YYYY')}
                </span>
              }
              extra={
                <Space size="small">
                  {canManageSchedule && (
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={openAddModal} // Sử dụng hàm mở modal mới
                    >
                      Thêm
                    </Button>
                  )}
                  <Button 
                    size="small"
                    icon={<ReloadOutlined />} 
                    onClick={fetchSchedules} 
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                </Space>
              }
            >
              {daySchedules.length === 0 ? (
                <p style={{color:'#999'}}>Không có lịch</p>
              ) : (
                <Space direction="vertical" style={{width:'100%', gap: 12}}>
                  {daySchedules.map(schedule => (
                    <Card 
                      key={schedule.id} 
                      className="dashboard-schedule-card"
                      size="small"
                      style={{
                        borderLeftColor: schedule.subject ? getSubjectColor(schedule.subject) : '#1890ff'
                      }}
                      extra={
                        // Chỉ hiện nút Sửa/Xóa nếu có quyền
                        canManageSchedule && (
                          <Space size="small">
                            {/* Nút Sửa */}
                            <Button 
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => openEditModal(schedule)}
                              style={{ color: '#1890ff' }}
                            />
                            {/* Nút Xóa */}
                            <Button 
                              type="text" 
                              size="small" 
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteEvent(schedule.id)}
                              danger
                            />
                          </Space>
                        )
                      }
                    >
                      <div style={{marginBottom: 8}}>
                        <span className="dashboard-schedule-time">
                          <ClockCircleOutlined style={{marginRight: 4}} />
                          {schedule.time ? schedule.time.slice(0, 5) : '09:00'}
                        </span>
                        <span style={{marginLeft: 8, fontSize: 14, fontWeight: 500}}>{schedule.title}</span>
                      </div>
                      {schedule.description && <div className="dashboard-schedule-desc">{schedule.description}</div>}
                      {schedule.subject && (
                        <Tag color={getSubjectColor(schedule.subject)} style={{marginTop: 8}}>
                          {schedule.subject}
                        </Tag>
                      )}
                    </Card>
                  ))}
                </Space>
              )}
            </Card>
          </div>
        </div>

        {/* Modal Thêm/Sửa sự kiện */}
        <Modal
          title={isEditMode ? "Cập nhật sự kiện" : "Thêm sự kiện"}
          open={isModalVisible}
          footer={null}
          onCancel={() => {
            setIsModalVisible(false)
            form.resetFields()
          }}
          destroyOnClose
        >
          <Form form={form} layout="vertical" onFinish={handleSaveEvent}>
            <Form.Item 
              name="title" 
              label="Tên sự kiện" 
              rules={[{required:true, message:'Vui lòng nhập tên sự kiện'}]}
            >
              <Input placeholder="VD: Họp nhóm HSG" />
            </Form.Item>

            <Form.Item 
              name="description" 
              label="Mô tả"
            >
              <Input.TextArea rows={3} placeholder="Mô tả chi tiết (tuỳ chọn)" />
            </Form.Item>

            <Form.Item 
              name="date" 
              label="Ngày"
              rules={[{required:true, message:'Vui lòng chọn ngày'}]}
            >
              <DatePicker style={{width:'100%'}} />
            </Form.Item>

            <Form.Item 
              name="time" 
              label="Giờ"
            >
              <DatePicker picker="time" format="HH:mm" style={{width:'100%'}} />
            </Form.Item>

            <Form.Item 
              name="subject" 
              label="Môn học"
            >
              <Select 
                placeholder="Chọn môn (tuỳ chọn)"
                allowClear
                disabled={userRole === 'teacher' && teacherSubject !== null}
                options={[
                  {label:'Toán', value:'Toán'},
                  {label:'Lý', value:'Lý'},
                  {label:'Hóa', value:'Hóa'},
                  {label:'Sinh', value:'Sinh'},
                  {label:'Văn', value:'Văn'},
                  {label:'Anh', value:'Anh'},
                  {label:'Địa', value:'Địa'},
                  {label:'Lịch sử', value:'Lịch sử'}
                ]} 
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{width:'100%'}}>
                {isEditMode ? "Cập nhật" : "Lưu sự kiện"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}