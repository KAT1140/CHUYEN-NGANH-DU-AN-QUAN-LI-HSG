const API_BASE = import.meta.env.VITE_API_BASE || '/api'
import { getToken, removeToken } from './auth';

const fetchAuth = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const res = await fetch(url, { ...options, headers });

  // Nếu unauthorized, xoá token để buộc đăng nhập lại
  if (res.status === 401) {
    removeToken();
    // Trả về đối tượng giống Response có method json() để các caller có thể gọi `res.json()` an toàn
    return {
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    };
  }

  return res;
};

export async function getTeams(){
  const res = await fetchAuth(`${API_BASE}/teams`);
  return res.json();
}

export async function createTeam(data){
  const res = await fetchAuth(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteTeam(teamId){
  const res = await fetchAuth(`${API_BASE}/teams/${teamId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function getStudents(){
  const res = await fetchAuth(`${API_BASE}/auth/students`);
  return res.json();
}

export async function getMembers(teamId){
  const res = await fetchAuth(`${API_BASE}/teams/${teamId}/members`);
  return res.json();
}

export async function createMember(teamId, data){
  const res = await fetchAuth(`${API_BASE}/teams/${teamId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json();
}
// <--- THÊM HÀM SỬA VÀ XÓA THÀNH VIÊN
export async function updateMember(teamId, memberId, data){
  const res = await fetchAuth(`${API_BASE}/teams/${teamId}/members/${memberId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json();
}

export async function deleteMember(teamId, memberId){
  const res = await fetchAuth(`${API_BASE}/teams/${teamId}/members/${memberId}`, {
    method: 'DELETE',
  })
  return res.json();
}

// Score API functions
export async function getScores(){
  const res = await fetchAuth(`${API_BASE}/scores`);
  return res.json();
}

export async function getScoresByMember(memberId){
  const res = await fetchAuth(`${API_BASE}/scores/member/${memberId}`);
  return res.json();
}

export async function createScore(data){
  const res = await fetchAuth(`${API_BASE}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateScore(id, data){
  const res = await fetchAuth(`${API_BASE}/scores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteScore(id){
  const res = await fetchAuth(`${API_BASE}/scores/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Evaluation API functions
export async function getEvaluations(){
  const res = await fetchAuth(`${API_BASE}/evaluations`);
  return res.json();
}

export async function createEvaluation(data){
  const res = await fetchAuth(`${API_BASE}/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateEvaluation(id, data){
  const res = await fetchAuth(`${API_BASE}/evaluations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteEvaluation(id){
  const res = await fetchAuth(`${API_BASE}/evaluations/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Student Management API
export async function getAllStudents(){
  const res = await fetchAuth(`${API_BASE}/students`);
  return res.json();
}

export async function createStudent(data){
  const res = await fetchAuth(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateStudent(id, data){
  const res = await fetchAuth(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteStudent(id){
  const res = await fetchAuth(`${API_BASE}/students/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}
// File: client/src/utils/api.js (Thêm vào cuối file hoặc gần các hàm student)

export async function getAvailableStudents(){
  const res = await fetchAuth(`${API_BASE}/students/available`); // Gọi route mới
  return res.json();
}