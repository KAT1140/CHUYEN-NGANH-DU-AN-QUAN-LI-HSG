// File: client/src/pages/Evaluations.jsx

import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Rate, DatePicker, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getEvaluations, getTeams, createEvaluation, deleteEvaluation } from '../utils/api'

export default function Evaluations(){
  const [evaluations, setEvaluations] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
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
        rating: values.rating || 5, // Mặc định 5 sao nếu không chọn
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      }
      
      const res = await createEvaluation(payload)
      
      if (res.error) {
        message.error(res.error)
      } else {
        message.success('Đã thêm đánh giá thành công!')
        setIsModalVisible(false)
        form.resetFields()
        fetchData() // Tải lại danh sách ngay lập tức
      }
    } catch (err) {
      console.error(err)
      message.error('Lỗi hệ thống hoặc kết nối mạng')
    }
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
      width: '40%'
    },
    {
      title: 'Thái độ',
      dataIndex: 'rating',
      render: (r) => <Rate disabled defaultValue={r} count={10} style={{fontSize:12}} />
    },
    {
      title: 'Giáo viên',
      dataIndex: ['teacher', 'name'],
      render: (text) => <Tag color="blue">{text || 'Admin'}</Tag>
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => canManage && (
        <Button danger icon={<DeleteOutlined/>} size="small" onClick={()=>handleDelete(record.id)} />
      )
    }
  ]

  return (
    <div>
      <Space style={{marginBottom:16}}>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined/>} onClick={()=>setIsModalVisible(true)}>
            Thêm đánh giá
          </Button>
        )}
        <Button icon={<ReloadOutlined/>} onClick={fetchData}>Làm mới</Button>
      </Space>

      <Table 
        dataSource={evaluations} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        locale={{ emptyText: 'Chưa có đánh giá nào' }}
      />

      <Modal
        title="Thêm đánh giá học sinh"
        open={isModalVisible}
        onCancel={()=>{ setIsModalVisible(false); form.resetFields(); }}
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

          <Form.Item name="rating" label="Điểm chuyên cần / Thái độ (1-10)" initialValue={8}>
            <Rate count={10} />
          </Form.Item>

          <Form.Item 
            name="content" 
            label="Nội dung nhận xét" 
            rules={[{required:true, message: 'Vui lòng nhập nhận xét!'}]}
          >
            <Input.TextArea rows={4} placeholder="Ví dụ: Em làm bài tập đầy đủ, tích cực phát biểu..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{width:'100%'}}>Lưu đánh giá</Button>
        </Form>
      </Modal>
    </div>
  )
}