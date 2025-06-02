import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  PlusIcon,
  BellIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface DashboardStats {
  total_services: number;
  active_incidents: number;
  total_users: number;
  recent_activity_count: number;
}

interface RecentActivity {
  id: number;
  type: 'incident' | 'service' | 'user';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total_services: 0,
    active_incidents: 0,
    total_users: 0,
    recent_activity_count: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls for dashboard data
      setStats({
        total_services: 4,
        active_incidents: 1,
        total_users: 8,
        recent_activity_count: 5
      });

      setRecentActivity([
        {
          id: 1,
          type: 'incident',
          title: 'API Service Degraded',
          description: 'Response times increased by 200ms',
          timestamp: '2 hours ago',
          status: 'investigating'
        },
        {
          id: 2,
          type: 'service',
          title: 'New Service Added',
          description: 'CDN service now being monitored',
          timestamp: '1 day ago'
        },
        {
          id: 3,
          type: 'user',
          title: 'New User Registered',
          description: 'john.doe@example.com joined the team',
          timestamp: '2 days ago'
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    {
      title: 'Services',
      value: stats.total_services,
      icon: ServerIcon,
      color: '#3B82F6',
      link: '/services',
      description: 'Total active services'
    },
    {
      title: 'Active Incidents',
      value: stats.active_incidents,
      icon: ExclamationTriangleIcon,
      color: stats.active_incidents > 0 ? '#EF4444' : '#10B981',
      link: '/incidents',
      description: 'Requiring attention'
    },
    {
      title: 'Team Members',
      value: stats.total_users,
      icon: UserGroupIcon,
      color: '#8B5CF6',
      link: '/users',
      description: 'Active users'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Service',
      description: 'Start monitoring a new service',
      icon: PlusIcon,
      link: '/services',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.2)'
    },
    {
      title: 'Report Incident',
      description: 'Create a new incident report',
      icon: BellIcon,
      link: '/incidents',
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.2)'
    },
    {
      title: 'View Analytics',
      description: 'Check detailed metrics and charts',
      icon: ChartBarIcon,
      link: '/analytics',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.2)'
    },
    {
      title: 'Public Status',
      description: 'View your public status page',
      icon: EyeIcon,
      link: '/status',
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: 'rgba(139, 92, 246, 0.2)'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident': return ExclamationTriangleIcon;
      case 'service': return ServerIcon;
      case 'user': return UserGroupIcon;
      default: return BellIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'incident': return { color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' };
      case 'service': return { color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' };
      case 'user': return { color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' };
      default: return { color: '#6B7280', backgroundColor: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.1)',
            borderTopColor: '#4F46E5',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.875rem' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: '#1F2937',
          background: 'linear-gradient(90deg, #1F2937, #4F46E5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.025em'
        }}>
          Welcome back, {user?.full_name || user?.email || 'User'}! 👋
        </h1>
        <p style={{ color: '#6B7280', marginTop: '0.5rem', fontSize: '1rem' }}>
          Here's what's happening with your services today.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {summaryCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            style={{
              display: 'block',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              padding: '1.5rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#6B7280',
                  marginBottom: '0.25rem'
                }}>
                  {card.title}
                </p>
                <p style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#1F2937',
                  marginBottom: '0.25rem'
                }}>
                  {card.value}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                  {card.description}
                </p>
              </div>
              <div style={{
                backgroundColor: card.color,
                borderRadius: '0.75rem',
                padding: '1rem',
                boxShadow: `0 4px 6px -1px ${card.color}33, 0 2px 4px -1px ${card.color}22`
              }}>
                <card.icon style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '1.5rem'
          }}>
            Quick Actions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  border: `2px dashed ${action.borderColor}`,
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.backgroundColor = action.bgColor;
                  e.currentTarget.style.color = action.color;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = action.borderColor;
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'inherit';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.75rem',
                  color: action.color,
                  transition: 'transform 0.2s'
                }}>
                  <action.icon style={{ width: '1.75rem', height: '1.75rem' }} />
                </div>
                <h3 style={{
                  fontWeight: '500',
                  textAlign: 'center',
                  marginBottom: '0.25rem',
                  color: '#1F2937'
                }}>
                  {action.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  textAlign: 'center'
                }}>
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0.75rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1F2937'
            }}>
              Recent Activity
            </h2>
            <Link 
              to="/analytics"
              style={{
                color: '#3B82F6',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#2563EB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3B82F6';
              }}
            >
              View All Analytics →
            </Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivity.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const activityColor = getActivityColor(activity.type);
              return (
                <div 
                  key={activity.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    transition: 'background-color 0.2s',
                    animation: `slideIn 0.3s ease-out forwards`,
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(243, 244, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    borderRadius: '50%',
                    padding: '0.625rem',
                    backgroundColor: activityColor.backgroundColor,
                    color: activityColor.color
                  }}>
                    <ActivityIcon style={{ width: '1rem', height: '1rem' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1F2937'
                    }}>
                      {activity.title}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6B7280',
                      marginTop: '0.125rem'
                    }}>
                      {activity.description}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#9CA3AF',
                      marginTop: '0.25rem'
                    }}>
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {recentActivity.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <BellIcon style={{
                width: '3rem',
                height: '3rem',
                color: '#D1D5DB',
                margin: '0 auto 0.75rem'
              }} />
              <p style={{ color: '#6B7280' }}>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div style={{
        marginTop: '2rem',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
        borderRadius: '0.75rem',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginRight: '1rem'
            }}>
              <ChartBarIcon style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
            </div>
            <div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1F2937'
              }}>
                System Status
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginTop: '0.25rem'
              }}>
                {stats.active_incidents === 0 
                  ? "All systems operational 🟢" 
                  : `${stats.active_incidents} incident${stats.active_incidents > 1 ? 's' : ''} requiring attention 🟡`
                }
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              to="/analytics"
              style={{
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3B82F6';
              }}
            >
              <ChartBarIcon style={{ width: '1rem', height: '1rem' }} />
              <span>View Analytics</span>
            </Link>
            <Link
              to="/status"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#3B82F6',
                border: '1px solid #3B82F6',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <EyeIcon style={{ width: '1rem', height: '1rem' }} />
              <span>Public Status</span>
            </Link>
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
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;