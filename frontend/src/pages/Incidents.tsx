import { useState, useEffect } from 'react';
import { PlusIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Incident, IncidentUpdate } from '../types';
import { incidents as incidentsApi } from '../services/api';
import IncidentModal from '../components/IncidentModal';
import IncidentUpdateModal from '../components/IncidentUpdateModal';
import './Incidents.css';

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeIncidentId, setActiveIncidentId] = useState<number | null>(null);
  const [incidentUpdates, setIncidentUpdates] = useState<IncidentUpdate[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);

  // Fetch all incidents on component mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Fetch incident updates when an incident is expanded
  useEffect(() => {
    if (activeIncidentId) {
      fetchIncidentUpdates(activeIncidentId);
    }
  }, [activeIncidentId]);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await incidentsApi.getAll();
      setIncidents(response.data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError('Failed to load incidents. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIncidentUpdates = async (incidentId: number) => {
    try {
      setIsLoadingUpdates(true);
      const response = await incidentsApi.getUpdates(incidentId);
      setIncidentUpdates(response.data);
    } catch (err) {
      console.error(`Failed to fetch updates for incident ${incidentId}:`, err);
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  const handleCreateIncident = async (incidentData: Partial<Incident>) => {
    try {
      setIsLoading(true);
      await incidentsApi.create(incidentData);
      await fetchIncidents();
      setIsIncidentModalOpen(false);
    } catch (err) {
      console.error('Failed to create incident:', err);
      setError('Failed to create incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIncident = async (incidentData: Partial<Incident>) => {
    if (!selectedIncident) return;
    
    try {
      setIsLoading(true);
      await incidentsApi.update(selectedIncident.id, incidentData);
      await fetchIncidents();
      setIsIncidentModalOpen(false);
      setSelectedIncident(null);
    } catch (err) {
      console.error('Failed to update incident:', err);
      setError('Failed to update incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUpdate = async (updateData: { message: string; status?: Incident['status'] }) => {
    if (!activeIncidentId) return;
    
    try {
      setIsLoadingUpdates(true);
      await incidentsApi.createUpdate(activeIncidentId, updateData);
      await fetchIncidentUpdates(activeIncidentId);
      await fetchIncidents(); // Refresh incidents to get updated status
      setIsUpdateModalOpen(false);
    } catch (err) {
      console.error('Failed to add update:', err);
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  const handleResolveIncident = async (incidentId: number) => {
    try {
      setIsLoading(true);
      await incidentsApi.update(incidentId, { status: 'resolved' });
      await fetchIncidents();
    } catch (err) {
      console.error('Failed to resolve incident:', err);
      setError('Failed to resolve incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedIncident(null);
    setIsIncidentModalOpen(true);
  };

  const openEditModal = (incident: Incident) => {
    setModalMode('edit');
    setSelectedIncident(incident);
    setIsIncidentModalOpen(true);
  };

  const openUpdateModal = (incidentId: number) => {
    setActiveIncidentId(incidentId);
    setIsUpdateModalOpen(true);
  };

  const toggleIncidentDetails = (incidentId: number) => {
    if (activeIncidentId === incidentId) {
      setActiveIncidentId(null);
      setIncidentUpdates([]);
    } else {
      setActiveIncidentId(incidentId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIncidentTypeLabel = (type: Incident['type']) => {
    return type === 'incident' ? 'Incident' : 'Maintenance';
  };

  const getStatusLabel = (status: Incident['status']) => {
    const statusMap: Record<Incident['status'], string> = {
      investigating: 'Investigating',
      identified: 'Identified',
      monitoring: 'Monitoring',
      resolved: 'Resolved'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="incidents-container">
      <div className="incidents-header">
        <div className="header-flex">
          <h1 className="incidents-title">Incidents</h1>
          <div className="header-buttons">
            <button
              type="button"
              className="add-button maintenance-button"
              onClick={() => {
                setModalMode('create');
                setSelectedIncident({ type: 'maintenance' } as Incident);
                setIsIncidentModalOpen(true);
              }}
            >
              <CalendarIcon className="button-icon" aria-hidden="true" />
              Schedule Maintenance
            </button>
            <button
              type="button"
              className="add-button"
              onClick={openCreateModal}
            >
              <PlusIcon className="button-icon" aria-hidden="true" />
              Report Incident
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      <div className="incidents-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading incidents...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="empty-container">
            <h3 className="empty-title">No incidents</h3>
            <p className="empty-description">No incidents have been reported yet.</p>
          </div>
        ) : (
          <div className="incidents-list">
            <ul className="incidents-list-items">
              {incidents.map((incident) => (
                <li 
                  key={incident.id} 
                  className={`incident-item status-${incident.status} type-${incident.type} ${activeIncidentId === incident.id ? 'expanded' : ''}`}
                >
                  <div 
                    className="incident-content"
                    onClick={() => toggleIncidentDetails(incident.id)}
                  >
                    <div className="incident-header">
                      <div className="incident-title-container">
                        <span className="incident-type-badge">
                          {getIncidentTypeLabel(incident.type)}
                        </span>
                        <h3 className="incident-title">{incident.title}</h3>
                      </div>
                      <div className="incident-badges">
                        <span className={`incident-badge status-${incident.status}`}>
                          {getStatusLabel(incident.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="incident-details">
                      <p className="incident-description">{incident.description}</p>
                      <div className="incident-meta">
                        <span className="incident-date">
                          <ClockIcon className="icon-small" />
                          {formatDate(incident.created_at)}
                        </span>
                        {incident.resolved_at && (
                          <span className="incident-resolved-date">
                            Resolved: {formatDate(incident.resolved_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {activeIncidentId === incident.id && (
                    <div className="incident-expanded">
                      <div className="incident-actions">
                        <button 
                          className="action-button edit-button"
                          onClick={() => openEditModal(incident)}
                        >
                          Edit Details
                        </button>
                        <button 
                          className="action-button update-button"
                          onClick={() => openUpdateModal(incident.id)}
                        >
                          Add Update
                        </button>
                        {incident.status !== 'resolved' && (
                          <button 
                            className="action-button resolve-button"
                            onClick={() => handleResolveIncident(incident.id)}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                      
                      <div className="incident-updates">
                        <h4 className="updates-title">Updates</h4>
                        {isLoadingUpdates ? (
                          <div className="loading-container small">
                            <div className="loading-spinner small"></div>
                            <p className="loading-text small">Loading updates...</p>
                          </div>
                        ) : incidentUpdates.length === 0 ? (
                          <div className="no-updates">
                            No updates have been posted yet.
                          </div>
                        ) : (
                          <div className="updates-list">
                            {incidentUpdates.map((update) => (
                              <div key={update.id} className="update-item">
                                <div className="update-header">
                                  <span className="update-timestamp">
                                    {formatDate(update.created_at)}
                                  </span>
                                  {update.status && (
                                    <span className={`update-status ${update.status}`}>
                                      {getStatusLabel(update.status)}
                                    </span>
                                  )}
                                </div>
                                <p className="update-message">{update.message}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Incident Modal */}
      <IncidentModal 
        isOpen={isIncidentModalOpen}
        onClose={() => {
          setIsIncidentModalOpen(false);
          setSelectedIncident(null);
        }}
        onSubmit={modalMode === 'create' ? handleCreateIncident : handleUpdateIncident}
        incident={selectedIncident || undefined}
        title={modalMode === 'create' 
          ? (selectedIncident?.type === 'maintenance' ? 'Schedule Maintenance' : 'Report Incident') 
          : 'Edit Incident'
        }
      />

      {/* Incident Update Modal */}
      {activeIncidentId && (
        <IncidentUpdateModal 
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleCreateUpdate}
          incidentTitle={incidents.find(i => i.id === activeIncidentId)?.title || ''}
          currentStatus={incidents.find(i => i.id === activeIncidentId)?.status || 'investigating'}
        />
      )}
    </div>
  );
}