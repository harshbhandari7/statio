# Statio - Service Status Dashboard

A modern service status dashboard built with FastAPI and React.

## Features

- Real-time service status monitoring
- Incident management and updates
- WebSocket support for live updates
- User authentication and authorization
- Modern, responsive UI

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- WebSockets
- JWT Authentication

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite
- React Query
- WebSocket Client

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL
- Docker (optional)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/statio.git
cd statio
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Set up the database:
```bash
# Using Docker
docker-compose up -d

# Or using local PostgreSQL
# Create a database named 'statio'
```

5. Run migrations:
```bash
alembic upgrade head
```

6. Set up the frontend:
```bash
cd ../frontend
npm install
```

## Development

1. Start the backend server:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Code Quality

### Backend
```bash
cd backend
black .
isort .
flake8
mypy .
```

### Frontend
```bash
cd frontend
npm run lint
npm run type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
