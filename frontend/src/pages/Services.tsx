import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { Service } from '../types';
import './Services.css';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="services-container">
      <div className="services-header">
        <div className="header-flex">
          <h1 className="services-title">Services</h1>
          <button
            type="button"
            className="add-button"
          >
            <PlusIcon className="button-icon" aria-hidden="true" />
            Add Service
          </button>
        </div>
      </div>
      <div className="services-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-container">
            <h3 className="empty-title">No services</h3>
            <p className="empty-description">Get started by creating a new service.</p>
          </div>
        ) : (
          <div className="services-list">
            <ul className="services-list-items">
              {services.map((service) => (
                <li key={service.id} className="service-item">
                  <div className="service-content">
                    <div className="service-header">
                      <p className="service-title">{service.name}</p>
                      <div>
                        <p className="service-badge">
                          {service.status}
                        </p>
                      </div>
                    </div>
                    <div className="service-details">
                      <div>
                        <p className="service-description">{service.description}</p>
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