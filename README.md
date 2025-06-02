# Statio - Advanced Service Status Dashboard

A comprehensive service status dashboard with real-time monitoring, uptime analytics, and incident management. Built with FastAPI and React for modern, scalable infrastructure monitoring.

## ✨ Features

### 🚀 Core Functionality
- **Real-time Service Monitoring** - Live status updates and health checks
- **Comprehensive Uptime Analytics** - Detailed metrics with interactive charts
- **Incident Management** - Create, track, and resolve service incidents
- **Maintenance Scheduling** - Plan and communicate scheduled maintenance
- **Multi-period Analytics** - 24h, 7d, 30d, and 90d time range analysis

### 📊 Analytics & Monitoring
- **Interactive Uptime Charts** - Powered by Recharts with SLA reference lines
- **Performance Metrics** - Response time tracking and trend analysis
- **Service Overview Dashboard** - Color-coded performance cards with trend indicators
- **Detailed Service Pages** - Individual service metrics with KPI cards
- **SLA Compliance Tracking** - 99.9%, 99%, and 95% target monitoring

### 🎨 User Experience
- **Modern Glass Morphism UI** - Contemporary design with backdrop blur effects
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Dark/Light Theme Support** - Consistent styling across all components
- **Real-time Updates** - Live data without page refreshes
- **Intuitive Navigation** - Clean, organized interface structure

### 🔐 Security & Access
- **JWT Authentication** - Secure token-based authentication
- **Role-based Authorization** - Viewer, Manager, and Admin roles
- **Organization Isolation** - Multi-tenant architecture support
- **API Security** - Protected endpoints with proper validation

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - Python SQL toolkit and Object-Relational Mapping
- **PostgreSQL** - Advanced open source relational database
- **Alembic** - Database migration tool for SQLAlchemy
- **Pydantic** - Data validation using Python type annotations
- **JWT** - JSON Web Token for secure authentication
- **Uvicorn** - Lightning-fast ASGI server

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Next generation frontend build tool
- **Recharts** - Composable charting library for React
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Date-fns** - Modern JavaScript date utility library

### Key Components
- **UptimeChart** - Interactive charts with uptime/response time toggle
- **UptimeOverview** - Service grid with performance indicators
- **Analytics Dashboard** - Comprehensive metrics and KPI tracking
- **ServiceUptimePage** - Detailed individual service monitoring

## 📋 Prerequisites

- **Python 3.9+** - Backend runtime
- **Node.js 18+** - Frontend development and build
- **PostgreSQL 12+** - Database server
- **Docker** (optional) - For containerized database setup

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/statio.git
cd statio
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment configuration
cp .env.example .env
# Edit .env file with your database credentials and settings
```

### 3. Database Setup
```bash
# Option 1: Using Docker (recommended)
docker-compose up -d postgres

# Option 2: Local PostgreSQL
# Create database: createdb statio
# Update DATABASE_URL in .env file

# Run migrations
alembic upgrade head

# Optional: Seed with sample data
python scripts/seed_data.py
```

### 4. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Install additional analytics dependencies
npm install recharts date-fns
```

## 💻 Development

### Start Backend Server
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

### Access the Application
- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API Explorer**: http://localhost:8000/redoc

## 📊 Application Structure

### Backend API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Current user info

#### Services
- `GET /api/v1/services` - List all services
- `POST /api/v1/services` - Create new service
- `GET /api/v1/services/{id}` - Get service details
- `PUT /api/v1/services/{id}` - Update service
- `DELETE /api/v1/services/{id}` - Delete service

#### Uptime Analytics
- `GET /api/v1/uptime/overview` - All services overview
- `GET /api/v1/uptime/services/{id}/metrics` - Service metrics by period
- `POST /api/v1/uptime/services/{id}/record-metric` - Record uptime data

#### Incidents
- `GET /api/v1/incidents` - List incidents
- `POST /api/v1/incidents` - Create incident
- `PUT /api/v1/incidents/{id}` - Update incident
- `DELETE /api/v1/incidents/{id}` - Delete incident

### Frontend Pages & Components

#### Main Pages
- **Dashboard** (`/`) - Quick overview with summary cards and recent activity
- **Analytics** (`/analytics`) - Comprehensive uptime metrics and charts
- **Services** (`/services`) - Service management and configuration
- **Service Uptime** (`/services/{id}/uptime`) - Detailed service metrics
- **Incidents** (`/incidents`) - Incident management interface
- **Maintenance** (`/maintenance`) - Maintenance scheduling

#### Key Components
- **UptimeChart** - Interactive charts with period selection and SLA lines
- **UptimeOverview** - Service grid with color-coded performance cards
- **Dashboard** - Modern overview with glass morphism design
- **ServiceUptimePage** - Detailed metrics with KPI cards and comparisons

## 🧪 Testing

### Backend Testing
```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_uptime.py -v
```

### Frontend Testing
```bash
cd frontend

# Run component tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Configuration

### Backend Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/statio

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Optional: External monitoring
PROMETHEUS_ENABLED=true
SENTRY_DSN=your-sentry-dsn
```

### Frontend Configuration
The frontend uses Vite configuration in `vite.config.ts`:
- Development server proxy to backend
- Build optimization settings
- TypeScript configuration

## 📈 Features in Detail

### Uptime Monitoring System
- **Multi-period Analysis**: 24 hours, 7 days, 30 days, 90 days
- **Real-time Charts**: Interactive visualizations with Recharts
- **SLA Tracking**: 99.9%, 99%, and 95% reference lines
- **Response Time Metrics**: Average response time monitoring
- **Incident Correlation**: Link incidents to uptime data

### Analytics Dashboard
- **8 Enhanced KPI Cards**: System metrics with trend indicators
- **Performance Overview**: Health status and compliance tracking
- **Service Grid**: Color-coded performance indicators
- **Mock Data Support**: Graceful fallback when API unavailable

### Modern UI Design
- **Glass Morphism**: Semi-transparent backgrounds with backdrop blur
- **Consistent Styling**: Inline styles instead of CSS frameworks
- **Responsive Grids**: Auto-fit layouts for all screen sizes
- **Smooth Animations**: Hover effects and transitions

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head

# Frontend
cd frontend
npm run build
npm run preview  # Test production build
```

### Docker Deployment
```bash
# Full stack deployment
docker-compose up -d

# Or individual services
docker-compose up -d postgres
docker-compose up -d backend
docker-compose up -d frontend
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use inline styles for consistency
- Add proper error handling and fallback data
- Ensure responsive design
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [Recharts Documentation](https://recharts.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Built with ❤️ using modern web technologies for reliable service monitoring.**
