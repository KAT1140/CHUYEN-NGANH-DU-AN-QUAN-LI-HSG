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
  const [selectedYear, setSelectedYear] = useState(null)
  
  // Get available exam types based on selected year
  const getAvailableExamTypes = () => {
    const year = parseInt(selectedYear);
    const isOldYear = year && year < 2024; // Các năm trước 2024
    
    const examTypes = [
      { value: 'all', label: 'Tất cả kỳ thi' },
      { value: 'hsg', label: 'HSG Cấp tỉnh' },
      { value: 'hsg-national', label: 'HSG Quốc gia' }
    ];
    
    // Chỉ thêm "Kiểm tra định kỳ" nếu không phải năm cũ
    if (!isOldYear) {
      examTypes.push({ value: 'periodic', label: 'Kiểm tra định kỳ' });
    }
    
    return examTypes;
  };

  // Reset exam type when year changes to old year and current type is periodic
  useEffect(() => {
    const year = parseInt(selectedYear);
    const isOldYear = year && year < 2024;
    
    if (isOldYear && selectedExamType === 'periodic') {
      setSelectedExamType('all');
      // Immediately filter with 'all' exam type for old year
      filterDataWithParams('all', selectedGrade, selectedSubject, selectedYear);
    }
  }, [selectedYear]);

  // Combined filter function
  const filterDataWithParams = (examType, grade, subject, year) => {
    let filtered = allScores;
    
    // Filter by exam type
    if (examType === 'hsg') {
      filtered = filtered.filter(s => s.testName === 'HSG cấp tỉnh');
    } else if (examType === 'hsg-national') {
      filtered = filtered.filter(s => s.testName === 'HSG Quốc gia');
    } else if (examType === 'periodic') {
      filtered = filtered.filter(s => 
        s.testName && (
          s.testName.includes('Kiểm tra') || 
          s.testName.includes('kiểm tra')
        ) && 
        !s.testName.includes('HSG')
      );
    }
    // 'all' shows everything
    
    // Filter by grade
    if (grade !== 'all') {
      filtered = filtered.filter(s => s.member?.grade?.toString() === grade);
    }
    
    // Filter by subject
    if (subject !== 'all') {
      filtered = filtered.filter(s => s.member?.team?.subject === subject);
    }
    
    // Filter by year
    if (year && year !== '' && year !== null) {
      filtered = filtered.filter(s => {
        if (s.examDate) {
          const examYear = new Date(s.examDate).getFullYear();
          return examYear.toString() === year;
        }
        return false;
      });
    }
    
    setScores(filtered);
    console.log(`Filtered with params - examType: ${examType}, grade: ${grade}, subject: ${subject}, year: ${year}:`, filtered.length, 'scores');
  };

  // Get user role
  const userRole = localStorage.getItem('userRole') || 'user'
  const canAddScore = userRole !== 'user'
  const isStudent = userRole === 'user'

  // Get subtitle based on role
  const getSubtitle = () => {
    if (isStudent) {
      return "Xem điểm số của bạn và điểm HSG các năm trước để tham khảo";
    } else if (userRole === 'teacher') {
      return "Quản lý điểm thi và đánh giá học sinh trong môn của bạn";
    } else {
      return "Quản lý điểm thi và đánh giá học sinh";
    }
  };

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
        
        // Tự động chọn năm mới nhất hoặc năm hiện tại (có thể bỏ qua nếu muốn xem tất cả)
        if (fetchedScores.length > 0 && !selectedYear) {
          const years = [...new Set(fetchedScores
            .filter(s => s.examDate)
            .map(s => new Date(s.examDate).getFullYear().toString())
          )].sort((a, b) => b - a);
          
          if (years.length > 0) {
            // Ưu tiên chọn năm 2025 nếu có, nếu không thì chọn năm mới nhất
            const currentYear = new Date().getFullYear().toString();
            const preferredYear = years.includes('2025') ? '2025' : 
                                 years.includes(currentYear) ? currentYear : 
                                 years[0];
            
            setSelectedYear(preferredYear);
            
            // Filter by preferred year
            const yearFiltered = fetchedScores.filter(s => {
              if (s.examDate) {
                const examYear = new Date(s.examDate).getFullYear();
                return examYear.toString() === preferredYear;
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
    setSelectedExamType(type);
    filterDataWithParams(type, selectedGrade, selectedSubject, selectedYear);
  }

  const filterByGrade = (grade) => {
    setSelectedGrade(grade);
    filterDataWithParams(selectedExamType, grade, selectedSubject, selectedYear);
  }

  const filterBySubject = (subject) => {
    setSelectedSubject(subject);
    filterDataWithParams(selectedExamType, selectedGrade, subject, selectedYear);
  }

  const filterByYear = (year) => {
    setSelectedYear(year);
    filterDataWithParams(selectedExamType, selectedGrade, selectedSubject, year);
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

  // Apply filters when allScores changes
  useEffect(() => {
    if (allScores.length > 0) {
      filterDataWithParams(selectedExamType, selectedGrade, selectedSubject, selectedYear);
    }
  }, [allScores]);

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
      render: (_, record) => {
        const studentName = record.member?.name || 'N/A';
        const currentUser = localStorage.getItem('userName') || '';
        const isMyScore = studentName === currentUser;
        
        return (
          <div>
            <span style={{ fontWeight: isMyScore ? 'bold' : 'normal' }}>
              {studentName}
            </span>
            {isMyScore && isStudent && (
              <Tag color="green" size="small" style={{ marginLeft: 8 }}>
                Của bạn
              </Tag>
            )}
            {!isMyScore && isStudent && (
              <Tag color="blue" size="small" style={{ marginLeft: 8 }}>
                Tham khảo
              </Tag>
            )}
          </div>
        );
      }
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
      key: 'testName',
      render: (testName) => {
        if (!testName) return 'N/A';
        
        // Loại bỏ phần môn học khỏi tên bài kiểm tra
        // Ví dụ: "Kiểm tra tháng 10 - Toán" → "Kiểm tra tháng 10"
        const cleanTestName = testName.split(' - ')[0];
        return cleanTestName;
      }
    },
    {
      title: 'Loại kỳ thi',
      dataIndex: 'testName',
      key: 'examType',
      render: (testName) => {
        if (!testName) return <Tag color="default">Chưa xác định</Tag>;
        
        if (testName === 'HSG cấp tỉnh') {
          return <Tag color="gold">HSG Cấp tỉnh</Tag>;
        } else if (testName?.includes('HSG Quốc gia')) {
          return <Tag color="red">HSG Quốc gia</Tag>;
        } else if (testName?.includes('Kiểm tra đầu năm')) {
          return <Tag color="blue">Kiểm tra đầu năm</Tag>;
        } else if (testName?.includes('Kiểm tra giữa kỳ 1')) {
          return <Tag color="cyan">Kiểm tra giữa kỳ 1</Tag>;
        } else if (testName?.includes('Kiểm tra cuối kỳ 1')) {
          return <Tag color="geekblue">Kiểm tra cuối kỳ 1</Tag>;
        } else if (testName?.includes('Kiểm tra đầu kỳ 2')) {
          return <Tag color="purple">Kiểm tra đầu kỳ 2</Tag>;
        } else if (testName?.includes('Kiểm tra giữa kỳ 2')) {
          return <Tag color="magenta">Kiểm tra giữa kỳ 2</Tag>;
        } else if (testName?.includes('Kiểm tra cuối năm')) {
          return <Tag color="volcano">Kiểm tra cuối năm</Tag>;
        } else if (testName?.includes('Kiểm tra tháng')) {
          // Trích xuất tháng từ tên bài kiểm tra
          const monthMatch = testName.match(/tháng (\d+)/);
          const month = monthMatch ? monthMatch[1] : '';
          return <Tag color="lime">Kiểm tra tháng {month}</Tag>;
        } else if (testName?.toLowerCase().includes('kiểm tra')) {
          return <Tag color="blue">Kiểm tra định kỳ</Tag>;
        } else {
          // Hiển thị tên gốc thay vì "Khác"
          const cleanName = testName.length > 15 ? testName.substring(0, 15) + '...' : testName;
          return <Tag color="default" title={testName}>{cleanName}</Tag>;
        }
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
      width: 150,
      render: (award, record) => {
        // Chỉ hiển thị giải cho kỳ thi HSG
        const isHSGExam = record.testName === 'HSG cấp tỉnh' || record.testName?.includes('HSG Quốc gia');
        
        if (!isHSGExam) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        if (award) {
          const colorMap = {
            'Giải Nhất': 'gold',
            'Giải Nhì': 'purple', 
            'Giải Ba': 'cyan',
            'Giải Khuyến khích': 'blue',
            'Giải Nhất QG': 'red',
            'Giải Nhì QG': 'volcano', 
            'Giải Ba QG': 'orange',
            'Giải Khuyến khích QG': 'geekblue',
            'Tham dự QG': 'default'
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
        { text: 'Giải Nhất QG', value: 'Giải Nhất QG' },
        { text: 'Giải Nhì QG', value: 'Giải Nhì QG' },
        { text: 'Giải Ba QG', value: 'Giải Ba QG' },
        { text: 'Giải Khuyến khích QG', value: 'Giải Khuyến khích QG' },
        { text: 'Tham dự QG', value: 'Tham dự QG' },
        { text: 'Không đạt giải', value: null }
      ],
      onFilter: (value, record) => {
        const isHSGExam = record.testName === 'HSG cấp tỉnh' || record.testName?.includes('HSG Quốc gia');
        if (!isHSGExam) return false;
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
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes, record) => {
        // Tạo ghi chú dựa trên loại kỳ thi
        let displayNote = '';
        
        if (record.testName === 'HSG cấp tỉnh') {
          displayNote = 'Kỳ thi học sinh giỏi cấp tỉnh';
        } else if (record.testName?.includes('HSG Quốc gia')) {
          displayNote = 'Kỳ thi học sinh giỏi quốc gia';
        } else if (record.testName?.includes('Kiểm tra đầu năm')) {
          displayNote = 'Kiểm tra đánh giá đầu năm học';
        } else if (record.testName?.includes('Kiểm tra giữa kỳ 1')) {
          displayNote = 'Kiểm tra giữa học kỳ I';
        } else if (record.testName?.includes('Kiểm tra cuối kỳ 1')) {
          displayNote = 'Kiểm tra cuối học kỳ I';
        } else if (record.testName?.includes('Kiểm tra đầu kỳ 2')) {
          displayNote = 'Kiểm tra đầu học kỳ II';
        } else if (record.testName?.includes('Kiểm tra giữa kỳ 2')) {
          displayNote = 'Kiểm tra giữa học kỳ II';
        } else if (record.testName?.includes('Kiểm tra cuối năm')) {
          displayNote = 'Kiểm tra tổng kết cuối năm học';
        } else if (record.testName?.includes('Kiểm tra tháng')) {
          const monthMatch = record.testName.match(/tháng (\d+)/);
          const month = monthMatch ? monthMatch[1] : '';
          displayNote = `Kiểm tra định kỳ tháng ${month}`;
        } else if (record.testName?.includes('Kiểm tra') || record.testName?.includes('kiểm tra')) {
          displayNote = 'Kiểm tra định kỳ';
        } else {
          displayNote = notes || 'Không có ghi chú';
        }
        
        // Nếu có ghi chú riêng và không phải là ghi chú tự động, hiển thị cả hai
        if (notes && notes !== displayNote && !notes.includes('Kiểm tra định kỳ môn')) {
          displayNote = `${displayNote} - ${notes}`;
        }
        
        return (
          <span 
            title={displayNote}
            style={{ 
              maxWidth: '200px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              display: 'inline-block'
            }}
          >
            {displayNote}
          </span>
        );
      }
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
      subtitle={getSubtitle()}
    >
      <AppCard 
        title={isStudent ? "Điểm số của bạn" : "Danh sách điểm số"}
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
            {isStudent && (
              <Tag color="blue">Chỉ xem</Tag>
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
              {getAvailableExamTypes().map(type => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
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
          scroll={{ x: 1400 }}
          size="small"
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
              <Select.OptGroup label="Kỳ thi HSG">
                <Select.Option value="HSG cấp tỉnh">HSG cấp tỉnh</Select.Option>
                <Select.Option value="HSG Quốc gia">HSG Quốc gia</Select.Option>
              </Select.OptGroup>
              <Select.OptGroup label="Kiểm tra định kỳ">
                <Select.Option value="Kiểm tra đầu năm">Kiểm tra đầu năm</Select.Option>
                <Select.Option value="Kiểm tra giữa kỳ 1">Kiểm tra giữa kỳ 1</Select.Option>
                <Select.Option value="Kiểm tra cuối kỳ 1">Kiểm tra cuối kỳ 1</Select.Option>
                <Select.Option value="Kiểm tra đầu kỳ 2">Kiểm tra đầu kỳ 2</Select.Option>
                <Select.Option value="Kiểm tra giữa kỳ 2">Kiểm tra giữa kỳ 2</Select.Option>
                <Select.Option value="Kiểm tra cuối năm">Kiểm tra cuối năm</Select.Option>
              </Select.OptGroup>
              <Select.OptGroup label="Kiểm tra hàng tháng">
                <Select.Option value="Kiểm tra tháng 9">Kiểm tra tháng 9</Select.Option>
                <Select.Option value="Kiểm tra tháng 10">Kiểm tra tháng 10</Select.Option>
                <Select.Option value="Kiểm tra tháng 11">Kiểm tra tháng 11</Select.Option>
                <Select.Option value="Kiểm tra tháng 12">Kiểm tra tháng 12</Select.Option>
                <Select.Option value="Kiểm tra tháng 1">Kiểm tra tháng 1</Select.Option>
                <Select.Option value="Kiểm tra tháng 2">Kiểm tra tháng 2</Select.Option>
                <Select.Option value="Kiểm tra tháng 3">Kiểm tra tháng 3</Select.Option>
                <Select.Option value="Kiểm tra tháng 4">Kiểm tra tháng 4</Select.Option>
                <Select.Option value="Kiểm tra tháng 5">Kiểm tra tháng 5</Select.Option>
              </Select.OptGroup>
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