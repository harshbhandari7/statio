import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { Incident } from '../types';
import './Incidents.css';

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="incidents-container">
      <div className="incidents-header">
        <div className="header-flex">
          <h1 className="incidents-title">Incidents</h1>
          <button
            type="button"
            className="add-button"
          >
            <PlusIcon className="button-icon" aria-hidden="true" />
            Report Incident
          </button>
        </div>
      </div>
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
                <li key={incident.id} className="incident-item">
                  <div className="incident-content">
                    <div className="incident-header">
                      <p className="incident-title">{incident.title}</p>
                      <div>
                        <p className="incident-badge">
                          {incident.status}
                        </p>
                      </div>
                    </div>
                    <div className="incident-details">
                      <div>
                        <p className="incident-description">{incident.description}</p>
                      </div>
                      <div className="incident-date">
                        <p>
                          Reported {new Date(incident.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}