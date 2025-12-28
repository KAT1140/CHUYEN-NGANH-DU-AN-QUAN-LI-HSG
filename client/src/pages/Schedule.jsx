// File: client/src/pages/Schedule.jsx

import React, { useState, useEffect } from 'react'
import { Calendar, Button, Modal, Form, Input, Select, DatePicker, message, Tooltip, Space, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, EditOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/Layout/AppLayout'
import AppCard from '../components/UI/AppCard'
import '../styles/Dashboard.css'

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
  const [currentMonth, setCurrentMonth] = useState(dayjs()); // Thêm state cho tháng hiện tại
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teacherSubject, setTeacherSubject] = useState(null);
  const [teacherRole, setTeacherRole] = useState(null); // Thêm state cho role giáo viên
  
  // --- THÊM STATE QUẢN LÝ SỬA ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // -------------------------------

  const [form] = Form.useForm();
  
  // Lấy role để phân quyền
  const userRole = localStorage.getItem('userRole') || 'user';
  // Chỉ admin hoặc giáo viên main mới được thêm/sửa/xóa lịch
  const canManageSchedule = userRole === 'admin' || (userRole === 'teacher' && teacherRole === 'main'); 

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching schedules...');
      const res = await fetchAuth(`${API_BASE}/schedules`);
      console.log('📡 API Response:', res);
      
      if (res && res.error === 'Unauthorized') {
        message.error('Phiên đăng nhập hết hạn');
        navigate('/login');
        return;
      }
      if (!res.ok) {
        console.log('❌ Response not OK:', res.status, res.statusText);
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      console.log('📊 Data received:', data);
      console.log('📅 Schedules count:', data.schedules ? data.schedules.length : 0);
      console.log('🔍 Sample schedule:', data.schedules ? data.schedules[0] : 'none');
      setSchedules(data.schedules || []);
      console.log('✅ State updated with schedules');
    } catch (err) {
      console.error('❌ Fetch error:', err);
      message.error('Lỗi tải lịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchTeacherSubject();
    
    // Thêm keyboard shortcuts
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return; // Không xử lý khi đang nhập liệu
      }
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousMonth();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextMonth();
      } else if (event.key === 'Home') {
        event.preventDefault();
        goToCurrentMonth();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Separate useEffect for month changes to avoid infinite loops
  useEffect(() => {
    // Có thể thêm logic load dữ liệu theo tháng ở đây nếu cần
  }, [currentMonth]);

  // Lấy môn và role của giáo viên nếu user là teacher
  const fetchTeacherSubject = async () => {
    if (userRole === 'teacher') {
      try {
        const res = await fetchAuth(`${API_BASE}/auth/me`);
        if (res.ok) {
          const data = await res.json();
          if (data.teacher && data.teacher.subject) {
            setTeacherSubject(data.teacher.subject);
            
            // Lấy role của giáo viên trong đội
            const teamRes = await fetchAuth(`${API_BASE}/teams/teacher-role`);
            if (teamRes.ok) {
              const teamData = await teamRes.json();
              setTeacherRole(teamData.role); // 'main' hoặc 'co-teacher'
            }
          }
        }
      } catch (err) {
        console.error('Error fetching teacher info:', err);
      }
    }
  };

  const getSchedulesForDate = (date) => {
    const result = schedules.filter(schedule => 
      dayjs(schedule.date).isSame(date, 'day')
    );
    if (result.length > 0) {
      console.log(`📅 Date ${date.format('YYYY-MM-DD')} has ${result.length} schedules:`, result);
    }
    return result;
  };

  // Tính số lượng sự kiện trong tháng hiện tại
  const getMonthEventCount = () => {
    return schedules.filter(schedule => 
      dayjs(schedule.date).isSame(currentMonth, 'month')
    ).length;
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
    // Kiểm tra quyền sửa: chỉ admin hoặc giáo viên main của môn đó
    if (userRole === 'teacher') {
      if (teacherRole !== 'main') {
        message.warning('Chỉ giáo viên phụ trách mới có thể sửa lịch ôn tập');
        return;
      }
      if (teacherSubject && schedule.subject !== teacherSubject) {
        message.warning(`Bạn chỉ có thể sửa lịch môn ${teacherSubject}`);
        return;
      }
    }
    
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
    // Tìm schedule để kiểm tra quyền
    const schedule = schedules.find(s => s.id === id);
    
    if (userRole === 'teacher') {
      if (teacherRole !== 'main') {
        message.warning('Chỉ giáo viên phụ trách mới có thể xóa lịch ôn tập');
        return;
      }
      if (teacherSubject && schedule && schedule.subject !== teacherSubject) {
        message.warning(`Bạn chỉ có thể xóa lịch môn ${teacherSubject}`);
        return;
      }
    }
    
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

  // Hàm chuyển tháng trước
  const goToPreviousMonth = () => {
    const prevMonth = currentMonth.subtract(1, 'month');
    setCurrentMonth(prevMonth);
    setSelectedDate(prevMonth.startOf('month')); // Chọn ngày đầu tháng
  };

  // Hàm chuyển tháng sau
  const goToNextMonth = () => {
    const nextMonth = currentMonth.add(1, 'month');
    setCurrentMonth(nextMonth);
    setSelectedDate(nextMonth.startOf('month')); // Chọn ngày đầu tháng
  };

  // Hàm về tháng hiện tại
  const goToCurrentMonth = () => {
    const today = dayjs();
    setCurrentMonth(today);
    setSelectedDate(today);
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
    console.log(`🎯 Rendering date ${value.format('YYYY-MM-DD')}, found ${dateSchedules.length} schedules`);
    
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
    <AppLayout 
      title="Lịch Biểu HSG" 
      subtitle="Quản lý lịch ôn tập và thi đấu"
    >
      <div className="dashboard-grid">
        {/* Calendar */}
        <AppCard 
          className="dashboard-calendar-card"
          variant="glass"
          title={
            <div className="dashboard-month-nav">
              <div>
                <span className="dashboard-month-title">
                  Lịch tháng {currentMonth.format('MM/YYYY')}
                </span>
                <Tag color="blue" style={{ marginLeft: 12 }}>
                  {getMonthEventCount()} sự kiện
                </Tag>
              </div>
              <div className="dashboard-nav-buttons">
                <Tooltip title="Tháng trước (←)">
                  <Button 
                    className="dashboard-nav-button"
                    type="text" 
                    icon={<LeftOutlined />} 
                    onClick={goToPreviousMonth}
                  />
                </Tooltip>
                <Tooltip title="Về tháng hiện tại (Home)">
                  <Button 
                    className="dashboard-nav-button dashboard-today-button"
                    type="primary"
                    onClick={goToCurrentMonth}
                    size="small"
                  >
                    Hôm nay
                  </Button>
                </Tooltip>
                <Tooltip title="Tháng sau (→)">
                  <Button 
                    className="dashboard-nav-button"
                    type="text" 
                    icon={<RightOutlined />} 
                    onClick={goToNextMonth}
                  />
                </Tooltip>
              </div>
            </div>
          }
        >
          <Calendar 
            value={selectedDate}
            onChange={handleDateSelect}
            dateCellRender={dateCellRender}
            headerRender={() => null} // Ẩn header mặc định của Calendar
            mode="month"
            onPanelChange={(date, mode) => {
              if (mode === 'month') {
                setCurrentMonth(date);
              }
            }}
          />
        </AppCard>

        {/* Sidebar: Events for selected date */}
        <div>
          <AppCard 
            className="dashboard-sidebar-card"
            variant="glass"
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
              <div className="dashboard-empty">
                Không có lịch
              </div>
            ) : (
              <Space direction="vertical" style={{width:'100%', gap: 12}}>
                {daySchedules.map(schedule => (
                  <AppCard 
                    key={schedule.id} 
                    className="dashboard-schedule-card"
                    size="small"
                    hoverable={false}
                    style={{
                      borderLeftColor: schedule.subject ? getSubjectColor(schedule.subject) : '#1890ff'
                    }}
                    extra={
                      // Chỉ hiện nút Sửa/Xóa nếu có quyền quản lý lịch
                      canManageSchedule && (userRole === 'admin' || (userRole === 'teacher' && teacherSubject === schedule.subject)) && (
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
                  </AppCard>
                ))}
              </Space>
            )}
          </AppCard>
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
              rules={userRole === 'teacher' ? [{required: true, message: 'Môn học là bắt buộc'}] : []}
            >
              <Select 
                placeholder={userRole === 'teacher' ? `Môn của bạn: ${teacherSubject || 'Đang tải...'}` : "Chọn môn (tuỳ chọn)"}
                allowClear={userRole !== 'teacher'}
                disabled={userRole === 'teacher'}
                options={userRole === 'teacher' && teacherSubject ? 
                  [{label: teacherSubject, value: teacherSubject}] :
                  [
                    {label:'Toán', value:'Toán'},
                    {label:'Lý', value:'Lý'},
                    {label:'Hóa', value:'Hóa'},
                    {label:'Sinh', value:'Sinh'},
                    {label:'Văn', value:'Văn'},
                    {label:'Anh', value:'Anh'},
                    {label:'Địa', value:'Địa'},
                    {label:'Lịch sử', value:'Lịch sử'}
                  ]
                } 
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{width:'100%'}}>
                {isEditMode ? "Cập nhật" : "Lưu sự kiện"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </AppLayout>
    )
  }