// File: client/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react'
import { Layout, Calendar, Card, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, message } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

const { Header, Content } = Layout

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
  }, []);

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
    form.setFieldsValue({ date: selectedDate, type: 'event' });
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
      type: schedule.type
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
        type: values.type || 'event'
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
    const listData = getListData(value)
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item) => (
          <li key={item.content}>
            <Tag color={item.type === 'success' ? 'blue' : 'orange'}>{item.content}</Tag>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Layout style={{minHeight:'100vh'}}>
      <Header>
        <div style={{color:'#fff',fontWeight:700}}>HSG Management - Lịch Biểu</div>
      </Header>
      <Content style={{padding:24}}>
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:24}}>
          {/* Calendar */}
          <Card>
            <Calendar 
              value={selectedDate}
              onChange={handleDateSelect}
              dateCellRender={dateCellRender}
            />
          </Card>

          {/* Sidebar: Events for selected date */}
          <div>
            <Card 
              title={`Sự kiện ngày ${selectedDate.format('DD/MM/YYYY')}`}
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
                <Space direction="vertical" style={{width:'100%'}}>
                  {daySchedules.map(schedule => (
                    <Card 
                      key={schedule.id} 
                      size="small"
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
                      <div><strong>{schedule.time ? schedule.time.slice(0, 5) : '09:00'}</strong> - {schedule.title}</div>
                      {schedule.description && <div style={{fontSize:12, color:'#666'}}>{schedule.description}</div>}
                      <Tag color={schedule.type === 'meeting' ? 'blue' : 'orange'}>
                        {schedule.type === 'meeting' ? 'Cuộc họp' : 'Sự kiện'}
                      </Tag>
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
              name="type" 
              label="Loại"
              initialValue="event"
            >
              <Select options={[
                {label:'Sự kiện', value:'event'},
                {label:'Cuộc họp', value:'meeting'}
              ]} />
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