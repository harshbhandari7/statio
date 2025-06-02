import { useState, useEffect } from 'react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { organizations } from '../services/api';
import './OrganizationBadge.css';

interface OrganizationBadgeProps {
  organizationId?: number | null;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
}

const OrganizationBadge: React.FC<OrganizationBadgeProps> = ({
  organizationId,
  showIcon = true,
  size = 'medium',
  className = ''
}) => {
  const [orgName, setOrgName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isSuperuser } = useAuth();

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationName(organizationId);
    } else if (user?.organization_id && !isSuperuser()) {
      // For non-superusers, show their own organization
      fetchOrganizationName(user.organization_id);
    }
  }, [organizationId, user, isSuperuser]);

  const fetchOrganizationName = async (orgId: number) => {
    try {
      setIsLoading(true);
      const response = await organizations.getOne(orgId);
      setOrgName(response.data.name);
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      setOrgName('Unknown Organization');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show badge if no organization or if regular user (since they only see their own data)
  if (!organizationId) {
    // Show "No Organization" badge if user is superuser or if we want to always show org context
    if (isSuperuser()) {
      return (
        <div className={`org-badge org-badge-${size} org-badge-empty ${className}`}>
          {showIcon && <BuildingOfficeIcon className="org-badge-icon" />}
          <span className="org-badge-text">No Organization</span>
        </div>
      );
    }
    return null;
  }

  // Show badge for superusers or always (you can change this logic)
  // For now, let's show it for superusers or when specifically requested
  const shouldShow = isSuperuser() || className.includes('always-show');
  
  if (!shouldShow) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`org-badge org-badge-${size} org-badge-loading ${className}`}>
        <div className="org-badge-spinner"></div>
      </div>
    );
  }

  return (
    <div className={`org-badge org-badge-${size} ${className}`}>
      {showIcon && <BuildingOfficeIcon className="org-badge-icon" />}
      <span className="org-badge-text">{orgName}</span>
    </div>
  );
};

export default OrganizationBadge; 