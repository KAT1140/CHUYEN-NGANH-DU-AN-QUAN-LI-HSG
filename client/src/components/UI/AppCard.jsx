import React from 'react';
import { Card } from 'antd';
import './AppCard.css';

const AppCard = ({ 
  children, 
  title, 
  subtitle,
  extra, 
  className = "", 
  hoverable = true,
  loading = false,
  size = "default", // small, default, large
  variant = "default", // default, glass, gradient
  ...props 
}) => {
  const cardClassName = `
    app-card 
    app-card--${size} 
    app-card--${variant}
    ${hoverable ? 'app-card--hoverable' : ''}
    ${className}
  `.trim();

  const titleContent = title && (
    <div className="app-card-title">
      <h3 className="app-card-title-text">{title}</h3>
      {subtitle && <p className="app-card-subtitle">{subtitle}</p>}
    </div>
  );

  return (
    <Card
      className={cardClassName}
      title={titleContent}
      extra={extra}
      loading={loading}
      {...props}
    >
      <div className="app-card-content">
        {children}
      </div>
    </Card>
  );
};

export default AppCard;