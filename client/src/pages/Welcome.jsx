import React from 'react'
import { Button, Row, Col, Typography, Card, Space, Timeline, Tag } from 'antd'
import { LoginOutlined, TrophyOutlined, BookOutlined, TeamOutlined, CalendarOutlined, StarOutlined, BarChartOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import AppLayout from '../components/Layout/AppLayout'
import AppCard from '../components/UI/AppCard'

const { Title, Paragraph, Text } = Typography

export default function Welcome() {
  const features = [
    {
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Quản lý Đội tuyển',
      description: 'Tổ chức và quản lý các đội tuyển HSG theo từng môn học và khối lớp'
    },
    {
      icon: <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: 'Lịch Ôn tập',
      description: 'Lập lịch ôn tập chi tiết, theo dõi tiến độ học tập của từng học sinh'
    },
    {
      icon: <BookOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      title: 'Quản lý Điểm số',
      description: 'Ghi nhận và theo dõi kết quả các kỳ thi, bài kiểm tra định kỳ'
    },
    {
      icon: <StarOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
      title: 'Đánh giá Học sinh',
      description: 'Đánh giá quá trình học tập, thái độ và tiến bộ của học sinh'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      title: 'Thống kê Báo cáo',
      description: 'Phân tích dữ liệu, tạo báo cáo chi tiết về hiệu quả đào tạo'
    },
    {
      icon: <TrophyOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
      title: 'Theo dõi Thành tích',
      description: 'Ghi nhận các giải thưởng, thành tích HSG cấp tỉnh và quốc gia'
    }
  ]

  const timeline = [
    {
      color: 'green',
      children: (
        <div>
          <Text strong>Tháng 9-10/2024</Text>
          <br />
          <Text>Tuyển chọn và thành lập đội tuyển HSG các môn</Text>
        </div>
      )
    },
    {
      color: 'blue',
      children: (
        <div>
          <Text strong>Tháng 11/2024 - 3/2025</Text>
          <br />
          <Text>Ôn tập chuyên sâu, kiểm tra định kỳ</Text>
        </div>
      )
    },
    {
      color: 'orange',
      children: (
        <div>
          <Text strong>Tháng 4/2025</Text>
          <br />
          <Text>Thi HSG cấp tỉnh</Text>
          <Tag color="red">Quan trọng</Tag>
        </div>
      )
    },
    {
      color: 'purple',
      children: (
        <div>
          <Text strong>Tháng 1/2026</Text>
          <br />
          <Text>Thi HSG Quốc gia (dành cho học sinh đạt giải cấp tỉnh)</Text>
          <Tag color="gold">Mục tiêu</Tag>
        </div>
      )
    }
  ]

  return (
    <AppLayout 
      title="Chào mừng đến với HSG Manager" 
      subtitle="Hệ thống quản lý đội tuyển học sinh giỏi toàn diện"
    >
      {/* Hero Section */}
      <AppCard variant="glass" size="large">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <TrophyOutlined style={{ fontSize: '80px', color: '#fa8c16', marginBottom: '24px' }} />
          <Title level={1} style={{ marginBottom: '16px', color: '#1890ff' }}>
            HSG Management System
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Hệ thống quản lý đội tuyển học sinh giỏi hiện đại, giúp nhà trường tổ chức và theo dõi 
            hiệu quả quá trình đào tạo HSG từ cấp tỉnh đến quốc gia.
          </Paragraph>
          
          <Space size="large">
            <Link to="/login">
              <Button type="primary" size="large" icon={<LoginOutlined />}>
                Đăng nhập
              </Button>
            </Link>
          </Space>
        </div>
      </AppCard>

      {/* Features Section */}
      <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
        <Col span={24}>
          <AppCard title="Tính năng nổi bật" variant="glass">
            <Row gutter={[16, 16]}>
              {features.map((feature, index) => (
                <Col xs={24} md={12} lg={8} key={index}>
                  <Card 
                    hoverable
                    style={{ 
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: '16px' }}>
                        {feature.icon}
                      </div>
                      <Title level={4} style={{ marginBottom: '12px' }}>
                        {feature.title}
                      </Title>
                      <Paragraph style={{ margin: 0, color: '#666' }}>
                        {feature.description}
                      </Paragraph>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </AppCard>
        </Col>
      </Row>

      {/* Timeline Section */}
      <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
        <Col xs={24} lg={12}>
          <AppCard title="Lộ trình đào tạo HSG 2024-2025" variant="glass">
            <Timeline items={timeline} />
          </AppCard>
        </Col>
        
        <Col xs={24} lg={12}>
          <AppCard title="Thống kê hệ thống" variant="glass">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Title level={2} style={{ color: '#1890ff', margin: 0 }}>27</Title>
                  <Text>Đội tuyển</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Title level={2} style={{ color: '#52c41a', margin: 0 }}>91</Title>
                  <Text>Học sinh</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Title level={2} style={{ color: '#fa8c16', margin: 0 }}>9</Title>
                  <Text>Môn học</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Title level={2} style={{ color: '#eb2f96', margin: 0 }}>27</Title>
                  <Text>Giáo viên</Text>
                </div>
              </Col>
            </Row>
          </AppCard>
        </Col>
      </Row>

      {/* Info Section */}
      <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
        <Col span={24}>
          <AppCard title="Về hệ thống HSG Manager" variant="glass">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Title level={4}>🎯 Mục tiêu</Title>
                <Paragraph>
                  Xây dựng hệ thống quản lý toàn diện cho đội tuyển HSG, từ việc tuyển chọn, 
                  đào tạo đến theo dõi kết quả thi cử. Giúp nhà trường nâng cao chất lượng 
                  và hiệu quả đào tạo học sinh giỏi.
                </Paragraph>
                
                <Title level={4}>👥 Đối tượng sử dụng</Title>
                <ul>
                  <li><Text strong>Quản trị viên:</Text> Quản lý toàn bộ hệ thống</li>
                  <li><Text strong>Giáo viên:</Text> Quản lý lớp và học sinh được phân công</li>
                  <li><Text strong>Học sinh:</Text> Xem lịch học và kết quả của bản thân</li>
                </ul>
              </Col>
              
              <Col xs={24} md={12}>
                <Title level={4}>🏆 Thành tích HSG</Title>
                <Paragraph>
                  Hệ thống ghi nhận và theo dõi các thành tích HSG:
                </Paragraph>
                <ul>
                  <li>🥇 Giải Nhất HSG cấp tỉnh</li>
                  <li>🥈 Giải Nhì HSG cấp tỉnh</li>
                  <li>🥉 Giải Ba HSG cấp tỉnh</li>
                  <li>🎖️ Giải Khuyến khích</li>
                  <li>🏆 Giải HSG Quốc gia</li>
                </ul>
                
                <Title level={4}>📞 Hỗ trợ</Title>
                <Paragraph>
                  Nếu cần hỗ trợ sử dụng hệ thống, vui lòng liên hệ phòng Đào tạo 
                  hoặc quản trị viên hệ thống.
                </Paragraph>
              </Col>
            </Row>
          </AppCard>
        </Col>
      </Row>
    </AppLayout>
  )
}