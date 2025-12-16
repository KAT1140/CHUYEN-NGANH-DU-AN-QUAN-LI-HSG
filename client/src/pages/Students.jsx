// File: client/src/pages/Students.jsx
import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { getAllStudents, createStudent, updateStudent, deleteStudent } from '../utils/api'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  // Kiểm tra quyền (chỉ admin/teacher mới được vào trang này, nhưng check thêm ở render cho chắc)
  const userRole = localStorage.getItem('userRole');

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const data = await getAllStudents()
      if (data.students) setStudents(data.students)
      else if (data.error) message.error(data.error)
    } catch (err) {
      message.error('Lỗi tải danh sách')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudents() }, [])

  const handleSave = async (values) => {
    try {
      let res;
      if (editingId) {
        res = await updateStudent(editingId, values);
      } else {
        res = await createStudent(values);
      }

      if (res.error) {
        message.error(res.error);
      } else {
        message.success(editingId ? 'Cập nhật thành công' : 'Tạo học sinh thành công');
        setIsModalVisible(false);
        form.resetFields();
        setEditingId(null);
        fetchStudents();
      }
    } catch (err) {
      message.error('Lỗi hệ thống');
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa học sinh này? Hành động này sẽ xóa học sinh khỏi tất cả các đội.')) return;
    try {
      const res = await deleteStudent(id);
      if (res.error) message.error(res.error);
      else {
        message.success('Đã xóa');
        fetchStudents();
      }
    } catch (err) {
      message.error('Lỗi xóa');
    }
  }

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      password: '' // Không hiện password cũ
    });
    setIsModalVisible(true);
  }

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { 
      title: 'Họ và Tên', 
      dataIndex: 'name',
      render: (text) => <b>{text}</b>
    },
    { 
      title: 'Mã số / Email', 
      dataIndex: 'email',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Sửa</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>Xóa</Button>
        </Space>
      )
    }
  ];

  if (userRole === 'user') return <div style={{padding:20}}>Bạn không có quyền truy cập trang này.</div>;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm học sinh</Button>
        <Button icon={<ReloadOutlined />} onClick={fetchStudents}>Làm mới</Button>
      </Space>

      <Table 
        dataSource={students} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Cập nhật thông tin học sinh" : "Thêm học sinh mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item 
            name="name" 
            label="Họ và Tên" 
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item 
            name="email" 
            label="Mã số học sinh (Email đăng nhập)" 
            rules={[{ required: true, message: 'Vui lòng nhập mã số' }]}
          >
            <Input placeholder="HS12345" disabled={!!editingId} /> {/* Có thể cho phép sửa email nếu muốn, bỏ disabled đi */}
          </Form.Item>

          <Form.Item 
            name="password" 
            label={editingId ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu"}
            rules={[{ required: !editingId, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            {editingId ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </Form>
      </Modal>
    </div>
  )
}