# Deploying Statio to Render.com

This guide will help you deploy your Statio application to Render.com.

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Render.com account
3. Your application code should be in a public or private GitHub repository

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Connect to Render.com**:
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" and select "Blueprint"
   - Connect your GitHub account and select your repository
   - Render will automatically detect the `render.yaml` file and create all services

3. **Wait for deployment**:
   - Render will automatically create:
     - A PostgreSQL database service
     - A Python web service for your backend
     - A static site service for your frontend
   - The deployment process takes 5-10 minutes

### Option 2: Manual Deployment

If you prefer to deploy services manually:

#### 1. Create PostgreSQL Database

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Choose a name (e.g., "statio-postgres")
4. Select "Free" plan
5. Click "Create Database"
6. Note down the connection details

#### 2. Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `statio-backend`
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     cd backend && pip install -r requirements.txt && alembic upgrade head
     ```
   - **Start Command**: 
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

4. Add environment variables:
   - `POSTGRES_SERVER`: Your database host
   - `POSTGRES_USER`: Your database user
   - `POSTGRES_PASSWORD`: Your database password
   - `POSTGRES_DB`: Your database name
   - `SECRET_KEY`: Generate a secure random string
   - `BACKEND_CORS_ORIGINS`: Your frontend URL (e.g., `https://statio-frontend.onrender.com`)

#### 3. Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `statio-frontend`
   - **Build Command**: 
     ```bash
     cd frontend && npm install && npm run build
     ```
   - **Publish Directory**: `frontend/dist`

4. Add environment variable:
   - `VITE_API_URL`: Your backend URL (e.g., `https://statio-backend.onrender.com`)

## Environment Variables

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_SERVER` | Database host | `dpg-xxx-a.oregon-postgres.render.com` |
| `POSTGRES_USER` | Database username | `statio_user` |
| `POSTGRES_PASSWORD` | Database password | `your_password` |
| `POSTGRES_DB` | Database name | `statio_db` |
| `SECRET_KEY` | JWT secret key | `your-secret-key-here` |
| `BACKEND_CORS_ORIGINS` | Allowed CORS origins | `https://statio-frontend.onrender.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://statio-backend.onrender.com` |

## Post-Deployment

1. **Test your application**:
   - Visit your frontend URL
   - Test the public status page
   - Try logging in with admin credentials

2. **Set up initial admin user**:
   - The first user to register will automatically become a superuser
   - Or you can create an admin user through the API

3. **Monitor your services**:
   - Check the logs in Render Dashboard
   - Monitor database connections
   - Set up alerts if needed

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check if database environment variables are correct
   - Ensure database is running and accessible
   - Check database logs in Render Dashboard

2. **CORS errors**:
   - Verify `BACKEND_CORS_ORIGINS` includes your frontend URL
   - Check browser console for CORS error details

3. **Build failures**:
   - Check build logs in Render Dashboard
   - Ensure all dependencies are in `requirements.txt` and `package.json`
   - Verify file paths in build commands

4. **Migration errors**:
   - Check if Alembic is properly configured
   - Verify database schema matches your models

### Getting Help

- Check Render's [documentation](https://render.com/docs)
- Review your service logs in Render Dashboard
- Check your application logs for specific error messages

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **Database**: Use strong passwords and restrict access
3. **CORS**: Only allow necessary origins
4. **HTTPS**: Render provides SSL certificates automatically
5. **Secrets**: Use Render's secret management for sensitive data

## Scaling

- **Free Plan**: Good for development and small applications
- **Paid Plans**: Available for production workloads with better performance
- **Auto-scaling**: Available on paid plans for handling traffic spikes

## Monitoring

- **Logs**: Available in Render Dashboard for each service
- **Metrics**: Basic metrics available on paid plans
- **Alerts**: Set up alerts for service health and performance 