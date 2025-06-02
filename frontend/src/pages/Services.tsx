import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Service } from '../types';
import { services as servicesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/status/StatusBadge';
import OrganizationBadge from '../components/OrganizationBadge';
import ServiceModal from '../components/ServiceModal';
import './Services.css';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSuperuser } = useAuth();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentService, setCurrentService] = useState<Service | undefined>(undefined);
  
  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);
  
  // Fetch all services
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await servicesApi.getAll();
      setServices(response.data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Failed to load services. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open modal to create a new service
  const handleAddService = () => {
    setCurrentService(undefined);
    setModalTitle('Add New Service');
    setIsModalOpen(true);
  };
  
  // Open modal to edit an existing service
  const handleEditService = (service: Service) => {
    setCurrentService(service);
    setModalTitle('Edit Service');
    setIsModalOpen(true);
  };
  
  // Handle service creation and update
  const handleSubmitService = async (serviceData: Partial<Service>) => {
    try {
      setIsLoading(true);
      
      if (currentService) {
        // Update existing service
        await servicesApi.update(currentService.id, serviceData);
      } else {
        // Create new service
        await servicesApi.create(serviceData);
      }
      
      // Refresh services list and close modal
      await fetchServices();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save service:', err);
      setError('Failed to save service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle service deletion
  const handleDeleteService = async (serviceId: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await servicesApi.delete(serviceId);
      await fetchServices();
    } catch (err) {
      console.error('Failed to delete service:', err);
      setError('Failed to delete service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="services-container">
      <div className="services-header">
        <div className="header-flex">
          <h1 className="services-title">Services</h1>
          <button
            type="button"
            className="add-button"
            onClick={handleAddService}
          >
            <PlusIcon className="button-icon" aria-hidden="true" />
            Add Service
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}
      
      <div className="services-content">
        {isLoading && services.length === 0 ? (
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
                <li 
                  key={service.id} 
                  className={`service-item status-${service.status}`}
                >
                  <div className="service-content">
                    <div className="service-header">
                      <div className="service-title-container">
                        <p className="service-title">{service.name}</p>
                        <OrganizationBadge 
                          organizationId={service.organization_id}
                          size="small"
                          className="service-org-badge always-show"
                        />
                      </div>
                      <StatusBadge status={service.status} />
                    </div>
                    <div className="service-details">
                      <div>
                        <p className="service-description">
                          {service.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="service-meta">
                        <span className="service-created">
                          Created: {new Date(service.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="service-actions">
                      <button 
                        className="service-action-button"
                        onClick={() => handleEditService(service)}
                      >
                        <PencilIcon className="service-action-button-icon" />
                        Edit
                      </button>
                      <button 
                        className="service-action-button"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <TrashIcon className="service-action-button-icon" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitService}
        service={currentService}
        title={modalTitle}
      />
    </div>
  );
}