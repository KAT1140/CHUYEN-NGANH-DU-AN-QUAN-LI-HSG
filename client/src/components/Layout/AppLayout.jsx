import React from 'react';
import { Layout } from 'antd';
import './AppLayout.css';

const { Header, Content } = Layout;

const AppLayout = ({ 
  children, 
  title = "HSG Management", 
  subtitle = "",
  headerExtra = null,
  className = ""
}) => {
  return (
    <Layout className={`app-layout ${className}`}>
      <Header className="app-header">
        <div className="app-header-content">
          <div className="app-header-title">
            <span className="app-logo">🏆</span>
            <div className="app-title-text">
              <h1 className="app-main-title">{title}</h1>
              {subtitle && <p className="app-subtitle">{subtitle}</p>}
            </div>
          </div>
          {headerExtra && (
            <div className="app-header-extra">
              {headerExtra}
            </div>
          )}
        </div>
      </Header>
      <Content className="app-content">
        <div className="app-content-wrapper">
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default AppLayout;