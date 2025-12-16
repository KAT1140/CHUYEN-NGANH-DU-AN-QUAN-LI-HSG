// File: client/src/pages/Evaluations.jsx
import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Rate, DatePicker, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, SmileOutlined } from '@ant-design/icons'
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
      const payload = {
        memberId: values.memberId,
        content: values.content,
        rating: values.rating,
        date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      }
      
      const res = await createEvaluation(payload)
      if (res.error) {
        message.error(res.error)
      } else {
        message.success('Đã thêm đánh giá')
        setIsModalVisible(false)
        form.resetFields()
        fetchData()
      }
    } catch (err) {
      message.error('Lỗi hệ thống')
    }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Xóa đánh giá này?')) return
    await deleteEvaluation(id)
    message.success('Đã xóa')
    fetchData()
  }

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: ['member', 'name'],
      key: 'studentName',
      render: (text, record) => (
        <div>
          <div style={{fontWeight:600}}>{text}</div>
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
      title: 'Mức độ',
      dataIndex: 'rating',
      render: (r) => <Rate disabled defaultValue={r} count={10} style={{fontSize:12}} />
    },
    {
      title: 'Giáo viên',
      dataIndex: ['teacher', 'name'],
      render: (text) => <Tag color="blue">{text}</Tag>
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
      />

      <Modal
        title="Đánh giá quá trình ôn"
        open={isModalVisible}
        onCancel={()=>setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="memberId" label="Chọn học sinh" rules={[{required:true}]}>
            <Select 
              placeholder="Tìm học sinh..." 
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

          <Form.Item name="rating" label="Điểm chuyên cần / Thái độ (1-10)">
            <Rate count={10} />
          </Form.Item>

          <Form.Item name="content" label="Nội dung nhận xét" rules={[{required:true}]}>
            <Input.TextArea rows={4} placeholder="Ví dụ: Em làm bài tập đầy đủ, tích cực phát biểu..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{width:'100%'}}>Lưu đánh giá</Button>
        </Form>
      </Modal>
    </div>
  )
}