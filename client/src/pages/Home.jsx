import React, { useEffect, useState } from 'react'
import { Card, Button } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, fetchMe } from '../auth'

export default function Home(){
  const [user, setUser] = useState(getUser())
  const navigate = useNavigate()

  useEffect(()=>{
    // try refresh user from API if token present
    (async()=>{
      const me = await fetchMe()
      if (me) setUser(me)
    })()
  }, [])

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>
      <Card style={{width:720}} title={user ? `Welcome, ${user.name}` : 'HSG Management'}>
        <p>Hệ thống quản lý đội học sinh giỏi. Bạn có thể quản lý đội, thành viên và các kì thi ở đây.</p>
        <div style={{marginTop:16}}>
          {user ? (
            <>
              <Button type="primary" style={{marginRight:8}} onClick={()=>navigate('/dashboard')}>Đi tới Dashboard</Button>
              <Button onClick={()=>navigate('/teams')}>Quản lý Teams</Button>
            </>
          ) : (
            <Link to="/"><Button type="primary"><a href="/">Trang chủ</a> - Hãy đăng nhập</Button></Link>
          )}
        </div>
      </Card>
    </div>
  )
}
