const API_BASE = import.meta.env.VITE_API_BASE || '/api'
import { getToken } from './auth';

const fetchAuth = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers,
    // Chỉ thêm Authorization header nếu có token
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
  
  return fetch(url, { ...options, headers });
};

export async function getTeams(){
  const res = await fetch(`${API_BASE}/teams`)
  return res.json()
}

export async function createTeam(data){
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
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