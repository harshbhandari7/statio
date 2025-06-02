import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, BuildingOfficeIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import './OrganizationSwitcher.css';

interface Organization {
  id: number;
  name: string;
  slug: string;
  role?: string; // User's role in this organization
}

interface OrganizationSwitcherProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showRole?: boolean;
}

const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  className = '',
  size = 'medium',
  showRole = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Mock data - replace with real API calls
  const mockOrganizations: Organization[] = [
    { id: 6, name: 'Acme Corporation', slug: 'acme', role: 'Admin' },
    { id: 7, name: 'Beta Inc', slug: 'beta', role: 'Manager' },
    { id: 8, name: 'Gamma Solutions', slug: 'gamma', role: 'Viewer' },
    { id: 9, name: 'Delta Enterprises', slug: 'delta', role: 'Admin' },
  ];

  useEffect(() => {
    // Simulate loading organizations
    setIsLoading(true);
    setTimeout(() => {
      setOrganizations(mockOrganizations);
      setCurrentOrg(mockOrganizations[0]); // Set first as current
      setIsLoading(false);
    }, 500);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOrganizationSwitch = async (org: Organization) => {
    setIsLoading(true);
    try {
      // TODO: Call API to switch organization
      // await api.post(`/switch-organization/${org.id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentOrg(org);
      setIsOpen(false);
      setSearchQuery('');
      
      // TODO: Refresh app state/context
      // window.location.reload(); // Temporary - replace with proper state management
      
    } catch (error) {
      console.error('Failed to switch organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'manager': return 'role-manager';
      case 'viewer': return 'role-viewer';
      default: return 'role-default';
    }
  };

  if (isLoading && !currentOrg) {
    return (
      <div className={`org-switcher org-switcher-${size} org-switcher-loading ${className}`}>
        <div className="org-switcher-spinner"></div>
        <span className="org-switcher-loading-text">Loading...</span>
      </div>
    );
  }

  // Don't show switcher if user only has access to one organization
  if (organizations.length <= 1) {
    return (
      <div className={`org-switcher org-switcher-${size} org-switcher-single ${className}`}>
        <BuildingOfficeIcon className="org-switcher-icon" />
        <div className="org-switcher-info">
          <span className="org-switcher-name">{currentOrg?.name || 'No Organization'}</span>
          {showRole && currentOrg?.role && (
            <span className={`org-switcher-role ${getRoleColor(currentOrg.role)}`}>
              {currentOrg.role}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`org-switcher org-switcher-${size} ${className}`} ref={dropdownRef}>
      <button
        className={`org-switcher-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <BuildingOfficeIcon className="org-switcher-icon" />
        <div className="org-switcher-info">
          <span className="org-switcher-name">{currentOrg?.name || 'Select Organization'}</span>
          {showRole && currentOrg?.role && (
            <span className={`org-switcher-role ${getRoleColor(currentOrg.role)}`}>
              {currentOrg.role}
            </span>
          )}
        </div>
        <ChevronDownIcon className={`org-switcher-arrow ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="org-switcher-dropdown">
          <div className="org-switcher-search">
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="org-switcher-search-input"
            />
          </div>
          
          <div className="org-switcher-list">
            {filteredOrgs.length === 0 ? (
              <div className="org-switcher-empty">
                No organizations found
              </div>
            ) : (
              filteredOrgs.map((org) => (
                <button
                  key={org.id}
                  className={`org-switcher-item ${currentOrg?.id === org.id ? 'active' : ''}`}
                  onClick={() => handleOrganizationSwitch(org)}
                  disabled={isLoading}
                >
                  <div className="org-switcher-item-info">
                    <span className="org-switcher-item-name">{org.name}</span>
                    {showRole && org.role && (
                      <span className={`org-switcher-item-role ${getRoleColor(org.role)}`}>
                        {org.role}
                      </span>
                    )}
                  </div>
                  {currentOrg?.id === org.id && (
                    <CheckIcon className="org-switcher-check" />
                  )}
                </button>
              ))
            )}
          </div>
          
          <div className="org-switcher-footer">
            <button className="org-switcher-manage">
              Manage Organizations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher; 