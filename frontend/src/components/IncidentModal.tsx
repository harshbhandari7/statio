import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Incident, Service } from '../types';
import { services as servicesApi } from '../services/api';
import './IncidentModal.css';

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incidentData: Partial<Incident>) => void;
  incident?: Incident;
  title: string;
}

// Incident status configuration
const incidentStatuses = [
  { value: 'investigating', label: 'Investigating', color: '#ef4444' },
  { value: 'identified', label: 'Identified', color: '#f59e0b' },
  { value: 'monitoring', label: 'Monitoring', color: '#6366f1' },
  { value: 'resolved', label: 'Resolved', color: '#10b981' },
];

// Incident type configuration
const incidentTypes = [
  { value: 'incident', label: 'Incident', description: 'An unplanned disruption or degradation' },
  { value: 'maintenance', label: 'Maintenance', description: 'Planned maintenance or upgrade' },
];

export default function IncidentModal({ isOpen, onClose, onSubmit, incident, title }: IncidentModalProps) {
  const [incidentTitle, setIncidentTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Incident['status']>('investigating');
  const [type, setType] = useState<Incident['type']>('incident');
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Fetch available services when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  // Set form values when editing an existing incident
  useEffect(() => {
    if (incident) {
      setIncidentTitle(incident.title);
      setDescription(incident.description || '');
      setStatus(incident.status);
      setType(incident.type);
      setServiceId(incident.service_id);
    } else {
      // Reset form when creating a new incident
      setIncidentTitle('');
      setDescription('');
      setStatus('investigating');
      setType('incident');
      setServiceId('');
    }
  }, [incident, isOpen]);

  // Fetch all services for the dropdown
  const fetchServices = async () => {
    try {
      setIsLoadingServices(true);
      const response = await servicesApi.getAll();
      setServices(response.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceId) {
      alert('Please select a service');
      return;
    }
    
    const incidentData: Partial<Incident> = {
      title: incidentTitle,
      description,
      status,
      type,
      service_id: Number(serviceId),
    };
    
    onSubmit(incidentData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container incident-modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button 
            type="button" 
            className="modal-close-button"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Incident Type Selection */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-options">
              {incidentTypes.map((option) => (
                <div 
                  key={option.value} 
                  className={`type-option ${type === option.value ? 'type-selected' : ''}`}
                  onClick={() => setType(option.value as Incident['type'])}
                >
                  <div className="type-header">
                    <span className="type-label">{option.label}</span>
                  </div>
                  <p className="type-description">{option.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Service Selection */}
          <div className="form-group">
            <label htmlFor="service" className="form-label">Service</label>
            <select
              id="service"
              className="form-select"
              value={serviceId}
              onChange={(e) => setServiceId(Number(e.target.value) || '')}
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {isLoadingServices && <p className="form-loading">Loading services...</p>}
          </div>
          
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={incidentTitle}
              onChange={(e) => setIncidentTitle(e.target.value)}
              placeholder="Enter incident title"
              required
            />
          </div>
          
          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident or maintenance"
              rows={3}
            />
          </div>
          
          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="status-options">
              {incidentStatuses.map((option) => (
                <div 
                  key={option.value} 
                  className={`status-option ${status === option.value ? 'status-selected' : ''}`}
                  onClick={() => setStatus(option.value as Incident['status'])}
                  style={{ 
                    '--status-color': option.color,
                    '--status-bg-color': `${option.color}20`
                  } as React.CSSProperties}
                >
                  <div className="status-indicator" />
                  <span className="status-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
            >
              {incident ? 'Update' : 'Create'} {type === 'incident' ? 'Incident' : 'Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
