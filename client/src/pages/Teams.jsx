// File: client/src/pages/Teams.jsx

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Modal, Form, Input, Space, message, Collapse, Card, Tag, Typography, Select } from 'antd'
// Import các hàm API
import { 
  getTeams, createTeam, deleteTeam, getMembers, createMember, updateMember, deleteMember, 
  getStudents, 
  getAvailableStudents
} from '../utils/api' 

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
  const [students, setStudents] = useState([]); // Danh sách học sinh để chọn
  
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Lấy role từ localStorage
  const userRole = localStorage.getItem('userRole') || 'user';
  const canAddMember = userRole !== 'user'; // Chỉ admin/teacher được thêm

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

  // --- HÀM LẤY DANH SÁCH HỌC SINH (ĐÃ LỌC) ---
  const fetchAvailableStudents = async () => {
    try {
      // Gọi API lấy danh sách những bạn CHƯA vào đội nào
      const data = await getAvailableStudents();
      
      if (data && data.error === 'Unauthorized') {
         // Xử lý lỗi auth nếu cần
      } else if (data && data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.log('Lỗi tải danh sách học sinh:', err);
    }
  };
  
  useEffect(() => {
      fetchMembers();
      // Khi mở modal thêm mới thì mới cần load danh sách học sinh
      if (isMemberModalVisible) {
        fetchAvailableStudents();
      }
  }, [teamId, isMemberModalVisible]); // Thêm dependency isMemberModalVisible

  const onAddMember = async (values) => {
    try {
      message.loading({ content: `Đang thêm thành viên cho ${teamName}...`, key: 'addMemberLoading' });
      
      // Tìm thông tin học sinh trong danh sách đã load
      const selectedStudent = students.find(s => s.id === values.studentId);
      
      const memberData = {
        name: selectedStudent?.name || '',
        studentId: selectedStudent?.email || '', // Dùng email làm mã HS
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
      // Sau khi thêm xong, reload lại danh sách available để loại bạn vừa thêm ra
      fetchAvailableStudents();
      
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
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${memberName} không?`)) {
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
    { title: 'Mã số HS', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Khối', dataIndex: 'grade', key: 'grade', render: (grade) => grade ? `Khối ${grade}` : '-' },
    { title: 'Liên hệ', dataIndex: 'contact', key: 'contact' },
    {
        title: 'Thao tác',
        key: 'action',
        render: (_, record) => (
            <Space size="small">
                {canAddMember && (
                  <>
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
                  </>
                )}
            </Space>
        ),
    },
  ];

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
          <div style={{marginBottom: 10, color: '#666', fontSize: 13}}>
            * Chỉ hiển thị những học sinh chưa tham gia đội nào.
          </div>
          <Form form={addForm} layout="vertical" onFinish={onAddMember}>
            <Form.Item
              name="studentId"
              label="Chọn học sinh"
              rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
            >
              <Select
                placeholder="Chọn học sinh từ danh sách..."
                optionLabelProp="label"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                // Map danh sách đã lọc vào Option
                options={students.map(student => ({
                  value: student.id,
                  label: `${student.name} (${student.email})`
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                Thêm vào đội
              </Button>
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
          <Form.Item name="studentId" label="Mã số học sinh" rules={[{ required: true, message: 'Vui lòng nhập mã số!' }]}> 
            <Input/> 
          </Form.Item>
          <Form.Item name="grade" label="Khối"> 
            <Input placeholder="Ví dụ: 10, 11, 12"/> 
          </Form.Item>
          <Form.Item name="contact" label="Liên hệ"> 
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
  const [allStudents, setAllStudents] = useState([]) // Dùng cho tạo team mới
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()

  const userRole = localStorage.getItem('userRole') || 'user';
  const canCreateTeam = userRole !== 'user'; 

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await getTeams()
      if (data && data.error === 'Unauthorized') {
        message.error('Phiên đăng nhập không hợp lệ.');
        navigate('/login');
        return;
      }
      setTeams(data.teams || [])
    } catch (err) {
      message.error('Lấy danh sách đội lỗi')
    } finally { setLoading(false) }
  }

  // Khi tạo Team mới, ta cũng nên dùng danh sách rảnh (hoặc tất cả tùy logic)
  // Ở đây dùng getAvailableStudents để tránh xung đột ngay từ đầu
  const fetchStudentsForNewTeam = async () => {
    try {
      const data = await getAvailableStudents();
      if (data && data.students) {
        setAllStudents(data.students);
      }
    } catch (err) {
      console.log('Lỗi tải danh sách học sinh')
    }
  }

  useEffect(()=>{ 
    fetchTeams(); 
    if (canCreateTeam && isModalVisible) {
      fetchStudentsForNewTeam();
    }
  }, [canCreateTeam, isModalVisible])

  const onCreate = async (values) => {
    try {
      message.loading({ content: 'Đang tạo đội...', key: 'createTeamLoading' });
      
      const teamData = {
        name: values.name,
        grade: values.grade
      };
      
      const data = await createTeam(teamData)

      if (data && data.error) {
        message.error({ content: data.error, key: 'createTeamLoading' });
        return;
      }

      // Thêm học sinh vào đội ngay khi tạo (nếu có chọn)
      if (values.studentIds && values.studentIds.length > 0 && data.team) {
        // Lấy danh sách student object từ ID
        const selected = allStudents.filter(s => values.studentIds.includes(s.id));
        for (const st of selected) {
           await createMember(data.team.id, {
             name: st.name,
             studentId: st.email,
             userId: st.id
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
  
  const handleDeleteTeam = (teamId, teamName) => {
    Modal.confirm({
      title: 'Xóa đội tuyển',
      content: `Bạn chắc chắn muốn xóa đội "${teamName}"? Hành động này không thể hoàn tác!`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          message.loading({ content: 'Đang xóa đội...', key: 'deleteTeam' });
          const data = await deleteTeam(teamId);
          
          if (data.error) {
            message.error({ content: data.error, key: 'deleteTeam' });
            return;
          }
          
          message.success({ content: 'Xóa đội thành công!', key: 'deleteTeam', duration: 2 });
          fetchTeams();
        } catch (err) {
          message.error({ content: 'Lỗi khi xóa đội', key: 'deleteTeam' });
        }
      }
    });
  };
  
  
  const teamItems = teams.map((team) => ({
    key: team.id.toString(),
    label: (
      <Space>
        <TeamOutlined />
        <strong>{team.name}</strong> 
        {team.grade && <Tag color="blue">Khối {team.grade}</Tag>}
        <span style={{fontSize: 12, color: '#888'}}>({team.members ? team.members.length : 0} thành viên)</span>
      </Space>
    ),
    extra: (canCreateTeam) ? (
      <Button 
        danger 
        size="small" 
        icon={<DeleteOutlined />} 
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteTeam(team.id, team.name);
        }}
      >
        Xóa đội
      </Button>
    ) : null,
    children: <MemberManager teamId={team.id} teamName={team.name} />,
  }));


  return (
    <div>
      <Space style={{marginBottom:16}}>
        {/* Nút Tạo đội - Ẩn với user thường */}
        {canCreateTeam && (
          <Button 
            type="primary" 
            icon={<TeamOutlined />} 
            onClick={()=>setIsModalVisible(true)}
          >
            Tạo đội mới
          </Button>
        )}
        
        <Button onClick={fetchTeams} icon={<ReloadOutlined />} loading={loading}>
          Làm mới danh sách
        </Button>
      </Space>

      <Collapse items={teamItems} />

      {/* Modal Tạo Team Mới */}
      <Modal 
        title="Tạo đội tuyển mới" 
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
            label="Thêm thành viên ngay (Chỉ hiện HS chưa có đội)"
          >
            <Select
              mode="multiple"
              placeholder="Chọn học sinh..."
              optionLabelProp="label"
              showSearch
              filterOption={(input, option) =>
                 (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {allStudents.map(student => (
                <Select.Option key={student.id} value={student.id} label={student.name}>
                  {student.name} ({student.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{width:'100%'}}>Tạo Đội</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}