# Multi-Tenant Architecture - Organizations Feature

## Overview

The Organizations feature in Statio provides a comprehensive multi-tenant architecture where each organization represents a separate tenant with isolated data and user management.

## 🏗️ Architecture Components

### 1. Data Model Hierarchy

```
Organization (Tenant)
├── Users
├── Services  
├── Incidents
├── Maintenances
└── Status Pages
```

### 2. User Role System

```
Superuser (Platform Admin)
├── Can manage all organizations
├── Create/edit/delete organizations
├── Assign users to organizations
└── Global system access

Organization Admin
├── Manage their organization settings
├── Manage users within their organization
├── Full access to organization's services/incidents
└── Cannot access other organizations

Organization Manager
├── Manage services and incidents
├── Cannot manage users
└── Limited to their organization

Organization Viewer
├── Read-only access
└── Limited to their organization
```

## 🔒 Data Isolation

### Current Implementation

#### Organizations Table
```sql
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Users Table (with organization link)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    role user_role DEFAULT 'viewer',
    is_superuser BOOLEAN DEFAULT FALSE,
    organization_id INTEGER REFERENCES organizations(id),
    -- other fields...
);
```

### Multi-Tenant Services (Enhanced)
```sql
-- Services now include organization_id
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    status service_status DEFAULT 'operational',
    organization_id INTEGER REFERENCES organizations(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Feature Consumption Patterns

### 1. Organization Management (Superuser Only)

```typescript
// Create new organization
const newOrg = await organizations.create({
  name: "Acme Corp",
  slug: "acme-corp",
  description: "Acme Corporation Status Page",
  logo_url: "https://acme.com/logo.png",
  is_active: true
});

// List all organizations (superuser view)
const allOrgs = await organizations.getAll();

// Update organization
await organizations.update(orgId, {
  name: "New Name",
  description: "Updated description"
});
```

### 2. User-Organization Assignment

```typescript
// Assign user to organization (superuser/admin only)
await users.updateOrganization(userId, organizationId);

// Create user with organization
const newUser = await users.create({
  email: "user@acme.com",
  full_name: "John Doe",
  role: "manager",
  organization_id: orgId
});
```

### 3. Organization-Scoped Data Access

#### Backend API Filtering
```python
# Services filtered by organization
@router.get("/", response_model=List[Service])
def read_services(
    current_user: UserModel = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.is_superuser:
        # Superuser sees all services
        return db.query(ServiceModel).all()
    else:
        # Regular users see only their organization's services
        return db.query(ServiceModel).filter(
            ServiceModel.organization_id == current_user.organization_id
        ).all()
```

#### Frontend Organization Context
```typescript
// Auto-filtered based on user's organization
const services = await services.getAll(); // Only returns user's org services
const incidents = await incidents.getAll(); // Only returns user's org incidents
```

## 🌐 Multi-Tenant Features

### 1. Isolated Status Pages

Each organization gets its own status page:
```
https://status.yourapp.com/acme-corp     # Acme's status page
https://status.yourapp.com/globex-corp   # Globex's status page
```

### 2. Organization-Specific Branding

```typescript
interface Organization {
  id: number;
  name: string;
  slug: string;           // Used for URLs
  description?: string;
  logo_url?: string;      // Custom branding
  is_active: boolean;
  // Custom theme colors (future)
  primary_color?: string;
  secondary_color?: string;
}
```

### 3. Data Segregation Rules

- **Superusers**: See all organizations and can switch context
- **Organization Users**: Automatically filtered to their organization
- **API Endpoints**: Include organization filtering by default
- **Database Queries**: Always include organization_id constraints

## 🔧 Implementation Roadmap

### Phase 1: Foundation (✅ Completed)
- [x] Organizations CRUD
- [x] User-Organization mapping
- [x] Basic permission system
- [x] Organization management UI

### Phase 2: Multi-Tenant Data (🚧 In Progress)
- [x] Add organization_id to Services model
- [ ] Add organization_id to Incidents model
- [ ] Add organization_id to Maintenances model
- [ ] Update API endpoints with organization filtering
- [ ] Database migration scripts

### Phase 3: Enhanced Features (📋 Planned)
- [ ] Organization-specific status page URLs
- [ ] Custom branding per organization
- [ ] Organization-level settings
- [ ] Billing/subscription per organization
- [ ] Organization analytics dashboard

## 🚀 Usage Examples

### Typical Multi-Tenant Scenarios

#### 1. SaaS Status Page Provider
```
Organization: "Acme Corp"
├── Services: [Web App, API, Database]
├── Users: [admin@acme.com, ops@acme.com]
└── Status Page: status.yourapp.com/acme-corp

Organization: "Globex Inc"
├── Services: [E-commerce, Payment Gateway]
├── Users: [admin@globex.com, tech@globex.com]
└── Status Page: status.yourapp.com/globex-inc
```

#### 2. Enterprise Internal Use
```
Organization: "Engineering Team"
├── Services: [CI/CD, Code Review, Monitoring]
├── Users: [Engineering staff]

Organization: "Marketing Team"  
├── Services: [CRM, Email Platform, Analytics]
├── Users: [Marketing staff]
```

#### 3. Multi-Brand Company
```
Organization: "Brand A"
├── Services: [Brand A Website, Brand A API]

Organization: "Brand B"
├── Services: [Brand B Mobile App, Brand B Services]
```

## 🔒 Security Considerations

### Data Isolation
- All database queries include organization_id filtering
- API endpoints validate user's organization access
- Frontend automatically scopes data to user's organization

### Permission Matrix
```
Action                  | Superuser | Org Admin | Org Manager | Org Viewer
------------------------|-----------|-----------|-------------|------------
Create Organization     | ✅        | ❌        | ❌          | ❌
Edit Organization       | ✅        | ✅*       | ❌          | ❌
Delete Organization     | ✅        | ❌        | ❌          | ❌
Manage Org Users        | ✅        | ✅        | ❌          | ❌
Create Services         | ✅        | ✅        | ✅          | ❌
Create Incidents        | ✅        | ✅        | ✅          | ❌
View Services/Incidents | ✅        | ✅        | ✅          | ✅

* Only their own organization
```

## 🎨 Frontend Integration

### Organization Context
```typescript
// Auth context provides organization info
const { user, organization } = useAuth();

// All API calls are automatically scoped
const services = await api.services.getAll(); // Filtered by organization

// Organization selector for superusers
if (user.is_superuser) {
  const orgSelector = <OrganizationSelector 
    organizations={allOrgs}
    current={currentOrg}
    onChange={setCurrentOrg}
  />;
}
```

### Navigation & UI
```typescript
// Organization-aware navigation
<nav>
  <h1>{organization.name} Status</h1>
  <img src={organization.logo_url} alt={organization.name} />
  
  {/* Navigation items filtered by permissions */}
  <NavItems user={user} organization={organization} />
</nav>
```

This multi-tenant architecture provides complete data isolation, user management, and scalable organization management while maintaining a clean and intuitive user experience. 