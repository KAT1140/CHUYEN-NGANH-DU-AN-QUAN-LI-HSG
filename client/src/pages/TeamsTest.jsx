import { Button } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'

export default function TeamsTest() {
  const handleAddTeacher = () => {
    alert('Nút thêm giáo viên hoạt động!');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>TEST TEAMS PAGE</h1>
      <Button 
        type="primary" 
        icon={<UserAddOutlined />}
        onClick={handleAddTeacher}
        size="large"
      >
        THÊM GIÁO VIÊN
      </Button>
    </div>
  );
}