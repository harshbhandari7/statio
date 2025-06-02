import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Organization } from '../types';
import './OrganizationModal.css';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (organizationData: Partial<Organization>) => void;
  organization?: Organization;
  title: string;
}

export default function OrganizationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  organization, 
  title 
}: OrganizationModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setSlug(organization.slug);
      setDescription(organization.description || '');
      setLogoUrl(organization.logo_url || '');
      setIsActive(organization.is_active);
    } else {
      // Reset form when creating a new organization
      setName('');
      setSlug('');
      setDescription('');
      setLogoUrl('');
      setIsActive(true);
    }
  }, [organization, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const organizationData: Partial<Organization> = {
      name,
      slug,
      description,
      logo_url: logoUrl,
      is_active: isActive,
    };
    
    onSubmit(organizationData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-button" onClick={onClose}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="slug">Slug</label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="enter-slug-here"
              required
            />
            <small>Used in URLs, must be unique</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the organization"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="logo_url">Logo URL</label>
            <input
              type="text"
              id="logo_url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="is_active">Active</label>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {organization ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
