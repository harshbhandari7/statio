import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface UptimeGraphData {
  timestamp: string;
  uptime_percentage: number;
  status: string;
  response_time?: number;
}

interface UptimeChartProps {
  data: UptimeGraphData[];
  period: string;
  serviceName: string;
  className?: string;
}

const UptimeChart: React.FC<UptimeChartProps> = ({ 
  data, 
  period, 
  serviceName, 
  className = '' 
}) => {
  const [activeMetric, setActiveMetric] = useState<'uptime' | 'response_time'>('uptime');

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    timestamp: parseISO(item.timestamp),
    formattedTime: period === '24h' 
      ? format(parseISO(item.timestamp), 'HH:mm')
      : period === '7d'
      ? format(parseISO(item.timestamp), 'MMM dd HH:mm')
      : format(parseISO(item.timestamp), 'MMM dd'),
    statusColor: getStatusColor(item.status),
    uptimeColor: getUptimeColor(item.uptime_percentage)
  }));

  function getStatusColor(status: string): string {
    switch (status) {
      case 'operational': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'partial_outage': return '#ef4444';
      case 'major_outage': return '#dc2626';
      case 'maintenance': return '#6b7280';
      default: return '#10b981';
    }
  }

  function getUptimeColor(uptime: number): string {
    if (uptime >= 99.5) return '#10b981';
    if (uptime >= 95) return '#f59e0b';
    if (uptime >= 90) return '#ef4444';
    return '#dc2626';
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '0.75rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#1F2937'
          }}>
            {format(data.timestamp, 'MMM dd, yyyy HH:mm')}
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Uptime:</span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: data.uptimeColor
              }}>
                {data.uptime_percentage.toFixed(2)}%
              </span>
            </div>
            {data.response_time && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Response Time:</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#3B82F6'
                }}>
                  {Math.round(data.response_time)}ms
                </span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Status:</span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: data.statusColor,
                textTransform: 'capitalize'
              }}>
                {data.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatXAxisTick = (tickItem: any) => {
    if (period === '24h') {
      return format(tickItem, 'HH:mm');
    } else if (period === '7d') {
      return format(tickItem, 'MM/dd');
    } else {
      return format(tickItem, 'MM/dd');
    }
  };

  return (
    <div style={{
      backgroundColor: 'transparent',
      borderRadius: '0.75rem',
      padding: '1.5rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#1F2937'
          }}>
            {serviceName} - Uptime Metrics
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            marginTop: '0.25rem'
          }}>
            {period === '24h' ? 'Last 24 hours' : 
             period === '7d' ? 'Last 7 days' : 
             'Last 30 days'}
          </p>
        </div>
        
        {/* Metric Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(243, 244, 246, 0.8)',
          borderRadius: '0.75rem',
          padding: '0.25rem'
        }}>
          <button
            onClick={() => setActiveMetric('uptime')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMetric === 'uptime' ? '#FFFFFF' : 'transparent',
              color: activeMetric === 'uptime' ? '#1F2937' : '#6B7280',
              boxShadow: activeMetric === 'uptime' ? '0 2px 4px -1px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            Uptime %
          </button>
          <button
            onClick={() => setActiveMetric('response_time')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeMetric === 'response_time' ? '#FFFFFF' : 'transparent',
              color: activeMetric === 'response_time' ? '#1F2937' : '#6B7280',
              boxShadow: activeMetric === 'response_time' ? '0 2px 4px -1px rgba(0, 0, 0, 0.1)' : 'none'
            }}
          >
            Response Time
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{
        height: '20rem',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '0.75rem',
        padding: '1rem'
      }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {activeMetric === 'uptime' ? (
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatXAxisTick}
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  domain={[90, 100]}
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Uptime percentage line */}
                <Line
                  type="monotone"
                  dataKey="uptime_percentage"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 3 }}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
                
                {/* Reference lines for SLA targets */}
                <ReferenceLine y={99.9} stroke="#10b981" strokeDasharray="5 5" />
                <ReferenceLine y={99.0} stroke="#f59e0b" strokeDasharray="5 5" />
                <ReferenceLine y={95.0} stroke="#ef4444" strokeDasharray="5 5" />
              </ComposedChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatXAxisTick}
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Response time bars */}
                <Bar
                  dataKey="response_time"
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                />
                
                {/* Reference lines for response time targets */}
                <ReferenceLine y={200} stroke="#10b981" strokeDasharray="5 5" />
                <ReferenceLine y={500} stroke="#f59e0b" strokeDasharray="5 5" />
                <ReferenceLine y={1000} stroke="#ef4444" strokeDasharray="5 5" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                border: '4px solid rgba(59, 130, 246, 0.2)',
                borderTopColor: '#3B82F6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ color: '#6B7280' }}>Loading chart data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        fontSize: '0.75rem',
        color: '#6B7280',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '0.75rem',
        padding: '1rem'
      }}>
        {activeMetric === 'uptime' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '1rem',
                height: '0.125rem',
                backgroundColor: '#059669',
                borderRadius: '0.125rem'
              }}></div>
              <span style={{ fontWeight: '500' }}>99.9% SLA Target</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '1rem',
                height: '0.125rem',
                backgroundColor: '#D97706',
                borderRadius: '0.125rem'
              }}></div>
              <span style={{ fontWeight: '500' }}>99.0% Warning</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '1rem',
                height: '0.125rem',
                backgroundColor: '#DC2626',
                borderRadius: '0.125rem'
              }}></div>
              <span style={{ fontWeight: '500' }}>95.0% Critical</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '1rem',
                height: '0.125rem',
                backgroundColor: '#059669',
                borderRadius: '0.125rem'
              }}></div>
              <span style={{ fontWeight: '500' }}>&lt;200ms Excellent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '1rem',
                height: '0.125rem',
                backgroundColor: '#D97706',
                borderRadius: '0.125rem'
              }}></div>
              <span style={{ fontWeight: '500' }}>&lt;500ms Good</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '1rem',
                height: '0.125rem',
                backgroundColor: '#DC2626',
                borderRadius: '0.125rem'
              }}></div>
              <span style={{ fontWeight: '500' }}>&gt;1000ms Poor</span>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default UptimeChart; 