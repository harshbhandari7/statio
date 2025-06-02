import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import UptimeOverview from '../components/UptimeOverview';
import UptimeChart from '../components/UptimeChart';

interface AnalyticsStats {
  total_services: number;
  active_incidents: number;
  total_users: number;
  system_uptime: number;
  avg_response_time: number;
  incidents_this_week: number;
  incidents_this_month: number;
  uptime_trend: 'up' | 'down' | 'stable';
}

interface UptimeGraphData {
  timestamp: string;
  uptime_percentage: number;
  status: string;
  response_time?: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats>({
    total_services: 0,
    active_incidents: 0,
    total_users: 0,
    system_uptime: 99.9,
    avg_response_time: 150,
    incidents_this_week: 0,
    incidents_this_month: 0,
    uptime_trend: 'stable'
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('30d');
  const [mockChartData, setMockChartData] = useState<UptimeGraphData[]>([]);

  useEffect(() => {
    fetchAnalyticsStats();
    generateMockChartData();
  }, [selectedPeriod]);

  const generateMockChartData = () => {
    const now = new Date();
    const data: UptimeGraphData[] = [];
    const periods = selectedPeriod === '24h' ? 24 : selectedPeriod === '7d' ? 7 * 24 : 30 * 24;
    const interval = selectedPeriod === '24h' ? 1 : selectedPeriod === '7d' ? 4 : 24; // hours

    for (let i = periods; i >= 0; i -= interval) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseUptime = 99.5 + (Math.random() - 0.5) * 1;
      const uptime = Math.max(95, Math.min(100, baseUptime));
      
      data.push({
        timestamp: timestamp.toISOString(),
        uptime_percentage: uptime,
        status: uptime > 99 ? 'operational' : uptime > 97 ? 'degraded' : 'partial_outage',
        response_time: 120 + Math.random() * 100
      });
    }
    
    setMockChartData(data);
  };

  const fetchAnalyticsStats = async () => {
    try {
      setLoading(true);
      setStats({
        total_services: 4,
        active_incidents: 1,
        total_users: 8,
        system_uptime: 99.85,
        avg_response_time: 145,
        incidents_this_week: 2,
        incidents_this_month: 5,
        uptime_trend: 'up'
      });
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'System Uptime',
      value: `${stats.system_uptime}%`,
      change: stats.uptime_trend === 'up' ? '+0.15%' : stats.uptime_trend === 'down' ? '-0.05%' : '0%',
      changeType: stats.uptime_trend === 'up' ? 'positive' : stats.uptime_trend === 'down' ? 'negative' : 'neutral',
      icon: ChartBarIcon,
      color: stats.system_uptime > 99.5 ? '#10B981' : '#F59E0B',
      description: 'Last 30 days'
    },
    {
      title: 'Avg Response Time',
      value: `${stats.avg_response_time}ms`,
      change: '-5ms',
      changeType: 'positive',
      icon: ClockIcon,
      color: stats.avg_response_time < 200 ? '#3B82F6' : '#F59E0B',
      description: 'Last 24 hours'
    },
    {
      title: 'Active Services',
      value: stats.total_services,
      change: '+1',
      changeType: 'positive',
      icon: ServerIcon,
      color: '#6366F1',
      description: 'Total monitored'
    },
    {
      title: 'Active Incidents',
      value: stats.active_incidents,
      change: stats.active_incidents > 0 ? '+1' : '0',
      changeType: stats.active_incidents > 0 ? 'negative' : 'neutral',
      icon: ExclamationTriangleIcon,
      color: stats.active_incidents > 0 ? '#EF4444' : '#10B981',
      description: 'Currently ongoing'
    },
    {
      title: 'Weekly Incidents',
      value: stats.incidents_this_week,
      change: '-1',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: stats.incidents_this_week === 0 ? '#10B981' : '#F97316',
      description: 'This week'
    },
    {
      title: 'Monthly Incidents',
      value: stats.incidents_this_month,
      change: '+2',
      changeType: 'negative',
      icon: CalendarIcon,
      color: stats.incidents_this_month < 5 ? '#10B981' : '#EF4444',
      description: 'This month'
    },
    {
      title: 'System Load',
      value: '24%',
      change: '+3%',
      changeType: 'neutral',
      icon: CpuChipIcon,
      color: '#8B5CF6',
      description: 'Current usage'
    },
    {
      title: 'Users',
      value: stats.total_users,
      change: '+2',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: '#06B6D4',
      description: 'Total registered'
    },
  ];

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive': return '↗';
      case 'negative': return '↘';
      default: return '→';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.1)',
            borderTopColor: '#4F46E5',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.875rem' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#1F2937',
            background: 'linear-gradient(90deg, #1F2937, #4F46E5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.025em'
          }}>
            Analytics Dashboard
          </h1>
          
          {/* Period Selector */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '0.25rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}>
            {(['24h', '7d', '30d'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: selectedPeriod === period ? '#4F46E5' : 'transparent',
                  color: selectedPeriod === period ? '#FFFFFF' : '#6B7280',
                  boxShadow: selectedPeriod === period ? '0 4px 6px -1px rgba(79, 70, 229, 0.2)' : 'none'
                }}
              >
                {period === '24h' ? '24 Hours' : period === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid - 3 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {kpiCards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              padding: '1.5rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              position: 'relative',
              animation: `slideIn 0.3s ease-out forwards`,
              animationDelay: `${index * 0.1}s`,
              opacity: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                backgroundColor: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 6px -1px ${card.color}33, 0 2px 4px -1px ${card.color}22`
              }}>
                <card.icon style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: getChangeColor(card.changeType),
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '0.25rem' }}>{getChangeIcon(card.changeType)}</span>
                {card.change}
              </div>
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', marginBottom: '0.5rem' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1F2937', lineHeight: '1' }}>
                {card.value}
              </p>
            </div>
            
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Sample Uptime Chart */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          {mockChartData.length > 0 ? (
            <UptimeChart
              data={mockChartData}
              period={selectedPeriod}
              serviceName="Sample Service"
              className=""
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <ChartBarIcon style={{ width: '4rem', height: '4rem', color: '#9CA3AF', margin: '0 auto 1rem' }} />
              <p style={{ color: '#6B7280' }}>Loading chart data...</p>
            </div>
          )}
        </div>
        
        {/* Performance Overview Cards */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1.5rem' }}>
            Performance Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}>
                  <ChartBarIcon style={{ width: '1rem', height: '1rem', color: '#FFFFFF' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#064E3B' }}>Overall Health</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#10B981' }}>Excellent</p>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}>
                  <ArrowTrendingUpIcon style={{ width: '1rem', height: '1rem', color: '#FFFFFF' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E3A8A' }}>Performance Trend</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#3B82F6' }}>Improving</p>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}>
                  <CalendarIcon style={{ width: '1rem', height: '1rem', color: '#FFFFFF' }} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#581C87' }}>SLA Compliance</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#8B5CF6' }}>99.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Uptime Details */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        marginBottom: '2rem'
      }}>
        <UptimeOverview className="" />
      </div>

      {/* Additional Analytics Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Incident Analysis */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1.5rem' }}>
            Incident Analysis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#EF4444', borderRadius: '50%', marginRight: '0.75rem' }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#7F1D1D' }}>Critical Incidents</span>
              </div>
              <span style={{ color: '#EF4444', fontWeight: '700', fontSize: '1.125rem' }}>2</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#F59E0B', borderRadius: '50%', marginRight: '0.75rem' }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400E' }}>Minor Incidents</span>
              </div>
              <span style={{ color: '#F59E0B', fontWeight: '700', fontSize: '1.125rem' }}>3</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#3B82F6', borderRadius: '50%', marginRight: '0.75rem' }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E3A8A' }}>Maintenance Windows</span>
              </div>
              <span style={{ color: '#3B82F6', fontWeight: '700', fontSize: '1.125rem' }}>1</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1.5rem' }}>
            Performance Metrics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Average Response Time</span>
                <span style={{ fontWeight: '700', color: '#1F2937' }}>145ms</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '0.5rem' }}>
                <div style={{ backgroundColor: '#10B981', height: '0.5rem', borderRadius: '9999px', width: '85%', transition: 'width 0.3s' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Uptime Target (99.9%)</span>
                <span style={{ fontWeight: '700', color: '#1F2937' }}>99.85%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '0.5rem' }}>
                <div style={{ backgroundColor: '#F59E0B', height: '0.5rem', borderRadius: '9999px', width: '95%', transition: 'width 0.3s' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6B7280', fontWeight: '500' }}>Error Rate</span>
                <span style={{ fontWeight: '700', color: '#1F2937' }}>0.02%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '0.5rem' }}>
                <div style={{ backgroundColor: '#10B981', height: '0.5rem', borderRadius: '9999px', width: '98%', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics; 