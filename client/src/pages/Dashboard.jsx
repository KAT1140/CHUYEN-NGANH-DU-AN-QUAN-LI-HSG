import React, { useState, useEffect } from 'react'
import { Layout, Calendar, Card, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, message } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

const { Header, Content } = Layout

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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
  const [form] = Form.useForm();
  
  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole') || 'user';
  const canAddSchedule = userRole !== 'user'; // Only admin and teacher can add schedules

  // Fetch schedules
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth(`${API_BASE}/schedules`);
      if (res.error === 'Unauthorized') {
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

  // Lấy schedules cho ngày được chọn
  const getSchedulesForDate = (date) => {
    return schedules.filter(schedule => 
      dayjs(schedule.date).isSame(date, 'day')
    );
  };

  const daySchedules = getSchedulesForDate(selectedDate);

  const handleAddEvent = async (values) => {
    try {
      message.loading({ content: 'Đang tạo lịch...', key: 'createSchedule' });
      const res = await fetchAuth(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          date: values.date.format('YYYY-MM-DD'),
          time: values.time ? values.time.format('HH:mm:ss') : '09:00:00',
          type: values.type || 'event'
        })
      });

      if (res.error === 'Unauthorized') {
        message.error({ content: 'Phiên đăng nhập hết hạn', key: 'createSchedule' });
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        message.error({ content: data.error || 'Lỗi tạo lịch', key: 'createSchedule' });
        return;
      }

      message.success({ content: 'Tạo lịch thành công', key: 'createSchedule', duration: 1 });
      fetchSchedules();
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      message.error('Lỗi mạng');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Xóa lịch này?')) return;
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
                  {canAddSchedule && (
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        form.setFieldsValue({ date: selectedDate })
                        setIsModalVisible(true)
                      }}
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
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteEvent(schedule.id)}
                          danger
                        />
                      }
                    >
                      <div><strong>{schedule.time || '09:00'}</strong> - {schedule.title}</div>
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

        {/* Modal thêm sự kiện */}
        <Modal
          title="Thêm sự kiện"
          open={isModalVisible}
          footer={null}
          onCancel={() => {
            setIsModalVisible(false)
            form.resetFields()
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleAddEvent}>
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
                Lưu sự kiện
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}
