// File: client/src/pages/Students.jsx
import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Tag, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { getAllStudents, createStudent, updateStudent, deleteStudent } from '../utils/api'
import AppLayout from '../components/Layout/AppLayout'
import AppCard from '../components/UI/AppCard'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('');
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
      grade: record.grade,
      className: record.className,
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
    {
      title: 'Mã số',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (text) => <Tag color="blue">{text}</Tag>,
      sorter: (a, b) => {
        const idA = a.studentId || '';
        const idB = b.studentId || '';
        return idA.localeCompare(idB, 'vi', { numeric: true });
      },
      defaultSortOrder: 'ascend'
    },
    { 
      title: 'Họ và Tên', 
      dataIndex: 'name',
      render: (text) => <b>{text}</b>
    },
    {
      title: 'Khối',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => {
        if (!grade) return <Tag color="default">Chưa xác định</Tag>;
        const colors = {
          '10': 'green',
          '11': 'orange', 
          '12': 'red'
        };
        return <Tag color={colors[grade] || 'blue'}>Khối {grade}</Tag>;
      },
      filters: [
        { text: 'Khối 10', value: '10' },
        { text: 'Khối 11', value: '11' },
        { text: 'Khối 12', value: '12' }
      ],
      onFilter: (value, record) => record.grade === value,
      sorter: (a, b) => (a.grade || '').localeCompare(b.grade || '')
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      render: (className) => {
        if (!className) return <span style={{ color: '#999' }}>Chưa có lớp</span>;
        
        // Color code based on class type
        const isAClass = className.includes('A');
        const color = isAClass ? 'blue' : 'green';
        return <Tag color={color}>{className}</Tag>;
      },
      filters: [
        { text: 'Lớp A', value: 'A' },
        { text: 'Lớp T', value: 'T' }
      ],
      onFilter: (value, record) => record.className && record.className.includes(value),
      sorter: (a, b) => (a.className || '').localeCompare(b.className || '')
    },
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

  if (userRole === 'user') {
    return (
      <AppLayout title="Không có quyền truy cập">
        <AppCard>
          <div style={{padding:20, textAlign: 'center'}}>
            Bạn không có quyền truy cập trang này.
          </div>
        </AppCard>
      </AppLayout>
    );
  }

  // Lọc học sinh theo tên hoặc mã số
  const filteredStudents = students.filter(s => {
    const search = searchText.trim().toLowerCase();
    if (!search) return true;
    return (
      (s.name && s.name.toLowerCase().includes(search)) ||
      (s.studentId && s.studentId.toLowerCase().includes(search))
    );
  });

  return (
    <AppLayout 
      title="Quản lý Học sinh" 
      subtitle="Danh sách và thông tin học sinh trong hệ thống"
    >
      <AppCard 
        title="Danh sách học sinh"
        variant="glass"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              Thêm học sinh
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchStudents}>
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* Search and Filter Section */}
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Input.Search
              allowClear
              placeholder="Tìm kiếm theo tên hoặc mã số"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <span>Tổng: <b>{filteredStudents.length}</b> học sinh</span>
          </Space>
        </div>

        <Table 
          dataSource={filteredStudents} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} học sinh`
          }}
          scroll={{ x: 800 }}
        />
      </AppCard>

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
            name="grade" 
            label="Khối"
          >
            <Select placeholder="Chọn khối" allowClear>
              <Select.Option value="10">Khối 10</Select.Option>
              <Select.Option value="11">Khối 11</Select.Option>
              <Select.Option value="12">Khối 12</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="className" 
            label="Lớp"
          >
            <Select 
              placeholder="Chọn lớp" 
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {/* Khối 10 */}
              <Select.OptGroup label="Khối 10">
                <Select.Option value="10A1">10A1</Select.Option>
                <Select.Option value="10A2">10A2</Select.Option>
                <Select.Option value="10A3">10A3</Select.Option>
                <Select.Option value="10T1">10T1</Select.Option>
                <Select.Option value="10T2">10T2</Select.Option>
                <Select.Option value="10T3">10T3</Select.Option>
              </Select.OptGroup>
              
              {/* Khối 11 */}
              <Select.OptGroup label="Khối 11">
                <Select.Option value="11A1">11A1</Select.Option>
                <Select.Option value="11A2">11A2</Select.Option>
                <Select.Option value="11A3">11A3</Select.Option>
                <Select.Option value="11T1">11T1</Select.Option>
                <Select.Option value="11T2">11T2</Select.Option>
                <Select.Option value="11T3">11T3</Select.Option>
              </Select.OptGroup>
              
              {/* Khối 12 */}
              <Select.OptGroup label="Khối 12">
                <Select.Option value="12A1">12A1</Select.Option>
                <Select.Option value="12A2">12A2</Select.Option>
                <Select.Option value="12A3">12A3</Select.Option>
                <Select.Option value="12T1">12T1</Select.Option>
                <Select.Option value="12T2">12T2</Select.Option>
                <Select.Option value="12T3">12T3</Select.Option>
              </Select.OptGroup>
            </Select>
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
    </AppLayout>
  )
}