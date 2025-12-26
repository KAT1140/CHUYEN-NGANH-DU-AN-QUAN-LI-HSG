// File: client/src/pages/Teachers.jsx
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Tag, Select, Card, Statistic, Row, Col } from 'antd';
import { UserOutlined, ReloadOutlined, PlusOutlined, BookOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import AppCard from '../components/UI/AppCard';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const userRole = localStorage.getItem('userRole') || 'user';
  const canManageTeachers = userRole === 'admin';

  // Danh sách môn học
  const subjects = ['Toán', 'Lý', 'Hóa', 'Sinh', 'Văn', 'Anh', 'Sử', 'Địa', 'Tin'];

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

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      console.log('Fetched teams:', data.teams?.length || 0);
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách đội:', err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchTeams();
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
      const loadingKey = isEditMode ? 'updateTeacher' : 'createTeacher';
      const loadingText = isEditMode ? 'Đang cập nhật giáo viên...' : 'Đang tạo giáo viên...';
      
      message.loading({ content: loadingText, key: loadingKey });
      
      const token = localStorage.getItem('token');
      const url = isEditMode ? `${API_BASE}/teachers/${editingId}` : `${API_BASE}/teachers`;
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      const data = await res.json();
      
      if (data.error) {
        message.error({ content: data.error, key: loadingKey });
        return;
      }

      const successText = isEditMode ? 'Cập nhật giáo viên thành công!' : 'Tạo giáo viên thành công!';
      message.success({ content: successText, key: loadingKey });
      
      setIsModalVisible(false);
      form.resetFields();
      setIsEditMode(false);
      setEditingId(null);
      fetchTeachers();
    } catch (err) {
      const errorText = isEditMode ? 'Lỗi khi cập nhật giáo viên' : 'Lỗi khi tạo giáo viên';
      message.error({ content: errorText, key: isEditMode ? 'updateTeacher' : 'createTeacher' });
    }
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setEditingId(record.id);
    form.setFieldsValue({
      fullName: record.name,
      email: record.email,
      subject: record.subject,
      department: record.department,
      specialization: record.specialization,
      phoneNumber: record.phoneNumber,
      teamId: record.team ? record.team.id : null
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
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
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Môn dạy',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => {
        const colors = {
          'Toán': 'blue',
          'Lý': 'green', 
          'Hóa': 'orange',
          'Sinh': 'cyan',
          'Văn': 'purple',
          'Anh': 'magenta',
          'Sử': 'red',
          'Địa': 'gold',
          'Tin': 'lime'
        };
        return <Tag color={colors[subject] || 'blue'}>{subject}</Tag>;
      },
      filters: [
        { text: 'Toán', value: 'Toán' },
        { text: 'Lý', value: 'Lý' },
        { text: 'Hóa', value: 'Hóa' },
        { text: 'Sinh', value: 'Sinh' },
        { text: 'Văn', value: 'Văn' },
        { text: 'Anh', value: 'Anh' },
        { text: 'Sử', value: 'Sử' },
        { text: 'Địa', value: 'Địa' },
        { text: 'Tin', value: 'Tin' }
      ],
      onFilter: (value, record) => record.subject === value,
      sorter: (a, b) => a.subject.localeCompare(b.subject)
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
      render: (specialization) => specialization || '-'
    },
    {
      title: 'Đội phụ trách',
      dataIndex: 'team',
      key: 'team',
      render: (team) => {
        if (!team) {
          return <Tag color="default">Chưa có đội</Tag>;
        }
        return (
          <Tag color="blue" style={{ cursor: 'pointer' }}>
            {team.name}
          </Tag>
        );
      },
      sorter: (a, b) => {
        const teamA = a.team ? a.team.name : '';
        const teamB = b.team ? b.team.name : '';
        return teamA.localeCompare(teamB);
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => phone || 'Chưa cập nhật'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        canManageTeachers && (
          <Space>
            <Button 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id, record.name)}
            >
              Xóa
            </Button>
          </Space>
        )
      )
    }
  ];

  return (
    <AppLayout 
      title="Quản lý Giáo viên" 
      subtitle="Danh sách và thông tin giáo viên HSG"
    >
      <AppCard 
        title="Danh sách giáo viên"
        variant="glass"
        extra={
          <Space>
            {canManageTeachers && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
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
        }
      >
        {/* Filter Section */}
        <div style={{ marginBottom: 24 }}>
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
        </div>

        <Table 
          dataSource={filteredTeachers} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giáo viên`
          }}
          scroll={{ x: 1200 }}
        />
      </AppCard>

      <Modal
        title={isEditMode ? "Chỉnh sửa giáo viên" : "Thêm giáo viên mới"}
        open={isModalVisible}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setEditingId(null);
          form.resetFields();
        }}
        destroyOnClose
        centered
        width={600}
        zIndex={1060}
        maskClosable={false}
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

          <Form.Item 
            name="teamId" 
            label="Đội phụ trách"
          >
            <Select 
              placeholder="Chọn đội phụ trách"
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {teams.map(team => {
                const isAssigned = teachers.some(t => 
                  t.team && t.team.id === team.id && t.id !== editingId
                );
                return (
                  <Select.Option 
                    key={team.id} 
                    value={team.id}
                    disabled={isAssigned}
                  >
                    {team.name} - {team.subject} (Khối {team.grade})
                    {isAssigned && ' - Đã có giáo viên'}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {isEditMode ? 'Cập nhật giáo viên' : 'Tạo giáo viên'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default Teachers;
