// File: client/src/pages/Teachers.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Tag, Select, Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, ReloadOutlined, PlusOutlined, BookOutlined } from '@ant-design/icons';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [form] = Form.useForm();

  const userRole = localStorage.getItem('userRole') || 'user';
  const canManageTeachers = userRole === 'admin';

  // Danh sách môn học
  const subjects = ['Toán', 'Vật Lý', 'Hóa học', 'Sinh học', 'Ngữ Văn', 'Tiếng Anh', 'Lịch Sử', 'Địa Lý', 'GDCD'];

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setTeachers(data.teachers || []);
      setFilteredTeachers(data.teachers || []);
    } catch (err) {
      message.error('Lỗi khi tải danh sách giáo viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Filter teachers by subject
  useEffect(() => {
    if (selectedSubject === 'all') {
      setFilteredTeachers(teachers);
    } else {
      setFilteredTeachers(teachers.filter(t => t.subject === selectedSubject));
    }
  }, [selectedSubject, teachers]);

  // Calculate statistics
  const getSubjectCount = (subject) => {
    return teachers.filter(t => t.subject === subject).length;
  };

  const onCreate = async (values) => {
    try {
      message.loading({ content: 'Đang tạo giáo viên...', key: 'createTeacher' });
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      const data = await res.json();
      
      if (data.error) {
        message.error({ content: data.error, key: 'createTeacher' });
        return;
      }

      message.success({ content: 'Tạo giáo viên thành công!', key: 'createTeacher' });
      setIsModalVisible(false);
      form.resetFields();
      fetchTeachers();
    } catch (err) {
      message.error({ content: 'Lỗi khi tạo giáo viên', key: 'createTeacher' });
    }
  };

  const handleDelete = async (id, name) => {
    Modal.confirm({
      title: 'Xóa giáo viên',
      content: `Bạn có chắc chắn muốn xóa giáo viên "${name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          message.loading({ content: 'Đang xóa...', key: 'deleteTeacher' });
          
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/teachers/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await res.json();
          
          if (data.error) {
            message.error({ content: data.error, key: 'deleteTeacher' });
            return;
          }

          message.success({ content: 'Xóa giáo viên thành công!', key: 'deleteTeacher' });
          fetchTeachers();
        } catch (err) {
          message.error({ content: 'Lỗi khi xóa giáo viên', key: 'deleteTeacher' });
        }
      }
    });
  };

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName)
    },
    {
      title: 'Môn dạy',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => <Tag color="blue">{subject}</Tag>,
      filters: [
        { text: 'Toán', value: 'Toán' },
        { text: 'Vật Lý', value: 'Vật Lý' },
        { text: 'Hóa học', value: 'Hóa học' },
        { text: 'Sinh học', value: 'Sinh học' },
        { text: 'Ngữ Văn', value: 'Ngữ Văn' },
        { text: 'Tiếng Anh', value: 'Tiếng Anh' }
      ],
      onFilter: (value, record) => record.subject === value
    },
    {
      title: 'Tổ môn',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept || '-'
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialization',
      key: 'specialization',
      ellipsis: true,
      render: (spec) => spec || '-'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => phone || '-'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        canManageTeachers && (
          <Button 
            danger 
            size="small" 
            onClick={() => handleDelete(record.id, record.fullName)}
          >
            Xóa
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <h2><UserOutlined /> Quản lý Giáo viên</h2>
      </Space>
      
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          {canManageTeachers && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIsModalVisible(true)}
            >
              Thêm giáo viên
            </Button>
          )}
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchTeachers} 
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>

        <Space>
          <span>Lọc theo môn:</span>
          <Select 
            value={selectedSubject} 
            onChange={setSelectedSubject}
            style={{ width: 150 }}
          >
            <Select.Option value="all">Tất cả</Select.Option>
            {subjects.map(subject => (
              <Select.Option key={subject} value={subject}>
                {subject} ({getSubjectCount(subject)})
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Space>

      <Table 
        dataSource={filteredTeachers} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Thêm giáo viên mới"
        open={isModalVisible}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onCreate}>
          <Form.Item 
            name="fullName" 
            label="Họ và tên" 
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item 
            name="email" 
            label="Email" 
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="gv.email@hsg.edu.vn" />
          </Form.Item>

          <Form.Item 
            name="subject" 
            label="Môn dạy" 
            rules={[{ required: true, message: 'Vui lòng nhập môn dạy!' }]}
          >
            <Input placeholder="Toán, Lý, Hóa, Sinh, Văn, Anh..." />
          </Form.Item>

          <Form.Item 
            name="department" 
            label="Tổ môn"
          >
            <Input placeholder="Tổ Toán, Tổ Khoa học Tự nhiên..." />
          </Form.Item>

          <Form.Item 
            name="specialization" 
            label="Chuyên môn / Lĩnh vực"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Đại số, Hình học không gian, Giải tích..."
            />
          </Form.Item>

          <Form.Item 
            name="phoneNumber" 
            label="Số điện thoại"
          >
            <Input placeholder="0901234567" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Tạo giáo viên
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teachers;
