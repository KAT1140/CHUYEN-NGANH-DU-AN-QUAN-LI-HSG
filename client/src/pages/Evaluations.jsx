// File: client/src/pages/Evaluations.jsx

import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, DatePicker, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getEvaluations, getTeams, createEvaluation, deleteEvaluation, updateEvaluation } from '../utils/api'
import AppLayout from '../components/Layout/AppLayout'
import AppCard from '../components/UI/AppCard'

export default function Evaluations(){
  const [evaluations, setEvaluations] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()
  
  const userRole = localStorage.getItem('userRole') || 'user'
  const canManage = userRole !== 'user'

  const fetchData = async () => {
    setLoading(true)
    try {
      const [evalData, teamsData] = await Promise.all([
        getEvaluations(),
        getTeams()
      ])
      
      setEvaluations(evalData.evaluations || [])
      
      // Lấy danh sách thành viên từ các đội để đưa vào dropdown
      if (teamsData.teams) {
        const allMembers = []
        teamsData.teams.forEach(team => {
          if (team.members) {
            team.members.forEach(m => {
              allMembers.push({
                id: m.id,
                name: m.name,
                studentId: m.studentId,
                teamName: team.name
              })
            })
          }
        })
        setMembers(allMembers)
      }
    } catch (err) {
      message.error('Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async (values) => {
    try {
      // Chuẩn bị dữ liệu gửi về server
      const payload = {
        memberId: values.memberId,
        content: values.content,
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      }
      
      let res;
      if (isEditMode) {
        res = await updateEvaluation(editingId, payload)
        message.success('Đã cập nhật đánh giá thành công!')
      } else {
        res = await createEvaluation(payload)
        message.success('Đã thêm đánh giá thành công!')
      }
      
      if (res.error) {
        message.error(res.error)
      } else {
        setIsModalVisible(false)
        form.resetFields()
        setIsEditMode(false)
        setEditingId(null)
        fetchData() // Tải lại danh sách ngay lập tức
      }
    } catch (err) {
      console.error(err)
      message.error('Lỗi hệ thống hoặc kết nối mạng')
    }
  }

  const handleEdit = (record) => {
    setIsEditMode(true)
    setEditingId(record.id)
    form.setFieldsValue({
      memberId: record.memberId,
      content: record.content,
      date: record.date ? dayjs(record.date) : dayjs()
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return
    try {
        const res = await deleteEvaluation(id)
        if (res.error) message.error(res.error)
        else {
            message.success('Đã xóa đánh giá')
            fetchData()
        }
    } catch (err) {
        message.error('Lỗi khi xóa')
    }
  }

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: ['member', 'name'],
      key: 'studentName',
      render: (text, record) => (
        <div>
          <div style={{fontWeight:600}}>{text || 'Không xác định'}</div>
          <div style={{fontSize:12, color:'#888'}}>{record.member?.studentId}</div>
        </div>
      )
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : ''
    },
    {
      title: 'Đánh giá / Nhận xét',
      dataIndex: 'content',
      width: '50%'
    },
    {
      title: 'Giáo viên',
      dataIndex: ['teacher', 'name'],
      render: (text, record) => {
        // Hiển thị tên giáo viên phụ trách team
        const teacherName = text || 'N/A';
        const subject = record.member?.team?.subject;
        return (
          <Tag color="blue">
            {teacherName}
            {subject && <div style={{fontSize: '10px', opacity: 0.8}}>({subject})</div>}
          </Tag>
        );
      }
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => canManage && (
        <Space>
          <Button 
            icon={<EditOutlined/>} 
            size="small" 
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Button 
            danger 
            icon={<DeleteOutlined/>} 
            size="small" 
            onClick={() => handleDelete(record.id)}
            title="Xóa"
          />
        </Space>
      )
    }
  ]

  return (
    <AppLayout 
      title="Đánh giá Học sinh" 
      subtitle="Theo dõi và đánh giá quá trình học tập của học sinh"
    >
      <AppCard 
        title="Danh sách đánh giá"
        variant="glass"
        extra={
          <Space>
            {canManage && (
              <Button type="primary" icon={<PlusOutlined/>} onClick={()=>setIsModalVisible(true)}>
                Thêm đánh giá
              </Button>
            )}
            <Button icon={<ReloadOutlined/>} onClick={fetchData}>Làm mới</Button>
          </Space>
        }
      >
        <Table 
          dataSource={evaluations} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          locale={{ emptyText: 'Chưa có đánh giá nào' }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`
          }}
          scroll={{ x: 1000 }}
        />
      </AppCard>

      <Modal
        title={isEditMode ? "Chỉnh sửa đánh giá" : "Thêm đánh giá học sinh"}
        open={isModalVisible}
        onCancel={() => { 
          setIsModalVisible(false); 
          form.resetFields(); 
          setIsEditMode(false);
          setEditingId(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item 
            name="memberId" 
            label="Chọn học sinh" 
            rules={[{required:true, message: 'Vui lòng chọn học sinh!'}]}
          >
            <Select 
              placeholder="Tìm kiếm tên hoặc mã số..." 
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={members.map(m => ({
                value: m.id,
                label: `${m.name} - ${m.teamName} (${m.studentId})`
              }))}
            />
          </Form.Item>

          <Form.Item name="date" label="Ngày đánh giá" initialValue={dayjs()}>
            <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item 
            name="content" 
            label="Nội dung nhận xét" 
            rules={[{required:true, message: 'Vui lòng nhập nhận xét!'}]}
          >
            <Input.TextArea rows={4} placeholder="Ví dụ: Em làm bài tập đầy đủ, tích cực phát biểu..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{width:'100%'}}>
            {isEditMode ? 'Cập nhật đánh giá' : 'Lưu đánh giá'}
          </Button>
        </Form>
      </Modal>
    </AppLayout>
  )
}