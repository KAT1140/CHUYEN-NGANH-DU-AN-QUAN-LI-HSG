import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, message, Card, Tag, DatePicker, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getScores, getTeams, createScore, updateScore, deleteScore, getStudents } from '../utils/api'

export default function Scores(){
  const navigate = useNavigate()
  const [scores, setScores] = useState([])
  const [allScores, setAllScores] = useState([]) // Store all scores for filtering
  const [teams, setTeams] = useState([])
  const [members, setMembers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingScore, setEditingScore] = useState(null)
  const [form] = Form.useForm()
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [availableYears, setAvailableYears] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [availableSubjects, setAvailableSubjects] = useState([])
  
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
        
        // Extract unique years
        const years = [...new Set(fetchedScores.map(s => new Date(s.createdAt).getFullYear()))]
        setAvailableYears(years.sort((a, b) => b - a))
        
        // Extract unique subjects
        const subjects = [...new Set(fetchedScores.map(s => s.member?.team?.subject).filter(Boolean))]
        setAvailableSubjects(subjects.sort((a, b) => a.localeCompare(b, 'vi')))
        
        // Apply filters
        applyFilters(fetchedScores, selectedYear, selectedSubject)
      }
    } catch (err) {
      console.error('Error fetching scores:', err)
      setScores([])
      setAllScores([])
    } finally {
      setLoading(false)
    }
  }

  // Apply filters function
  const applyFilters = (scoresToFilter, year, subject) => {
    let filtered = scoresToFilter
    
    // Filter by year
    if (year !== 'all') {
      filtered = filtered.filter(s => 
        new Date(s.createdAt).getFullYear() === parseInt(year)
      )
    }
    
    // Filter by subject
    if (subject !== 'all') {
      filtered = filtered.filter(s => 
        s.member?.team?.subject === subject
      )
    }
    
    setScores(filtered)
  }

  // Filter scores when year or subject selection changes
  useEffect(() => {
    applyFilters(allScores, selectedYear, selectedSubject)
  }, [selectedYear, selectedSubject, allScores])

  // Fetch teams and members
  const fetchTeamsData = async () => {
    try {
      const data = await getTeams()
      console.log('Teams data:', data)
      if (data && data.teams) {
        setTeams(data.teams)
        // Build members list from teams
        const allMembers = []
        data.teams.forEach(team => {
          console.log('Team:', team.name, 'Members:', team.members)
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
        console.log('All members:', allMembers)
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
      const scoreData = {
        memberId: values.memberId,
        testName: values.testName,
        score: values.score,
        maxScore: 10,
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
      },
      defaultSortOrder: 'ascend'
    },
    {
      title: 'Tên học sinh',
      dataIndex: ['member', 'name'],
      key: 'studentName',
      render: (_, record) => record.member?.name || 'N/A'
    },
    {
      title: 'Mã học sinh',
      dataIndex: ['member', 'studentId'],
      key: 'studentId',
      render: (_, record) => record.member?.studentId || 'N/A'
    },
    {
      title: 'Bài kiểm tra',
      dataIndex: 'testName',
      key: 'testName'
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => `${score}/${record.maxScore}`
    },
    {
      title: 'Ngày thi',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
    },
    {
      title: 'Giải',
      dataIndex: 'award',
      key: 'award',
      render: (award, record) => {
        // Chỉ hiển thị giải cho bài thi HSG, không hiển thị cho bài kiểm tra
        if (record.testName && record.testName.includes('Kỳ thi HSG')) {
          return award || '-'
        }
        return '-'
      }
    },
    {
      title: 'Giáo viên bộ môn',
      dataIndex: ['subjectTeacher', 'name'],
      key: 'subjectTeacher',
      render: (_, record) => record.subjectTeacher?.name || 'N/A'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {canAddScore && (
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
                onClick={() => handleDelete(record.id)}
              >
                Xóa
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
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
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 150 }}
          placeholder="Chọn năm"
        >
          <Select.Option value="all">Tất cả năm</Select.Option>
          {availableYears.map(year => (
            <Select.Option key={year} value={year.toString()}>
              Năm {year}
            </Select.Option>
          ))}
        </Select>
        <Select
          value={selectedSubject}
          onChange={setSelectedSubject}
          style={{ width: 150 }}
          placeholder="Chọn môn học"
        >
          <Select.Option value="all">Tất cả môn</Select.Option>
          {availableSubjects.map(subject => (
            <Select.Option key={subject} value={subject}>
              {subject}
            </Select.Option>
          ))}
        </Select>
      </Space>

      <Table
        dataSource={scores}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

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
            <Input placeholder="VD: Kiểm tra Toán tuần 1" />
          </Form.Item>

          <Form.Item
            name="score"
            label="Điểm"
            rules={[{ required: true, message: 'Vui lòng nhập điểm!' }]}
          >
            <InputNumber min={0} max={10} step={0.1} style={{width: '100%'}} />
          </Form.Item>

          <Form.Item
            name="examDate"
            label="Ngày thi"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="award"
            label="Giải thưởng"
          >
            <Select placeholder="Chọn giải thưởng" allowClear>
              <Select.Option value="Nhất">Giải Nhất</Select.Option>
              <Select.Option value="Nhì">Giải Nhì</Select.Option>
              <Select.Option value="Ba">Giải Ba</Select.Option>
              <Select.Option value="Khuyến khích">Giải Khuyến khích</Select.Option>
            </Select>
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
    </div>
  )
}
