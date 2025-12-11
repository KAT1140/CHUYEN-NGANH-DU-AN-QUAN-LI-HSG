import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Collapse, Card, Tag } from 'antd'
import { getTeams, createTeam, getMembers, createMember } from '../utils/api' // Thêm getMembers, createMember
import { TeamOutlined, ReloadOutlined, UserAddOutlined, UserOutlined, ContactsOutlined } from '@ant-design/icons'

const { Panel } = Collapse;

// Component phụ để quản lý thành viên cho từng Team
function MemberManager({ teamId, teamName, initialMembers = [] }){
  const [members, setMembers] = useState(initialMembers);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getMembers(teamId);
      if (data.members) setMembers(data.members);
    } catch (err) {
      message.error('Lấy danh sách thành viên thất bại');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
      // Tải lại khi component được mount hoặc teamId thay đổi
      fetchMembers();
  }, [teamId]);

  const onAddMember = async (values) => {
    try {
      message.loading({ content: `Đang thêm thành viên cho ${teamName}...`, key: 'addMemberLoading' });
      const data = await createMember(teamId, values);
      
      if(data.error) {
        message.error({ content: data.error, key: 'addMemberLoading' });
      } else {
        message.success({ content: `Đã thêm thành viên ${values.name}`, key: 'addMemberLoading', duration: 1 });
        setIsMemberModalVisible(false);
        form.resetFields();
        fetchMembers(); // Tải lại danh sách
      }
    } catch (err) {
      message.error('Thêm thành viên lỗi mạng');
    }
  };

  const memberColumns = [
    { title: 'Tên thành viên', dataIndex: 'name', key: 'name' },
    { title: 'Mã số HS', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Liên hệ', dataIndex: 'contact', key: 'contact' },
  ];

  return (
    <Card size="small" title="Danh sách Thành viên" extra={
      <Button 
        type="primary" 
        size="small" 
        icon={<UserAddOutlined />} 
        onClick={() => setIsMemberModalVisible(true)}
      >
        Thêm thành viên
      </Button>
    }>
      <Table 
        dataSource={members} 
        columns={memberColumns} 
        rowKey="id" 
        size="small" 
        loading={loading}
        pagination={false} 
      />
      
      <Modal
        title={`Thêm thành viên cho đội ${teamName}`}
        open={isMemberModalVisible}
        footer={null}
        onCancel={() => { setIsMemberModalVisible(false); form.resetFields(); }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onAddMember}>
          <Form.Item name="name" label="Họ và Tên" rules={[{ required: true }]}> 
            <Input/> 
          </Form.Item>
          <Form.Item name="studentId" label="Mã số học sinh" rules={[{ required: true }]}> 
            <Input/> 
          </Form.Item>
          <Form.Item name="contact" label="Liên hệ (Email/SĐT)"> 
            <Input/> 
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Thêm</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
// ------------------------------------------------------------------

// Component chính Teams
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
      const data = await createTeam(values)
      
      if (data.error) {
        message.error({ content: data.error, key: 'createTeamLoading' });
        return;
      }
      
      message.success({ content: 'Tạo đội thành công', key: 'createTeamLoading', duration: 1 });
      
      setIsModalVisible(false)
      form.resetFields() 
      fetchTeams()
      
    } catch (err) {
      message.error({ content: 'Tạo đội lỗi mạng', key: 'createTeamLoading' });
    }
  }
  
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields(); 
  };
  
  // Dùng Collapse cho giao diện quản lý Team và Member
  const teamItems = teams.map((team) => ({
    key: team.id.toString(),
    label: (
      <Space>
        <TeamOutlined />
        <strong>{team.name}</strong> 
        <Tag color="blue">Khối {team.grade}</Tag>
      </Space>
    ),
    children: <MemberManager teamId={team.id} teamName={team.name} />,
  }));


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
          Làm mới danh sách đội
        </Button>
      </Space>

      <Collapse items={teamItems} />

      <Modal 
        title="Tạo đội mới" 
        open={isModalVisible} 
        footer={null} 
        onCancel={handleCancel} 
        destroyOnClose 
      >
        <Form form={form} layout="vertical" onFinish={onCreate}> 
          <Form.Item 
            name="name" 
            label="Tên đội" 
            rules={[{ required: true, message: 'Vui lòng nhập tên đội!' }]} 
          > 
            <Input placeholder="Ví dụ: HSG Lý 11"/> 
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