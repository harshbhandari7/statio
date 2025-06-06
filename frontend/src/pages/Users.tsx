import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { users, organizations } from '../services/api';
import { User } from '../types';
import toast from 'react-hot-toast';
import './Users.css';

interface Organization {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export default function Users() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [orgList, setOrgList] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { user: currentUser, isAdmin, isSuperuser } = useAuth();

  useEffect(() => {
    // Redirect if not admin
    if (currentUser && !isAdmin()) {
      toast.error('You do not have permission to access this page');
      window.location.href = '/dashboard';
      return;
    }

    fetchUsers();
    fetchOrganizations();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await users.getAll();
      setUsersList(response.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await organizations.getAll();
      setOrgList(response.data);
    } catch (error) {
      toast.error('Failed to load organizations');
      console.error(error);
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'manager' | 'viewer') => {
    try {
      await users.updateRole(userId, newRole);
      toast.success('User role updated successfully');
      
      // Update local state
      setUsersList(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update user role');
      console.error(error);
    }
  };

  const handleOrganizationChange = async (userId: number, organizationId: number) => {
    try {
      await users.updateOrganization(userId, organizationId);
      toast.success('User organization updated successfully');
      
      // Update local state
      setUsersList(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, organization_id: organizationId } : u
        )
      );
      
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update user organization');
      console.error(error);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'manager':
        return 'role-badge manager';
      case 'viewer':
        return 'role-badge viewer';
      default:
        return 'role-badge';
    }
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="users-loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Team Management</h1>
        <p>Manage your team members and their access levels</p>
      </div>

      <div className="users-card">
        <div className="users-table-header">
          <div className="user-col">User</div>
          <div className="role-col">Role</div>
          <div className="organization-col">Organization</div>
          <div className="actions-col">Actions</div>
        </div>
        
        {usersList.length === 0 ? (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        ) : (
          <div className="users-list">
            {usersList.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-col">
                  <div className="user-info">
                    <div className="user-name">{user.full_name}</div>
                    <div className="user-email">{user.email}</div>
                    {user.is_superuser && <span className="superuser-badge">Superuser</span>}
                  </div>
                </div>
                
                <div className="role-col">
                  {editingUser?.id === user.id ? (
                    <div className="role-selector">
                      <button 
                        className={`role-option ${user.role === 'admin' ? 'selected' : ''}`}
                        onClick={() => handleRoleChange(user.id, 'admin')}
                      >
                        Admin
                      </button>
                      <button 
                        className={`role-option ${user.role === 'manager' ? 'selected' : ''}`}
                        onClick={() => handleRoleChange(user.id, 'manager')}
                      >
                        Manager
                      </button>
                      <button 
                        className={`role-option ${user.role === 'viewer' ? 'selected' : ''}`}
                        onClick={() => handleRoleChange(user.id, 'viewer')}
                      >
                        Viewer
                      </button>
                    </div>
                  ) : (
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </div>
                
                <div className="organization-col">
                  {editingUser?.id === user.id ? (
                    <div className="organization-selector">
                      {isSuperuser() && orgList.length > 0 && (
                        <select 
                          value={editingUser.organization_id || ''}
                          onChange={(e) => setEditingUser({
                            ...editingUser, 
                            organization_id: e.target.value ? parseInt(e.target.value) : null
                          })}
                        >
                          <option value="">None</option>
                          {orgList.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <p>
                      {orgList.length > 0 && user.organization_id 
                        ? orgList.find(org => org.id === user.organization_id)?.name || 'Unknown' 
                        : 'None'}
                    </p>
                  )}
                </div>
                
                <div className="actions-col">
                  {!user.is_superuser && user.id !== currentUser?.id && (
                    editingUser?.id === user.id ? (
                      <button 
                        className="cancel-button"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button 
                        className="edit-button"
                        onClick={() => setEditingUser(user)}
                      >
                        Edit
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="users-info-card">
        <h3>About User Roles</h3>
        <div className="roles-info">
          <div className="role-info-item">
            <span className="role-badge admin">Admin</span>
            <p>Full access to all features, including user management and system settings</p>
          </div>
          <div className="role-info-item">
            <span className="role-badge manager">Manager</span>
            <p>Can create and manage incidents, services, and maintenances</p>
          </div>
          <div className="role-info-item">
            <span className="role-badge viewer">Viewer</span>
            <p>Read-only access to incidents, services, and status information</p>
          </div>
        </div>
      </div>
    </div>
  );
}
