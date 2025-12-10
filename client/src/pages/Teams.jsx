import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, message } from 'antd'
import { getTeams, createTeam } from '../utils/api'
import { TeamOutlined, ReloadOutlined } from '@ant-design/icons'

export default function Teams(){
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm() 

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await getTeams()
      setTeams(data.teams || [])
      message.success('Đã tải danh sách đội')
    } catch (err) {
      message.error('Lấy danh sách đội lỗi')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ fetchTeams() }, [])

  const onCreate = async (values) => {
    try {
      message.loading({ content: 'Đang tạo đội...', key: 'createTeamLoading' });
      await createTeam(values)
      
      message.success({ content: 'Tạo đội thành công', key: 'createTeamLoading', duration: 1 });
      
      setIsModalVisible(false)
      form.resetFields() 
      fetchTeams()
      
    } catch (err) {
      message.error({ content: 'Tạo đội lỗi', key: 'createTeamLoading' });
    }
  }
  
  // Hàm xử lý khi Modal bị đóng
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(); 
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tên đội', dataIndex: 'name', key: 'name' }, 
    { title: 'Khối', dataIndex: 'grade', key: 'grade' }    
  ]

  return (
    <div>
      <Space style={{marginBottom:16}}>
        <Button 
          type="primary" 
          icon={<TeamOutlined />} 
          onClick={()=>setIsModalVisible(true)}
        >
          Tạo đội mới
        </Button>
        <Button onClick={fetchTeams} icon={<ReloadOutlined />} loading={loading}>
          Làm mới
        </Button>
      </Space>

      <Table dataSource={teams} columns={columns} rowKey="id" loading={loading} />

      <Modal 
        title="Tạo đội mới" 
        open={isModalVisible} 
        footer={null} 
        onCancel={handleCancel} 
        destroyOnClose 
      >
        {/* TRUYỀN form instance vào Form component */}
        <Form form={form} layout="vertical" onFinish={onCreate}>
          <Form.Item 
            name="name" 
            label="Tên đội" 
            rules={[{ required: true, message: 'Vui lòng nhập tên đội!' }]} 
          > 
            <Input/> 
          </Form.Item>
          
          <Form.Item name="grade" label="Khối"> 
            <Input placeholder="Ví dụ: 10, 11"/> 
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">Tạo</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}