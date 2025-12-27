// File: client/src/pages/Teams.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Modal, Form, Input, Space, message, Collapse, Card, Tag, Typography, Select } from 'antd'
// Import các hàm API
import { 
  getTeams, createTeam, deleteTeam, getMembers, createMember, updateMember, deleteMember, 
  getAvailableStudents
} from '../utils/api' 

import { TeamOutlined, ReloadOutlined, UserAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import AppLayout from '../components/Layout/AppLayout'
import AppCard from '../components/UI/AppCard'

const { Text } = Typography;

// =====================================================================
// COMPONENT PHỤ: QUẢN LÝ THÀNH VIÊN (MemberManager)
// =====================================================================
function MemberManager({ teamId, teamName, teamSubject }){
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
  const [teacherSubject, setTeacherSubject] = useState(null);
  
  // Lấy thông tin môn của giáo viên
  const fetchTeacherSubject = async () => {
    if (userRole === 'teacher') {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.teacher && data.teacher.subject) {
            setTeacherSubject(data.teacher.subject);
          }
        }
      } catch (err) {
        console.error('Error fetching teacher subject:', err);
      }
    }
  };
  
  const canAddMember = userRole !== 'user' && (userRole === 'admin' || (userRole === 'teacher' && teacherSubject === teamSubject));

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
      fetchTeacherSubject();
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
    { title: 'Lớp', dataIndex: 'className', key: 'className', render: (className) => className || '-' },
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
  
  // Lấy thông tin môn của giáo viên
  const [teacherSubject, setTeacherSubject] = useState(null);
  
  const fetchTeacherSubject = async () => {
    if (userRole === 'teacher') {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.teacher && data.teacher.subject) {
            setTeacherSubject(data.teacher.subject);
          }
        }
      } catch (err) {
        console.error('Error fetching teacher subject:', err);
      }
    }
  }; 

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await getTeams()
      if (data && data.error === 'Unauthorized') {
        message.error('Phiên đăng nhập không hợp lệ.');
        navigate('/login');
        return;
      }
      
      // Debug: Log dữ liệu nhận được
      console.log('Teams data received:', data);
      if (data.teams && data.teams.length > 0) {
        console.log('First team teachers:', data.teams[0].teachers);
      }
      
      // Sắp xếp theo khối (grade) tăng dần, sau đó theo tên môn (subject)
      const sortedTeams = (data.teams || []).sort((a, b) => {
        if (a.grade !== b.grade) {
          return (a.grade || 0) - (b.grade || 0);
        }
        return (a.subject || '').localeCompare(b.subject || '', 'vi');
      });
      setTeams(sortedTeams)
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
    fetchTeacherSubject();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <Space>
          <TeamOutlined />
          <strong>{team.name}</strong> 
          {team.grade && <Tag color="blue">Khối {team.grade}</Tag>}
          {team.subject && <Tag color="green">{team.subject}</Tag>}
          <span style={{fontSize: 12, color: '#888'}}>
            ({team.members ? team.members.length : 0} học sinh)
          </span>
        </Space>
        
        {/* Hiển thị giáo viên */}
        <Space>
          {team.teachers && team.teachers.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#666' }}>Giáo viên:</span>
              {team.teachers.slice(0, 2).map((teacher) => {
                const roleColors = {
                  'main': 'gold',
                  'co-teacher': 'blue'
                };
                const roleIcons = {
                  'main': '👨‍🏫',
                  'co-teacher': '👥'
                };
                return (
                  <Tag 
                    key={teacher.id} 
                    color={roleColors[teacher.role]} 
                    size="small"
                    title={`${teacher.name} - ${teacher.role === 'main' ? 'Trưởng nhóm' : 'Đồng giảng dạy'}`}
                  >
                    {roleIcons[teacher.role]} {teacher.name}
                  </Tag>
                );
              })}
              {team.teachers.length > 2 && (
                <Tag color="default" size="small">
                  +{team.teachers.length - 2} khác
                </Tag>
              )}
            </div>
          ) : (
            <Tag color="red" size="small">Chưa có giáo viên</Tag>
          )}
        </Space>
      </div>
    ),
    extra: (canCreateTeam && (userRole === 'admin' || (userRole === 'teacher' && teacherSubject === team.subject))) ? (
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
    children: (
      <div>
        {/* Thông tin chi tiết giáo viên */}
        {team.teachers && team.teachers.length > 0 && (
          <Card 
            size="small" 
            title={<Text strong>Đội ngũ giáo viên ({team.teachers.length})</Text>}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {team.teachers.map(teacher => {
                const roleColors = {
                  'main': 'gold',
                  'co-teacher': 'blue'
                };
                const roleNames = {
                  'main': 'Trưởng nhóm',
                  'co-teacher': 'Đồng giảng dạy'
                };
                const roleIcons = {
                  'main': '👨‍🏫',
                  'co-teacher': '👥'
                };
                
                return (
                  <div key={teacher.id} style={{ 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 6, 
                    padding: 8, 
                    backgroundColor: '#fafafa',
                    minWidth: 200
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      {roleIcons[teacher.role]} {teacher.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                      📧 {teacher.email}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      <Tag color={roleColors[teacher.role]} size="small">
                        {roleNames[teacher.role]}
                      </Tag>
                      {teacher.isActive ? (
                        <Tag color="green" size="small">Hoạt động</Tag>
                      ) : (
                        <Tag color="red" size="small">Tạm dừng</Tag>
                      )}
                    </div>
                    {teacher.notes && (
                      <div style={{ fontSize: 11, color: '#888', marginTop: 4, fontStyle: 'italic' }}>
                        {teacher.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
        
        {/* Component quản lý thành viên */}
        <MemberManager teamId={team.id} teamName={team.name} teamSubject={team.subject} />
      </div>
    ),
  }));


  return (
    <AppLayout 
      title="Quản lý Đội tuyển HSG" 
      subtitle="Tổ chức và quản lý các đội tuyển học sinh giỏi"
    >
      <AppCard 
        title="Danh sách đội tuyển"
        variant="glass"
        extra={
          <Space>
            {canCreateTeam && (
              <Button 
                type="primary" 
                icon={<TeamOutlined />} 
                onClick={() => setIsModalVisible(true)}
              >
                Tạo đội mới
              </Button>
            )}
            
            <Button onClick={fetchTeams} icon={<ReloadOutlined />} loading={loading}>
              Làm mới danh sách
            </Button>
          </Space>
        }
      >
        <Collapse items={teamItems} />
      </AppCard>

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
    </AppLayout>
  )
}