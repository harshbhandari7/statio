// frontend/src/pages/StatusPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicStatus } from '../services/api';
import { StatusOverview, Service, Incident, Maintenance, TimelineEvent } from '../types';
import './StatusPage.css';

export default function StatusPage() {
  const [status, setStatus] = useState<StatusOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusData = await getPublicStatus();
        setStatus(statusData);
      } catch (error) {
        console.error('Error fetching status data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get overall system status based on services
  const getOverallStatus = (services: Service[]) => {
    if (!services || services.length === 0) return 'unknown';
    
    if (services.some(s => s.status === 'major_outage')) return 'major_outage';
    if (services.some(s => s.status === 'partial_outage')) return 'partial_outage';
    if (services.some(s => s.status === 'degraded')) return 'degraded';
    if (services.some(s => s.status === 'maintenance')) return 'maintenance';
    return 'operational';
  };

  // Get human-readable status text
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'operational': 'Operational',
      'degraded': 'Degraded Performance',
      'partial_outage': 'Partial Outage',
      'major_outage': 'Major Outage',
      'maintenance': 'Under Maintenance',
      'investigating': 'Investigating',
      'identified': 'Identified',
      'monitoring': 'Monitoring',
      'resolved': 'Resolved',
      'scheduled': 'Scheduled',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status.replace(/_/g, ' ');
  };

  if (isLoading) {
    return <div className="status-page-loading">Loading status...</div>;
  }
  
  if (!status) {
    return <div className="status-page-error">Failed to load status.</div>;
  }

  const overallStatus = getOverallStatus(status.services);

  return (
    <div className="status-page">
      <header className="status-header">
        <div className="container">
          <h1>System Status</h1>
          <div className={`overall-status status-${overallStatus}`}>
            <div className="status-indicator"></div>
            <span>{getStatusText(overallStatus)}</span>
          </div>
          <p className="last-updated">Last updated: {new Date().toLocaleString()}</p>
        </div>
      </header>

      <main className="container">
        <section className="status-overview">
          <h2>Services Status</h2>
          <div className="status-cards">
            {status.services.map(service => (
              <div key={service.id} className={`status-card status-${service.status}`}>
                <h3>{service.name}</h3>
                <div className="status-indicator"></div>
                <span className="status-text">{getStatusText(service.status)}</span>
                {service.description && <p className="service-description-status">{service.description}</p>}
              </div>
            ))}
          </div>
        </section>

        {status.incidents.length > 0 && (
          <section className="incidents-section">
            <h2>Active Incidents</h2>
            <div className="incident-list">
              {status.incidents.map(incident => (
                <div key={incident.id} className={`incident-item status-${incident.status}`}>
                  <div className="incident-header">
                    <h3>{incident.title}</h3>
                    <span className={`status-badge-status status-${incident.status}`}>
                      {getStatusText(incident.status)}
                    </span>
                  </div>
                  <p className="incident-description-status">{incident.description}</p>
                  <div className="incident-meta">
                    <span className="incident-date">Started: {formatDate(incident.created_at)}</span>
                    {incident.service && (
                      <span className="incident-service">Affected: {incident.service.name}</span>
                    )}
                  </div>
                  {incident.updates && incident.updates.length > 0 && (
                    <div className="incident-updates">
                      <h4>Updates</h4>
                      <div className="updates-timeline">
                        {incident.updates.map(update => (
                          <div key={update.id} className="update-item">
                            <div className="update-marker"></div>
                            <div className="update-content">
                              <p>{update.message}</p>
                              <div className="update-meta">
                                <span className={`status-badge-status status-${update.status}`}>
                                  {update?.status && getStatusText(update.status)}
                                </span>
                                <span className="update-date">{formatDate(update.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {status.maintenances.length > 0 && (
          <section className="maintenances-section">
            <h2>Scheduled Maintenance</h2>
            <div className="maintenance-list">
              {status.maintenances.map(maintenance => (
                <div key={maintenance.id} className={`maintenance-item status-${maintenance.status}`}>
                  <div className="maintenance-header">
                    <h3>{maintenance.title}</h3>
                    <span className={`status-badge-status status-${maintenance.status}`}>
                      {maintenance?.status && getStatusText(maintenance.status)}
                    </span>
                  </div>
                  <p className="maintenance-description">{maintenance.description}</p>
                  <div className="maintenance-meta">
                    <span className="maintenance-date">
                      {formatDate(maintenance.scheduled_start)} - {formatDate(maintenance.scheduled_end)}
                    </span>
                    {maintenance.service && (
                      <span className="maintenance-service">Affects: {maintenance.service.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="timeline-section">
          <h2>Recent Events Timeline</h2>
          {status.timeline.length > 0 ? (
            <div className="timeline">
              {status.timeline.map((event, index) => (
                <div key={`${event.type}-${event.id}-${index}`} className="timeline-item">
                  <div className={`timeline-marker status-${event.status}`}></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h3>{event.title}</h3>
                      <span className={`timeline-type ${event.type}`}>
                        {event.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {event.description && <p>{event.description}</p>}
                    <div className="timeline-meta">
                      <span className={`status-badge-status status-${event.status}`}>
                        {event?.status && getStatusText(event.status)}
                      </span>
                      <span className="timeline-date">{formatDate(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No recent events to display.</p>
          )}
        </section>
      </main>

      <footer className="status-footer">
        <div className="container">
          <div className="footer-content">
            <p> {new Date().getFullYear()} Statio - Modern Status & Incident Management</p>
            <p>For more information, please contact support.</p>
            {isAuthenticated && (
              <div className="admin-link">
                <Link to="/admin">Admin Dashboard</Link>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
