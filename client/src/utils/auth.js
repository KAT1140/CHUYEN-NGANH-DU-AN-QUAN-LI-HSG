export function getToken(){
  return localStorage.getItem('token')
}

export function setToken(token){
  localStorage.setItem('token', token)
}

export function removeToken(){
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function setUser(user){
  localStorage.setItem('user', JSON.stringify(user))
}

export function getUser(){
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

export async function fetchMe(){
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    const data = await res.json()
    return data.user || null
  } catch (err) {
    return null
  }
}
