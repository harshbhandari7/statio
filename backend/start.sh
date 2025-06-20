#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting the application..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT 