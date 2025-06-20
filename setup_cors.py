#!/usr/bin/env python
"""
Post-deployment script to update CORS settings
Run this after both backend and frontend are deployed
"""

import os
import sys

def update_cors_settings():
    """Update CORS settings in the backend configuration."""
    
    # Get the frontend URL from environment or construct it
    frontend_url = os.getenv('FRONTEND_URL', 'https://statio-frontend.onrender.com')
    
    print(f"Updating CORS settings to allow: {frontend_url}")
    
    # Update the config file
    config_file = "backend/app/core/config.py"
    
    try:
        with open(config_file, 'r') as f:
            content = f.read()
        
        # Replace the CORS origins
        old_cors = 'BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"]'
        new_cors = f'BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "{frontend_url}"]'
        
        if old_cors in content:
            content = content.replace(old_cors, new_cors)
            
            with open(config_file, 'w') as f:
                f.write(content)
            
            print("✅ CORS settings updated successfully")
        else:
            print("⚠️  CORS settings not found in config file")
            
    except Exception as e:
        print(f"❌ Error updating CORS settings: {e}")

if __name__ == "__main__":
    update_cors_settings() 