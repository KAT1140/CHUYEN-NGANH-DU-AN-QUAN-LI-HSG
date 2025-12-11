import React, { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Collapse, Card, Tag, Typography } from 'antd'
import { getTeams, createTeam, getMembers, createMember } from '../utils/api' 
import { TeamOutlined, ReloadOutlined, UserAddOutlined } from '@ant-design/icons'

const { Title, Text } = Typography;
const { Panel } = Collapse;

// =====================================================================
// COMPONENT PHỤ: QUẢN LÝ THÀNH VIÊN (MemberManager)
// =====================================================================
function MemberManager({ teamId, teamName }){
  const [members, setMembers] = useState([]);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // HÀM SỬ DỤNG AWAIT -> PHẢI CÓ ASYNC
  const fetchMembers = async () => { 
    setLoading(true);
    try {
      const data = await getMembers(teamId); // <-- CÓ AWAIT
      if (data.members) setMembers(data.members);
    } catch (err) {
      message.error('Lấy danh sách thành viên thất bại');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
      fetchMembers(); // Gọi hàm async
  }, [teamId]);

  // HÀM SỬ DỤNG AWAIT -> PHẢI CÓ ASYNC
  const onAddMember = async (values) => {
    try {
      message.loading({ content: `Đang thêm thành viên cho ${teamName}...`, key: 'addMemberLoading' });
      
      const data = await createMember(teamId, values); // <-- CÓ AWAIT
      
      if(data.error) {
        message.error({ content: data.error, key: 'addMemberLoading' });
        return;
      } 
      
      message.success({ 
          content: `Thành công! TK: ${values.studentId}, MK: 123456`, 
          key: 'addMemberLoading', 
          duration: 4 
      });
      
      setIsMemberModalVisible(false);
      form.resetFields();
      fetchMembers(); 
      
    } catch (err) {
      message.error('Thêm thành viên lỗi mạng');
    }
  };

  const memberColumns = [
    { title: 'Tên thành viên', dataIndex: 'name', key: 'name' },
    { title: 'Mã số HS (Email ĐN)', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Liên hệ', dataIndex: 'contact', key: 'contact' },
  ];

  return (
    <Card 
      size="small" 
      title={<Text strong>Danh sách Thành viên ({members.length})</Text>} 
      extra={
        <Button 
          type="primary" 
          size="small" 
          icon={<UserAddOutlined />} 
          onClick={() => setIsMemberModalVisible(true)}
        >
          Thêm thành viên
        </Button>
      }
    >
      <Table 
        dataSource={members} 
        columns={memberColumns} 
        rowKey="id" 
        size="small" 
        loading={loading}
        pagination={false} 
      />
      
      {/* Modal Thêm Thành viên */}
      <Modal
        title={`Thêm thành viên cho đội ${teamName}`}
        open={isMemberModalVisible}
        footer={null}
        onCancel={() => { setIsMemberModalVisible(false); form.resetFields(); }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onAddMember}>
          <Form.Item name="name" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}> 
            <Input/> 
          </Form.Item>
          <Form.Item name="studentId" label="Mã số học sinh (Dùng làm Email ĐN)" rules={[{ required: true, message: 'Vui lòng nhập mã số học sinh!' }]}> 
            <Input/> 
          </Form.Item>
          <Form.Item name="contact" label="Liên hệ (SĐT/Zalo)"> 
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
// =====================================================================
// COMPONENT CHÍNH: TEAMS
// =====================================================================
export default function Teams(){
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm() 

  // HÀM SỬ DỤNG AWAIT -> PHẢI CÓ ASYNC
  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await getTeams() // <-- CÓ AWAIT
      setTeams(data.teams || [])
      message.success('Đã tải danh sách đội')
    } catch (err) {
      message.error('Lấy danh sách đội lỗi')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ fetchTeams() }, [])

  // HÀM SỬ DỤNG AWAIT -> PHẢI CÓ ASYNC
  const onCreate = async (values) => {
    try {
      message.loading({ content: 'Đang tạo đội...', key: 'createTeamLoading' });
      const data = await createTeam(values) // <-- CÓ AWAIT
      
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
  
  const teamItems = teams.map((team) => ({
    key: team.id.toString(),
    label: (
      <Space>
        <TeamOutlined />
        <strong>{team.name}</strong> 
        {team.grade && <Tag color="blue">Khối {team.grade}</Tag>}
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

// --- HÀM XỬ LÝ SỬA ---
  const handleEdit = (member) => {
    setEditingMember(member);
    setIsEditModalVisible(true);
    editForm.setFieldsValue(member); // Đặt giá trị mặc định cho form
  };

  const onUpdateMember = async (values) => {
    try {
      message.loading({ content: `Đang cập nhật ${values.name}...`, key: 'updateMemberLoading' });
      
      const data = await updateMember(teamId, editingMember.id, values);
      
      if(data.error) {
        message.error({ content: data.error, key: 'updateMemberLoading' });
        return;
      } 
      
      message.success({ content: 'Cập nhật thành công!', key: 'updateMemberLoading', duration: 2 });
      setIsEditModalVisible(false);
      setEditingMember(null);
      fetchMembers(); 

    } catch (err) {
      message.error('Lỗi mạng khi cập nhật.');
    }
  };

  // --- HÀM XỬ LÝ XÓA ---
  const handleDelete = async (memberId, memberName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${memberName} không? Hành động này sẽ xóa cả tài khoản liên kết!`)) {
        return;
    }
    try {
        message.loading({ content: `Đang xóa ${memberName}...`, key: 'deleteMemberLoading' });
        const data = await deleteMember(teamId, memberId);
        
        if (data.error) {
            message.error({ content: data.error, key: 'deleteMemberLoading' });
            return;
        }

        message.success({ content: 'Xóa thành viên thành công', key: 'deleteMemberLoading', duration: 1 });
        fetchMembers();
    } catch (err) {
        message.error('Xóa thất bại do lỗi mạng/server.');
    }
  };

  // Cột hiển thị và Thao tác
  const memberColumns = [
    { title: 'Tên thành viên', dataIndex: 'name', key: 'name' },
    { title: 'Mã số HS (Email ĐN)', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Liên hệ', dataIndex: 'contact', key: 'contact' },
    {
        title: 'Thao tác',
        key: 'action',
        render: (_, record) => (
            <Space size="small">
                <Button 
                    icon={<EditOutlined />} 
                    size="small" 
                    onClick={() => handleEdit(record)}
                >
                    Sửa
                </Button>
                <Button 
                    icon={<DeleteOutlined />} 
                    size="small" 
                    danger 
                    onClick={() => handleDelete(record.id, record.name)}
                >
                    Xóa
                </Button>
            </Space>
        ),
    },
  ];

  return (
    <>
      <Card 
        // ... (phần Card và Table giữ nguyên)
      >
        <Table 
          dataSource={members} 
          columns={memberColumns} // <-- Dùng cột mới có nút Thao tác
          rowKey="id" 
          size="small" 
          loading={loading}
          pagination={false} 
        />
        
        {/* Modal Thêm Thành viên (Giữ nguyên) */}
        {/* ... (Modal Thêm Thành viên) ... */}
      </Card>
      
      {/* Modal Sửa Thành viên */}
      <Modal
        title={`Sửa thành viên: ${editingMember ? editingMember.name : ''}`}
        open={isEditModalVisible}
        footer={null}
        onCancel={() => { setIsEditModalVisible(false); setEditingMember(null); }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={onUpdateMember}>
          <Form.Item name="name" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}> 
            <Input/> 
          </Form.Item>
          <Form.Item name="studentId" label="Mã số học sinh (Email ĐN)" rules={[{ required: true, message: 'Vui lòng nhập mã số học sinh!' }]}> 
            <Input/> 
          </Form.Item>
          <Form.Item name="contact" label="Liên hệ (SĐT/Zalo)"> 
            <Input/> 
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Lưu thay đổi</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
