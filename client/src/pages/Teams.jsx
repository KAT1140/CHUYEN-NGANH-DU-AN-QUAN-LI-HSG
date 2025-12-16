// File: client/src/pages/Teams.jsx (ĐÃ SỬA LỖI CÚ PHÁP 'RETURN' VÀ CHỨC NĂNG CRUD MEMBER)

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Modal, Form, Input, Space, message, Collapse, Card, Tag, Typography, Select } from 'antd'
// Import các hàm API
import { getTeams, createTeam, getMembers, createMember, updateMember, deleteMember, getStudents } from '../utils/api' 
import { TeamOutlined, ReloadOutlined, UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography;
const { Panel } = Collapse;

// =====================================================================
// COMPONENT PHỤ: QUẢN LÝ THÀNH VIÊN (MemberManager)
// =====================================================================
function MemberManager({ teamId, teamName }){
  const [members, setMembers] = useState([]);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); 
  const [editingMember, setEditingMember] = useState(null); 
  const [students, setStudents] = useState([]);
  
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole') || 'user';
  const canAddMember = userRole !== 'user'; // Only admin and teacher can add members

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

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      if (data && data.error !== 'Unauthorized') {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.log('Lỗi tải danh sách học sinh');
    }
  };
  
  useEffect(() => {
      fetchMembers();
      fetchStudents();
  }, [teamId]);

  const onAddMember = async (values) => {
    try {
      message.loading({ content: `Đang thêm thành viên cho ${teamName}...`, key: 'addMemberLoading' });
      
      // Get selected student info
      const selectedStudent = students.find(s => s.id === values.studentId);
      
      const memberData = {
        name: selectedStudent?.name || '',
        studentId: selectedStudent?.email || '',
        userId: selectedStudent?.id || values.studentId
      };
      
      const data = await createMember(teamId, memberData); 
      
      if(data.error) {
        message.error({ content: data.error, key: 'addMemberLoading' });
        return;
      } 
      
      message.success({ 
          content: `Thêm ${selectedStudent?.name} thành công!`, 
          key: 'addMemberLoading', 
          duration: 2 
      });
      
      setIsMemberModalVisible(false);
      addForm.resetFields();
      fetchMembers(); 
      
    } catch (err) {
      message.error('Thêm thành viên lỗi mạng');
    }
  };

  // --- HÀM XỬ LÝ SỬA ---
  const handleEdit = (member) => {
    setEditingMember(member);
    setIsEditModalVisible(true);
    editForm.setFieldsValue(member); 
  };

  const onUpdateMember = async (values) => {
    try {
      message.loading({ content: `Đang cập nhật ${values.name}...`, key: 'updateMemberLoading' });
      
      const data = await updateMember(teamId, editingMember.id, values);
      
      if(data.error) {
        message.error({ content: data.error, key: 'updateMemberLoading' });
        return;
      } 
      
      message.success({ content: 'Cập nhật thành viên thành công!', key: 'updateMemberLoading', duration: 2 });
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

  // KHỐI RETURN CHÍNH XÁC (Tránh lỗi 'return' outside of function)
  return (
    <>
      <Card 
        size="small" 
        title={<Text strong>Danh sách Thành viên ({members.length})</Text>} 
        extra={
          canAddMember && (
            <Button 
              type="primary" 
              size="small" 
              icon={<UserAddOutlined />} 
              onClick={() => setIsMemberModalVisible(true)}
            >
              Thêm thành viên
            </Button>
          )
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
          onCancel={() => { setIsMemberModalVisible(false); addForm.resetFields(); }}
          destroyOnClose
        >
          <Form form={addForm} layout="vertical" onFinish={onAddMember}>
            <Form.Item
              name="studentId"
              label="Chọn học sinh"
              rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
            >
              <Select
                placeholder="Chọn học sinh từ cơ sở dữ liệu"
                optionLabelProp="label"
                options={students.map(student => ({
                  value: student.id,
                  label: `${student.name} (${student.email})`
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Thêm</Button>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
      
      {/* Modal Sửa Thành viên */}
      <Modal
        title={`Sửa thành viên: ${editingMember ? editingMember.name : ''}`}
        open={isEditModalVisible}
        footer={null}
        onCancel={() => { setIsEditModalVisible(false); setEditingMember(null); editForm.resetFields(); }}
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
}
// =====================================================================
// COMPONENT CHÍNH: TEAMS
// =====================================================================
export default function Teams(){
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await getTeams()
      if (data && data.error === 'Unauthorized') {
        message.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }
      setTeams(data.teams || [])
      message.success('Đã tải danh sách đội')
    } catch (err) {
      message.error('Lấy danh sách đội lỗi')
    } finally { setLoading(false) }
  }

  const fetchStudents = async () => {
    try {
      const data = await getStudents()
      if (data && data.error !== 'Unauthorized') {
        setStudents(data.students || [])
      }
    } catch (err) {
      console.log('Lỗi tải danh sách học sinh')
    }
  }

  useEffect(()=>{ fetchTeams(); fetchStudents(); }, [])

  const onCreate = async (values) => {
    try {
      message.loading({ content: 'Đang tạo đội...', key: 'createTeamLoading' });
      
      // Lấy thông tin học sinh được chọn
      const selectedStudents = students.filter(s => values.studentIds?.includes(s.id));
      
      const teamData = {
        name: values.name,
        grade: values.grade
      };
      
      const data = await createTeam(teamData)

      if (data && data.error === 'Unauthorized') {
        message.error({ content: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.', key: 'createTeamLoading' });
        navigate('/login');
        return;
      }

      if (data && data.error) {
        message.error({ content: data.error, key: 'createTeamLoading' });
        return;
      }

      // Thêm học sinh vào đội nếu có chọn
      if (values.studentIds && values.studentIds.length > 0 && data.team) {
        for (const student of selectedStudents) {
          await createMember(data.team.id, {
            name: student.name,
            studentId: student.email,
            userId: student.id
          });
        }
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

          <Form.Item 
            name="studentIds" 
            label="Chọn học sinh"
          >
            <Select
              mode="multiple"
              placeholder="Chọn một hoặc nhiều học sinh"
              optionLabelProp="label"
            >
              {students.map(student => (
                <Select.Option key={student.id} value={student.id}>
                  <span>{student.name} ({student.email})</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">Tạo</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}