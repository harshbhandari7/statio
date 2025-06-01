import React from 'react';
import './StatusBadge.css';
import type { Service } from '../../types';

interface StatusBadgeProps {
  status: Service['status'];
  size?: 'sm' | 'md' | 'lg';
}

// Status configuration with colors and labels
export const statusConfig = {
  operational: {
    label: 'Operational',
    color: '#10b981', // green
    bgColor: 'rgba(16, 185, 129, 0.15)'
  },
  degraded: {
    label: 'Degraded Performance',
    color: '#f59e0b', // amber
    bgColor: 'rgba(245, 158, 11, 0.15)'
  },
  partial_outage: {
    label: 'Partial Outage',
    color: '#ef4444', // red
    bgColor: 'rgba(239, 68, 68, 0.15)'
  },
  major_outage: {
    label: 'Major Outage',
    color: '#7f1d1d', // dark red
    bgColor: 'rgba(127, 29, 29, 0.15)'
  },
  maintenance: {
    label: 'Maintenance',
    color: '#6366f1', // indigo
    bgColor: 'rgba(99, 102, 241, 0.15)'
  }
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <div 
      className={`status-badge status-badge-${size}`}
      style={{ 
        '--status-color': config.color,
        '--status-bg-color': config.bgColor
      } as React.CSSProperties}
    >
      <div className="status-indicator"></div>
      <span className="status-text">{config.label}</span>
    </div>
  );
}
