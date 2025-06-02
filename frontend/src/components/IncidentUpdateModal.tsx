import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Incident } from '../types';
import './IncidentModal.css'; // Reuse the same CSS

interface IncidentUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updateData: { message: string; status?: Incident['status'] }) => void;
  incidentTitle: string;
  currentStatus: Incident['status'];
}

// Incident status configuration
const incidentStatuses = [
  { value: 'investigating', label: 'Investigating', color: '#ef4444' },
  { value: 'identified', label: 'Identified', color: '#f59e0b' },
  { value: 'monitoring', label: 'Monitoring', color: '#6366f1' },
  { value: 'resolved', label: 'Resolved', color: '#10b981' },
];

export default function IncidentUpdateModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  incidentTitle,
  currentStatus 
}: IncidentUpdateModalProps) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Incident['status'] | ''>('');
  const [updateStatus, setUpdateStatus] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Please enter an update message');
      return;
    }
    
    const updateData = {
      message: message.trim(),
      status: updateStatus ? status as Incident['status'] : undefined
    };
    
    onSubmit(updateData);
    resetForm();
  };

  const resetForm = () => {
    setMessage('');
    setStatus('');
    setUpdateStatus(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container incident-modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Update to Incident</h2>
          <button 
            type="button" 
            className="modal-close-button"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="incident-info">
          <h3 className="incident-update-title">{incidentTitle}</h3>
          <div className="incident-current-status">
            <span className="status-label">Current Status:</span>
            <span 
              className="status-value"
              style={{ 
                color: incidentStatuses.find(s => s.value === currentStatus)?.color || '#6b7280'
              }}
            >
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Update Message */}
          <div className="form-group">
            <label htmlFor="message" className="form-label">Update Message</label>
            <textarea
              id="message"
              className="form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide details about this update"
              rows={4}
              required
            />
          </div>
          
          {/* Status Update Option */}
          <div className="form-group update-status-toggle">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.checked)}
              />
              <span className="checkbox-label">Update incident status</span>
            </label>
          </div>
          
          {/* Status Selection (only shown if updateStatus is true) */}
          {updateStatus && (
            <div className="form-group">
              <label className="form-label">New Status</label>
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
          )}
          
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
              Add Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
