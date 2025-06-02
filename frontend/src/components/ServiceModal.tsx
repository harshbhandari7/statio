import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Service } from '../types';
import './ServiceModal.css';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceData: Partial<Service>) => void;
  service?: Service;
  title: string;
}

const serviceStatuses = [
  { value: 'operational', label: 'Operational', color: '#10b981' },
  { value: 'degraded', label: 'Degraded Performance', color: '#f59e0b' },
  { value: 'partial_outage', label: 'Partial Outage', color: '#ef4444' },
  { value: 'major_outage', label: 'Major Outage', color: '#7f1d1d' },
  { value: 'maintenance', label: 'Maintenance', color: '#6366f1' },
];

export default function ServiceModal({ isOpen, onClose, onSubmit, service, title }: ServiceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Service['status']>('operational');

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || '');
      setStatus(service.status);
    } else {
      // Reset form when creating a new service
      setName('');
      setDescription('');
      setStatus('operational');
    }
  }, [service, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData: Partial<Service> = {
      name,
      description,
      status,
    };
    
    onSubmit(serviceData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
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
          <div className="form-group">
            <label htmlFor="name" className="form-label">Service Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter service name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter service description"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="status-options">
              {serviceStatuses.map((option) => (
                <div 
                  key={option.value} 
                  className={`status-option ${status === option.value ? 'status-selected' : ''}`}
                  onClick={() => setStatus(option.value as Service['status'])}
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
              {service ? 'Update' : 'Create'} Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
