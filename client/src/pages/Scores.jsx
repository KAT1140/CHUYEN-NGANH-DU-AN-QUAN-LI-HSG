import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag, DatePicker, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getScores, getTeams, createScore, updateScore, deleteScore, getStudents } from '../utils/api'
import AppLayout from '../components/Layout/AppLayout'
import AppCard from '../components/UI/AppCard'

export default function Scores(){
  const navigate = useNavigate()
  const [scores, setScores] = useState([])
  const [allScores, setAllScores] = useState([])
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingScore, setEditingScore] = useState(null)
  const [form] = Form.useForm()
  
  // Filter states
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedExamType, setSelectedExamType] = useState('all')
  const [selectedYear, setSelectedYear] = useState('')
  
  // Get user role
  const userRole = localStorage.getItem('userRole') || 'user'
  const canAddScore = userRole !== 'user'

  // Fetch all scores
  const fetchScores = async () => {
    setLoading(true)
    try {
      const data = await getScores()
      if (data.error === 'Unauthorized') {
        message.error('Phiên đăng nhập hết hạn')
        navigate('/login')
        return
      }
      if (data.error) {
        console.error('Error fetching scores:', data.error)
        setScores([])
        setAllScores([])
      } else {
        const fetchedScores = data.scores || []
        setAllScores(fetchedScores)
        
        // Tự động chọn năm mới nhất
        if (fetchedScores.length > 0 && !selectedYear) {
          const years = [...new Set(fetchedScores
            .filter(s => s.examDate)
            .map(s => new Date(s.examDate).getFullYear().toString())
          )].sort((a, b) => b - a);
          
          if (years.length > 0) {
            const latestYear = years[0];
            setSelectedYear(latestYear);
            
            // Filter by latest year
            const yearFiltered = fetchedScores.filter(s => {
              if (s.examDate) {
                const examYear = new Date(s.examDate).getFullYear();
                return examYear.toString() === latestYear;
              }
              return false;
            });
            setScores(yearFiltered);
          } else {
            setScores(fetchedScores);
          }
        } else {
          setScores(fetchedScores);
        }
        
        console.log('Fetched scores:', fetchedScores.length)
      }
    } catch (err) {
      console.error('Error fetching scores:', err)
      setScores([])
      setAllScores([])
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  const filterByExamType = (type) => {
    let filtered = allScores
    
    if (type === 'hsg') {
      filtered = allScores.filter(s => s.testName === 'HSG cấp tỉnh')
    } else if (type === 'periodic') {
      filtered = allScores.filter(s => 
        s.testName?.includes('Kiểm tra') || s.testName?.includes('kiểm tra')
      )
    }
    // 'all' shows everything
    
    setScores(filtered)
    setSelectedExamType(type)
    console.log(`Filtered ${type}:`, filtered.length, 'scores')
  }

  const filterByGrade = (grade) => {
    let filtered = allScores
    
    if (selectedExamType === 'hsg') {
      filtered = allScores.filter(s => s.testName === 'HSG cấp tỉnh')
    } else if (selectedExamType === 'periodic') {
      filtered = allScores.filter(s => 
        s.testName?.includes('Kiểm tra') || s.testName?.includes('kiểm tra')
      )
    }
    
    if (grade !== 'all') {
      filtered = filtered.filter(s => s.member?.grade?.toString() === grade)
    }
    
    setScores(filtered)
    setSelectedGrade(grade)
    console.log(`Filtered grade ${grade}:`, filtered.length, 'scores')
  }

  const filterBySubject = (subject) => {
    let filtered = allScores
    
    if (selectedExamType === 'hsg') {
      filtered = allScores.filter(s => s.testName === 'HSG cấp tỉnh')
    } else if (selectedExamType === 'periodic') {
      filtered = allScores.filter(s => 
        s.testName?.includes('Kiểm tra') || s.testName?.includes('kiểm tra')
      )
    }
    
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(s => s.member?.grade?.toString() === selectedGrade)
    }
    
    if (subject !== 'all') {
      filtered = filtered.filter(s => s.member?.team?.subject === subject)
    }
    
    setScores(filtered)
    setSelectedSubject(subject)
    console.log(`Filtered subject ${subject}:`, filtered.length, 'scores')
  }

  const filterByYear = (year) => {
    let filtered = allScores
    
    if (selectedExamType === 'hsg') {
      filtered = allScores.filter(s => s.testName === 'HSG cấp tỉnh')
    } else if (selectedExamType === 'periodic') {
      filtered = allScores.filter(s => 
        s.testName?.includes('Kiểm tra') || s.testName?.includes('kiểm tra')
      )
    }
    
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(s => s.member?.grade?.toString() === selectedGrade)
    }
    
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(s => s.member?.team?.subject === selectedSubject)
    }
    
    // Luôn lọc theo năm được chọn
    filtered = filtered.filter(s => {
      if (s.examDate) {
        const examYear = new Date(s.examDate).getFullYear();
        return examYear.toString() === year;
      }
      return false;
    })
    
    setScores(filtered)
    setSelectedYear(year)
    console.log(`Filtered year ${year}:`, filtered.length, 'scores')
  }

  // Get unique values for filters
  const getUniqueYears = () => {
    const years = [...new Set(allScores
      .filter(s => s.examDate)
      .map(s => new Date(s.examDate).getFullYear().toString())
    )];
    return years.sort((a, b) => b - a); // Newest first
  }
  
  const getUniqueGrades = () => {
    const grades = [...new Set(allScores.map(s => s.member?.grade?.toString()).filter(Boolean))]
    return grades.sort()
  }

  const getUniqueSubjects = () => {
    const subjects = [...new Set(allScores.map(s => s.member?.team?.subject).filter(Boolean))]
    return subjects.sort()
  }

  // Fetch teams and members
  const fetchTeamsData = async () => {
    try {
      const data = await getTeams()
      if (data && data.teams) {
        setTeams(data.teams)
        const allMembers = []
        data.teams.forEach(team => {
          if (team.members && Array.isArray(team.members)) {
            team.members.forEach(member => {
              allMembers.push({
                id: member.id,
                name: member.name,
                studentId: member.studentId,
                teamName: team.name,
                teamId: team.id
              })
            })
          }
        })
        setMembers(allMembers)
      }
    } catch (err) {
      console.error('Lỗi tải đội:', err)
      setMembers([])
    }
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

  useEffect(() => {
    fetchScores()
    fetchTeamsData()
    fetchStudents()
  }, [])

  const handleAddScore = async (values) => {
    try {
      message.loading({ content: 'Đang thêm điểm...', key: 'addScoreLoading' })
      
      // Tự động xác định maxScore dựa trên loại kỳ thi
      const maxScore = values.testName === 'HSG cấp tỉnh' ? 20 : 10;
      
      const scoreData = {
        memberId: values.memberId,
        testName: values.testName,
        score: values.score,
        maxScore: maxScore,
        examDate: values.examDate ? values.examDate.format('YYYY-MM-DD') : null,
        notes: values.notes
      }

      let result
      if (isEditMode) {
        result = await updateScore(editingScore.id, scoreData)
      } else {
        result = await createScore(scoreData)
      }

      if (result.error) {
        message.error({ content: result.error, key: 'addScoreLoading' })
        return
      }

      message.success({
        content: isEditMode ? 'Cập nhật điểm thành công' : 'Thêm điểm thành công',
        key: 'addScoreLoading',
        duration: 1
      })

      setIsModalVisible(false)
      form.resetFields()
      setIsEditMode(false)
      setEditingScore(null)
      fetchScores()
    } catch (err) {
      message.error('Lỗi lưu điểm')
    }
  }

  const handleEdit = (score) => {
    setEditingScore(score)
    setIsEditMode(true)
    form.setFieldsValue({
      memberId: score.memberId,
      testName: score.testName,
      score: score.score,
      maxScore: score.maxScore,
      examDate: score.examDate ? dayjs(score.examDate) : null,
      award: score.award,
      notes: score.notes
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa điểm này?')) return

    try {
      message.loading({ content: 'Đang xóa...', key: 'deleteScoreLoading' })
      const result = await deleteScore(id)

      if (result.error) {
        message.error({ content: result.error, key: 'deleteScoreLoading' })
        return
      }

      message.success({ content: 'Xóa điểm thành công', key: 'deleteScoreLoading', duration: 1 })
      fetchScores()
    } catch (err) {
      message.error('Lỗi xóa điểm')
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setIsEditMode(false)
    setEditingScore(null)
  }

  const columns = [
    {
      title: 'Môn học',
      dataIndex: ['member', 'team', 'subject'],
      key: 'subject',
      render: (_, record) => record.member?.team?.subject || 'N/A',
      sorter: (a, b) => {
        const subjectA = a.member?.team?.subject || '';
        const subjectB = b.member?.team?.subject || '';
        return subjectA.localeCompare(subjectB, 'vi');
      }
    },
    {
      title: 'Tên học sinh',
      dataIndex: ['member', 'name'],
      key: 'studentName',
      render: (_, record) => record.member?.name || 'N/A'
    },
    {
      title: 'Khối',
      dataIndex: ['member', 'grade'],
      key: 'grade',
      render: (_, record) => record.member?.grade || 'N/A'
    },
    {
      title: 'Bài kiểm tra',
      dataIndex: 'testName',
      key: 'testName'
    },
    {
      title: 'Loại kỳ thi',
      dataIndex: 'testName',
      key: 'examType',
      render: (testName) => {
        if (testName === 'HSG cấp tỉnh') {
          return <Tag color="gold">HSG Cấp tỉnh</Tag>;
        } else if (testName?.includes('Kiểm tra') || testName?.includes('kiểm tra')) {
          return <Tag color="blue">Kiểm tra định kỳ</Tag>;
        }
        return <Tag color="default">Khác</Tag>;
      }
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => {
        // Hiển thị thang điểm phù hợp
        const maxScore = record.maxScore || 10;
        return `${score}/${maxScore}`;
      },
      sorter: (a, b) => a.score - b.score
    },
    {
      title: 'Giải thưởng',
      dataIndex: 'award',
      key: 'award',
      render: (award, record) => {
        // Chỉ hiển thị giải cho kỳ thi HSG
        const isHSGExam = record.testName === 'HSG cấp tỉnh';
        
        if (!isHSGExam) {
          return '-';
        }
        
        if (award) {
          const colorMap = {
            'Giải Nhất': 'gold',
            'Giải Nhì': 'purple', 
            'Giải Ba': 'cyan',
            'Giải Khuyến khích': 'blue'
          };
          return <Tag color={colorMap[award] || 'default'}>{award}</Tag>;
        }
        
        return <Tag color="default">Không đạt giải</Tag>;
      },
      filters: [
        { text: 'Giải Nhất', value: 'Giải Nhất' },
        { text: 'Giải Nhì', value: 'Giải Nhì' },
        { text: 'Giải Ba', value: 'Giải Ba' },
        { text: 'Giải Khuyến khích', value: 'Giải Khuyến khích' },
        { text: 'Không đạt giải', value: null }
      ],
      onFilter: (value, record) => {
        if (record.testName !== 'HSG cấp tỉnh') return false;
        return record.award === value;
      }
    },
    {
      title: 'Năm',
      dataIndex: 'examDate',
      key: 'year',
      render: (date) => date ? new Date(date).getFullYear() : 'N/A',
      sorter: (a, b) => {
        const yearA = a.examDate ? new Date(a.examDate).getFullYear() : 0;
        const yearB = b.examDate ? new Date(b.examDate).getFullYear() : 0;
        return yearB - yearA; // Newest first
      },
      defaultSortOrder: 'descend'
    },
    {
      title: 'Ngày thi',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
    },
    // Chỉ hiển thị cột thao tác cho admin/teacher
    ...(canAddScore ? [{
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
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      )
    }] : [])
  ]

  return (
    <AppLayout 
      title="Bảng Điểm HSG" 
      subtitle="Quản lý điểm thi và đánh giá học sinh"
    >
      <AppCard 
        title="Danh sách điểm số"
        variant="glass"
        extra={
          <Space>
            {canAddScore && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEditMode(false)
                  setEditingScore(null)
                  form.resetFields()
                  setIsModalVisible(true)
                }}
              >
                Thêm điểm
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={fetchScores} loading={loading}>
              Làm mới
            </Button>
          </Space>
        }
      >
        {/* Filter Section */}
        <div style={{ marginBottom: 24 }}>
          <Space wrap size="middle">
            <Select
              value={selectedExamType}
              onChange={filterByExamType}
              style={{ width: 180 }}
              placeholder="Chọn kỳ thi"
            >
              <Select.Option value="all">Tất cả kỳ thi</Select.Option>
              <Select.Option value="hsg">HSG Cấp tỉnh</Select.Option>
              <Select.Option value="periodic">Kiểm tra định kỳ</Select.Option>
            </Select>

            <Select
              value={selectedYear}
              onChange={filterByYear}
              style={{ width: 120 }}
              placeholder="Chọn năm"
            >
              {getUniqueYears().map(year => (
                <Select.Option key={year} value={year}>
                  Năm {year}
                </Select.Option>
              ))}
            </Select>

            <Select
              value={selectedGrade}
              onChange={filterByGrade}
              style={{ width: 120 }}
              placeholder="Chọn khối"
            >
              <Select.Option value="all">Tất cả khối</Select.Option>
              {getUniqueGrades().map(grade => (
                <Select.Option key={grade} value={grade}>
                  Khối {grade}
                </Select.Option>
              ))}
            </Select>

            <Select
              value={selectedSubject}
              onChange={filterBySubject}
              style={{ width: 150 }}
              placeholder="Chọn môn học"
            >
              <Select.Option value="all">Tất cả môn</Select.Option>
              {getUniqueSubjects().map(subject => (
                <Select.Option key={subject} value={subject}>
                  {subject}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </div>

        <Table
          dataSource={scores}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} điểm`
          }}
          scroll={{ x: 1200 }}
        />
      </AppCard>

      <Modal
        title={isEditMode ? 'Cập nhật điểm' : 'Thêm điểm mới'}
        open={isModalVisible}
        footer={null}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddScore}>
          <Form.Item
            name="memberId"
            label="Học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
          >
            <Select
              placeholder="Chọn học sinh"
              optionLabelProp="label"
              options={members.map(member => ({
                value: member.id,
                label: `${member.name} (${member.studentId}) - ${member.teamName}`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="testName"
            label="Tên bài kiểm tra"
            rules={[{ required: true, message: 'Vui lòng nhập tên bài kiểm tra!' }]}
          >
            <Select placeholder="Chọn loại bài kiểm tra">
              <Select.Option value="HSG cấp tỉnh">HSG cấp tỉnh</Select.Option>
              <Select.Option value="Kiểm tra đầu năm">Kiểm tra đầu năm</Select.Option>
              <Select.Option value="Kiểm tra giữa kỳ 1">Kiểm tra giữa kỳ 1</Select.Option>
              <Select.Option value="Kiểm tra cuối kỳ 1">Kiểm tra cuối kỳ 1</Select.Option>
              <Select.Option value="Kiểm tra đầu kỳ 2">Kiểm tra đầu kỳ 2</Select.Option>
              <Select.Option value="Kiểm tra giữa kỳ 2">Kiểm tra giữa kỳ 2</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="score"
            label="Điểm"
            rules={[{ required: true, message: 'Vui lòng nhập điểm!' }]}
          >
            <InputNumber 
              min={0} 
              max={20} 
              step={0.1} 
              style={{width: '100%'}} 
              placeholder="Nhập điểm (HSG: /20, Khác: /10)"
            />
          </Form.Item>

          <Form.Item
            name="examDate"
            label="Ngày thi"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Ghi chú thêm (tùy chọn)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {isEditMode ? 'Cập nhật' : 'Thêm điểm'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  )
}