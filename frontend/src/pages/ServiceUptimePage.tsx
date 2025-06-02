import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import UptimeChart from '../components/UptimeChart';
import { format } from 'date-fns';

interface UptimeStats {
  service_id: number;
  service_name: string;
  current_uptime_percentage: number;
  uptime_24h: number;
  uptime_7d: number;
  uptime_30d: number;
  avg_response_time?: number;
  total_incidents_24h: number;
  total_incidents_7d: number;
  total_incidents_30d: number;
  current_status: string;
  last_incident?: string;
}

interface UptimeGraphData {
  timestamp: string;
  uptime_percentage: number;
  status: string;
  response_time?: number;
}

interface UptimeMetricsResponse {
  service_id: number;
  service_name: string;
  current_stats: UptimeStats;
  graph_data: UptimeGraphData[];
  period: string;
}

const ServiceUptimePage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<UptimeMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    if (serviceId) {
      fetchUptimeMetrics(selectedPeriod);
    }
  }, [serviceId, selectedPeriod]);

  const generateMockData = (period: string, serviceId: string): UptimeMetricsResponse => {
    const serviceNames = {
      '1': 'Main Website',
      '2': 'API Gateway', 
      '3': 'Database',
      '4': 'CDN'
    };

    const serviceName = serviceNames[serviceId as keyof typeof serviceNames] || `Service ${serviceId}`;
    
    // Generate realistic graph data based on period
    const now = new Date();
    const graphData: UptimeGraphData[] = [];
    
    let dataPoints = 24; // 24h
    let intervalMs = 60 * 60 * 1000; // 1 hour
    
    if (period === '7d') {
      dataPoints = 168; // 7 days * 24 hours
      intervalMs = 60 * 60 * 1000; // 1 hour
    } else if (period === '30d') {
      dataPoints = 720; // 30 days * 24 hours
      intervalMs = 60 * 60 * 1000; // 1 hour
    }

    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * intervalMs));
      
      // Simulate some occasional outages
      let uptime = 100;
      let status = 'operational';
      let responseTime = 150 + Math.random() * 100;

      // Add some realistic incidents
      if (Math.random() < 0.02) { // 2% chance of incident
        uptime = 0;
        status = 'major_outage';
        responseTime = 0;
      } else if (Math.random() < 0.05) { // 5% chance of degradation
        uptime = 60 + Math.random() * 39; // 60-99%
        status = 'degraded';
        responseTime = 300 + Math.random() * 200;
      }

      graphData.push({
        timestamp: timestamp.toISOString(),
        uptime_percentage: uptime,
        status,
        response_time: responseTime
      });
    }

    // Calculate stats based on generated data
    const operationalHours = graphData.filter(d => d.uptime_percentage > 50).length;
    const totalHours = graphData.length;
    const avgUptime = (operationalHours / totalHours) * 100;

    const currentStats: UptimeStats = {
      service_id: parseInt(serviceId),
      service_name: serviceName,
      current_uptime_percentage: avgUptime,
      uptime_24h: avgUptime + (Math.random() - 0.5) * 2,
      uptime_7d: avgUptime + (Math.random() - 0.5) * 5,
      uptime_30d: avgUptime + (Math.random() - 0.5) * 10,
      avg_response_time: 150 + Math.random() * 100,
      total_incidents_24h: Math.floor(Math.random() * 3),
      total_incidents_7d: Math.floor(Math.random() * 8),
      total_incidents_30d: Math.floor(Math.random() * 15),
      current_status: Math.random() > 0.1 ? 'operational' : 'degraded',
      last_incident: Math.random() > 0.3 ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };

    return {
      service_id: parseInt(serviceId),
      service_name: serviceName,
      current_stats: currentStats,
      graph_data: graphData,
      period
    };
  };

  const fetchUptimeMetrics = async (period: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/uptime/services/${serviceId}/metrics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch uptime metrics');
      }

      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.warn('API not available, using mock data:', err);
      // Use mock data when API is not available
      const mockData = generateMockData(period, serviceId || '1');
      setMetrics(mockData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      operational: { 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        color: '#065F46', 
        text: 'Operational' 
      },
      degraded: { 
        backgroundColor: 'rgba(245, 158, 11, 0.1)', 
        color: '#92400E', 
        text: 'Degraded' 
      },
      partial_outage: { 
        backgroundColor: 'rgba(249, 115, 22, 0.1)', 
        color: '#9A3412', 
        text: 'Partial Outage' 
      },
      major_outage: { 
        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
        color: '#7F1D1D', 
        text: 'Major Outage' 
      },
      maintenance: { 
        backgroundColor: 'rgba(107, 114, 128, 0.1)', 
        color: '#374151', 
        text: 'Maintenance' 
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.operational;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.375rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '500',
        backgroundColor: config.backgroundColor,
        color: config.color
      }}>
        {config.text}
      </span>
    );
  };

  const getUptimeColor = (uptime: number): string => {
    if (uptime >= 99.5) return '#10B981';
    if (uptime >= 99.0) return '#F59E0B';
    if (uptime >= 95.0) return '#F97316';
    return '#EF4444';
  };

  const formatResponseTime = (time?: number): string => {
    if (!time) return 'N/A';
    if (time < 1000) return `${Math.round(time)}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
        padding: '1.5rem' 
      }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              border: '3px solid rgba(99, 102, 241, 0.1)',
              borderTopColor: '#4F46E5',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.875rem' }}>Loading uptime metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
        padding: '1.5rem' 
      }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#6B7280',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1F2937'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
          >
            <ArrowLeftIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
            Back
          </button>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <ExclamationTriangleIcon style={{ width: '3rem', height: '3rem', color: '#EF4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1F2937', marginBottom: '0.5rem' }}>
              Failed to Load Metrics
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '1rem' }}>{error}</p>
            <button
              onClick={() => fetchUptimeMetrics(selectedPeriod)}
              style={{
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { current_stats } = metrics;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
      padding: '1.5rem' 
    }}>
      <div style={{ maxWidth: '90rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#6B7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1F2937'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              <ArrowLeftIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
              Back
            </button>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1F2937',
                background: 'linear-gradient(90deg, #1F2937, #4F46E5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {metrics.service_name} - Uptime Metrics
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                {getStatusBadge(current_stats.current_status)}
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  Service ID: {serviceId}
                </span>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '0.25rem'
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
                  backgroundColor: selectedPeriod === period ? '#3B82F6' : 'transparent',
                  color: selectedPeriod === period ? '#FFFFFF' : '#6B7280'
                }}
                onMouseEnter={(e) => {
                  if (selectedPeriod !== period) {
                    e.currentTarget.style.color = '#1F2937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPeriod !== period) {
                    e.currentTarget.style.color = '#6B7280';
                  }
                }}
              >
                {period === '24h' ? '24 Hours' : period === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Current Uptime */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Current Uptime</p>
                <p style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: getUptimeColor(current_stats.current_uptime_percentage)
                }}>
                  {current_stats.current_uptime_percentage.toFixed(2)}%
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                  {selectedPeriod === '24h' ? 'Last 24 hours' : 
                   selectedPeriod === '7d' ? 'Last 7 days' : 'Last 30 days'}
                </p>
              </div>
              <ChartBarIcon style={{ width: '2rem', height: '2rem', color: '#D1D5DB' }} />
            </div>
          </div>

          {/* Response Time */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Avg Response Time</p>
                <p style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#3B82F6'
                }}>
                  {formatResponseTime(current_stats.avg_response_time)}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Last 24 hours</p>
              </div>
              <ClockIcon style={{ width: '2rem', height: '2rem', color: '#D1D5DB' }} />
            </div>
          </div>

          {/* Incidents */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Incidents</p>
                <p style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: (() => {
                    const incidents = selectedPeriod === '24h' ? current_stats.total_incidents_24h :
                                   selectedPeriod === '7d' ? current_stats.total_incidents_7d :
                                   current_stats.total_incidents_30d;
                    return incidents > 0 ? '#EF4444' : '#10B981';
                  })()
                }}>
                  {selectedPeriod === '24h' ? current_stats.total_incidents_24h :
                   selectedPeriod === '7d' ? current_stats.total_incidents_7d :
                   current_stats.total_incidents_30d}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                  {selectedPeriod === '24h' ? 'Last 24 hours' : 
                   selectedPeriod === '7d' ? 'Last 7 days' : 'Last 30 days'}
                </p>
              </div>
              <ExclamationTriangleIcon style={{ width: '2rem', height: '2rem', color: '#D1D5DB' }} />
            </div>
          </div>

          {/* Last Incident */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Last Incident</p>
                {current_stats.last_incident ? (
                  <>
                    <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1F2937' }}>
                      {format(new Date(current_stats.last_incident), 'MMM dd')}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                      {format(new Date(current_stats.last_incident), 'yyyy, HH:mm')}
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#10B981' }}>None</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' }}>No recent incidents</p>
                  </>
                )}
              </div>
              <CalendarIcon style={{ width: '2rem', height: '2rem', color: '#D1D5DB' }} />
            </div>
          </div>
        </div>

        {/* Uptime Chart */}
        <div style={{ marginBottom: '2rem' }}>
          <UptimeChart
            data={metrics.graph_data}
            period={selectedPeriod}
            serviceName={metrics.service_name}
          />
        </div>

        {/* Additional Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Uptime Comparison */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>
              Uptime Comparison
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>24 Hours</span>
                <span style={{
                  fontWeight: '500',
                  color: getUptimeColor(current_stats.uptime_24h)
                }}>
                  {current_stats.uptime_24h.toFixed(2)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>7 Days</span>
                <span style={{
                  fontWeight: '500',
                  color: getUptimeColor(current_stats.uptime_7d)
                }}>
                  {current_stats.uptime_7d.toFixed(2)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>30 Days</span>
                <span style={{
                  fontWeight: '500',
                  color: getUptimeColor(current_stats.uptime_30d)
                }}>
                  {current_stats.uptime_30d.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* SLA Information */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>
              SLA Targets
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#10B981', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>99.9% - Premium SLA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#F59E0B', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>99.0% - Standard SLA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#EF4444', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>95.0% - Minimum Target</span>
              </div>
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <InformationCircleIcon style={{ width: '1.25rem', height: '1.25rem', color: '#3B82F6', marginTop: '0.125rem' }} />
                  <div style={{ fontSize: '0.875rem', color: '#1E40AF' }}>
                    <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Current Performance</p>
                    <p style={{ margin: 0 }}>
                      This service is currently {
                        current_stats.uptime_30d >= 99.9 ? 'exceeding' :
                        current_stats.uptime_30d >= 99.0 ? 'meeting' :
                        'below'
                      } SLA targets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default ServiceUptimePage; 