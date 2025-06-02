# Multi-Organization User Membership Migration Plan

## Database Schema Changes

### 1. Create User-Organization Junction Table
```sql
CREATE TABLE user_organizations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer', -- admin, manager, viewer per org
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);
```

### 2. Add Current Organization to Users
```sql
ALTER TABLE users ADD COLUMN current_organization_id INTEGER REFERENCES organizations(id);
```

### 3. Migrate Existing Data
```sql
-- Migrate existing user-org relationships
INSERT INTO user_organizations (user_id, organization_id, role, is_active)
SELECT id, organization_id, role, true 
FROM users 
WHERE organization_id IS NOT NULL;

-- Set current organization
UPDATE users SET current_organization_id = organization_id 
WHERE organization_id IS NOT NULL;
```

### 4. Remove Old Column (Optional)
```sql
-- After migration is complete and tested
ALTER TABLE users DROP COLUMN organization_id;
```

## Backend API Changes

### 1. New User Model
```python
class UserModel(Base):
    # ... existing fields ...
    current_organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    
    # Relationships
    current_organization = relationship("OrganizationModel", foreign_keys=[current_organization_id])
    organizations = relationship("UserOrganizationModel", back_populates="user")

class UserOrganizationModel(Base):
    __tablename__ = "user_organizations"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("UserModel", back_populates="organizations")
    organization = relationship("OrganizationModel", back_populates="users")
```

### 2. New API Endpoints
```python
# Switch organization endpoint
@router.post("/switch-organization/{org_id}")
def switch_organization(org_id: int, current_user: UserModel = Depends(get_current_user)):
    # Verify user has access to this organization
    # Update current_organization_id
    # Return updated user info

# Get user's organizations
@router.get("/my-organizations")
def get_user_organizations(current_user: UserModel = Depends(get_current_user)):
    # Return list of organizations user belongs to

# Join organization (invitation-based)
@router.post("/join-organization")
def join_organization(invitation_token: str, current_user: UserModel = Depends(get_current_user)):
    # Process organization invitation
```

### 3. Updated Security Context
```python
def get_current_user_context(current_user: UserModel = Depends(get_current_user)):
    """Get user with their current organization context"""
    return {
        'user': current_user,
        'current_org_id': current_user.current_organization_id,
        'role_in_org': get_user_role_in_org(current_user.id, current_user.current_organization_id),
        'available_orgs': get_user_organizations(current_user.id)
    }
```

## Frontend Implementation

### 1. Organization Context Provider
```typescript
interface OrgContextType {
  currentOrg: Organization | null;
  availableOrgs: Organization[];
  switchOrganization: (orgId: number) => Promise<void>;
  userRoleInCurrentOrg: string;
}

export const OrganizationContext = createContext<OrgContextType>()
```

### 2. Organization Switcher Component
```typescript
const OrganizationSwitcher = () => {
  const { currentOrg, availableOrgs, switchOrganization } = useOrganization();
  
  return (
    <div className="org-switcher">
      <select 
        value={currentOrg?.id || ''} 
        onChange={(e) => switchOrganization(Number(e.target.value))}
      >
        {availableOrgs.map(org => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  );
};
```

### 3. Updated API Calls
```typescript
// All API calls now include current organization context
const api = axios.create({
  headers: {
    'X-Current-Organization': currentOrgId
  }
});
```

## User Experience Flow

### 1. Multi-Org User Login
1. User logs in → See organization switcher
2. Default to last used organization
3. Can switch organizations anytime

### 2. Single-Org User Login  
1. User logs in → Direct to their organization
2. No switcher shown (seamless experience)

### 3. Organization Switching
1. Click organization switcher
2. Select different organization
3. Page refreshes with new organization context
4. All data filtered to new organization

## Permission Matrix
```
Role in Org A + Role in Org B = Combined Permissions
- Admin in Acme + Viewer in Beta = Admin in Acme, Viewer in Beta
- Manager in both = Manager permissions in both
- Cross-org superuser = All permissions everywhere
```

## Implementation Phases

### Phase 1: Database Migration
- Create user_organizations table
- Migrate existing data
- Test data integrity

### Phase 2: Backend API
- Update models and relationships
- Add organization switching endpoints
- Update security context

### Phase 3: Frontend Components  
- Organization context provider
- Organization switcher component
- Update all pages to use context

### Phase 4: Advanced Features
- Organization invitations
- Cross-organization permissions
- Organization-specific roles

## Benefits

✅ **Flexibility**: Users can work across multiple organizations
✅ **Security**: Proper isolation between organizations  
✅ **UX**: Seamless switching without re-login
✅ **Enterprise Ready**: Supports complex organizational structures
✅ **Scalable**: Easy to add new organizations and users 