import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { organizations } from '../services/api';
import toast from 'react-hot-toast';
import OrganizationModal from '../components/OrganizationModal';
import type { Organization } from '../types';
import './Organizations.css';

export default function Organizations() {
  const [orgList, setOrgList] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentOrg, setCurrentOrg] = useState<Organization | undefined>(undefined);
  
  const { user: currentUser, isSuperuser } = useAuth();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizations.getAll();
      setOrgList(response.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrganization = () => {
    setCurrentOrg(undefined);
    setModalTitle('Add Organization');
    setIsModalOpen(true);
  };

  const handleEditOrganization = (org: Organization) => {
    setCurrentOrg(org);
    setModalTitle('Edit Organization');
    setIsModalOpen(true);
  };

  const handleCreateOrUpdate = async (organization: Partial<Organization>) => {
    try {
      if (currentOrg) {
        // Update existing organization - filter out fields that can't be updated
        const updateData: Partial<Organization> = {};
        if (organization.name !== undefined) updateData.name = organization.name;
        if (organization.description !== undefined) updateData.description = organization.description;
        if (organization.logo_url !== undefined) updateData.logo_url = organization.logo_url;
        if (organization.is_active !== undefined) updateData.is_active = organization.is_active;
        
        await organizations.update(currentOrg.id, updateData);
        
        // Update local state
        setOrgList(prevOrgs => 
          prevOrgs.map(org => 
            org.id === currentOrg.id ? { ...org, ...updateData } : org
          )
        );
        
        toast.success('Organization updated successfully');
      } else {
        // Create new organization - ensure required fields are present
        if (!organization.name || !organization.slug) {
          throw new Error('Name and slug are required');
        }
        
        const createData = {
          name: organization.name,
          slug: organization.slug,
          description: organization.description,
          logo_url: organization.logo_url,
          is_active: organization.is_active,
        };
        const response = await organizations.create(createData);
        
        // Update local state
        setOrgList(prevOrgs => [...prevOrgs, response.data]);
        
        toast.success('Organization created successfully');
      }
      
      // Close modal
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      setError(currentOrg ? 'Failed to update organization' : 'Failed to create organization');
    }
  };

  const handleDeleteOrganization = async (orgId: number) => {
    if (!confirm('Are you sure you want to delete this organization?')) {
      return;
    }
    
    try {
      // Call API to delete
      await organizations.delete(orgId);
      
      // Update local state
      setOrgList(prevOrgs => prevOrgs.filter(org => org.id !== orgId));
      
      toast.success('Organization deleted successfully');
    } catch (error) {
      console.error(error);
      setError('Failed to delete organization');
    }
  };

  return (
    <div className="organizations-container">
      <div className="organizations-header">
        <div className="header-flex">
          <div>
            <h1 className="organizations-title">Organizations</h1>
            <p className="organizations-subtitle">Manage your organizations and their settings</p>
          </div>
          {isSuperuser() && (
            <button 
              type="button"
              className="add-button" 
              onClick={handleAddOrganization}
            >
              <PlusIcon className="button-icon" aria-hidden="true" />
              Add Organization
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}
      
      <div className="organizations-content">
        {loading && orgList.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading organizations...</p>
          </div>
        ) : orgList.length === 0 ? (
          <div className="empty-container">
            <h3 className="empty-title">No organizations</h3>
            <p className="empty-description">Get started by creating a new organization.</p>
          </div>
        ) : (
          <div className="organizations-card">
            <div className="organizations-table-header">
              <div className="name-col">Organization</div>
              <div className="slug-col">Slug</div>
              <div className="status-col">Status</div>
              <div className="actions-col">Actions</div>
            </div>
            
            <div className="organizations-list">
              {orgList.map(org => (
                <div key={org.id} className="organization-item">
                  <div className="name-col">
                    <div className="org-info">
                      {org.logo_url ? (
                        <img src={org.logo_url} alt={org.name} className="org-logo" />
                      ) : (
                        <div className="org-logo-placeholder">{org.name.charAt(0).toUpperCase()}</div>
                      )}
                      <div className="org-details">
                        <div className="org-name">{org.name}</div>
                        {org.description && (
                          <div className="org-description">{org.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="slug-col">
                    <span className="org-slug">{org.slug}</span>
                  </div>
                  <div className="status-col">
                    <span className={`status-badge ${org.is_active ? 'active' : 'inactive'}`}>
                      {org.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="actions-col">
                    {isSuperuser() && (
                      <>
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditOrganization(org)}
                          aria-label="Edit organization"
                        >
                          <PencilIcon className="action-icon" width={18} height={18} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteOrganization(org.id)}
                          aria-label="Delete organization"
                        >
                          <TrashIcon className="action-icon" width={18} height={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <OrganizationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
          organization={currentOrg}
          title={modalTitle}
        />
      )}
    </div>
  );
}
