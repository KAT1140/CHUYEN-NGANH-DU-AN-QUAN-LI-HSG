import React from 'react'
import { Layout, Menu } from 'antd'
const { Header, Content } = Layout

export default function Dashboard(){
  return (
    <Layout style={{minHeight:'100vh'}}>
      <Header>
        <div style={{color:'#fff',fontWeight:700}}>HSG Management</div>
      </Header>
      <Content style={{padding:24}}>
        <h2>Dashboard</h2>
        <p>Welcome to the HSG Management dashboard.</p>
      </Content>
    </Layout>
  )
}
