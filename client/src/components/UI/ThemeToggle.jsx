import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ size = 'middle', style = {}, showTooltip = true }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const button = (
    <div style={{ position: 'relative' }}>
      <Button
        type="text"
        size={size}
        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{
          color: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          fontSize: '16px',
          width: '36px',
          height: '36px',
          ...style
        }}
        className="theme-toggle-btn"
      />
      {/* Small indicator dot */}
      <div
        style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '8px',
          height: '8px',
          backgroundColor: isDarkMode ? '#faad14' : '#1890ff',
          borderRadius: '50%',
          border: '1px solid #ffffff',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      />
    </div>
  );

  if (!showTooltip) {
    return button;
  }

  return (
    <Tooltip title={
      <div>
        {isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        <br />
        <small>Phím tắt: Ctrl+Shift+T</small>
      </div>
    }>
      {button}
    </Tooltip>
  );
};

export default ThemeToggle;