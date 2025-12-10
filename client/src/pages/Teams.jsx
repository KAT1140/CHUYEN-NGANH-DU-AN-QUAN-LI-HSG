import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, message } from 'antd'
import { getTeams, createTeam } from '../utils/api'

export default function Teams(){
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await getTeams()
      setTeams(data.teams || [])
    } catch (err) {
      message.error('Lấy danh sách đội lỗi')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ fetchTeams() }, [])

  const onCreate = async (values) => {
    try {
      await createTeam(values)
      message.success('Tạo đội thành công')
      setIsModalVisible(false)
      fetchTeams()
    } catch (err) {
      message.error('Tạo đội lỗi')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Grade', dataIndex: 'grade', key: 'grade' }
  ]

  return (
    <div>
      <Space style={{marginBottom:16}}>
        <Button type="primary" onClick={()=>setIsModalVisible(true)}>Tạo đội mới</Button>
        <Button onClick={fetchTeams}>Làm mới</Button>
      </Space>

      <Table dataSource={teams} columns={columns} rowKey="id" loading={loading} />

      <Modal title="Tạo đội" open={isModalVisible} footer={null} onCancel={()=>setIsModalVisible(false)}>
        <Form layout="vertical" onFinish={onCreate}>
          <Form.Item name="name" label="Tên đội" rules={[{ required: true }]}> <Input/> </Form.Item>
          <Form.Item name="grade" label="Khối"> <Input/> </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Tạo</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
