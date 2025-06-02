import { useState, useEffect } from 'react';
import { UserCircleIcon, BuildingOfficeIcon, StarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { organizations } from '../services/api';
import './UserContext.css';

interface Organization {
  id: number;
  name: string;
  slug: string;
}

export default function UserContext() {
  const [userOrg, setUserOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isSuperuser } = useAuth();

  useEffect(() => {
    if (user?.organization_id) {
      fetchUserOrganization();
    }
  }, [user]);

  const fetchUserOrganization = async () => {
    if (!user?.organization_id) return;
    
    try {
      setIsLoading(true);
      const response = await organizations.getOne(user.organization_id);
      setUserOrg(response.data);
    } catch (error) {
      console.error('Failed to fetch user organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="user-context">
      <div className="user-info">
        <div className="user-avatar">
          <UserCircleIcon className="user-avatar-icon" />
        </div>
        <div className="user-details">
          <div className="user-name">
            {user.full_name || user.email}
            {isSuperuser() && (
              <StarIcon className="superuser-icon" title="Superuser" />
            )}
          </div>
          <div className="user-role-org">
            <span className={`user-role role-${user.role}`}>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </span>
            {userOrg && (
              <>
                <span className="role-org-separator">•</span>
                <div className="user-org">
                  <BuildingOfficeIcon className="org-icon" />
                  <span className="org-name">{userOrg.name}</span>
                </div>
              </>
            )}
            {!userOrg && user.organization_id && isLoading && (
              <span className="org-loading">Loading...</span>
            )}
            {!user.organization_id && !isSuperuser() && (
              <span className="no-org">No Organization</span>
            )}
          </div>
        </div>
      </div>
      
      {isSuperuser() && (
        <div className="superuser-indicator">
          <span className="superuser-badge">
            <StarIcon className="superuser-badge-icon" />
            Cross-Org Access
          </span>
        </div>
      )}
    </div>
  );
} 