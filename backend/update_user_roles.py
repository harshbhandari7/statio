#!/usr/bin/env python
"""
Script to update user roles for testing role-based access control.
"""
import sys
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import UserModel, UserRole

def update_user_roles():
    """Update existing users with admin and manager roles."""
    db = SessionLocal()
    try:
        # Find existing users
        users = db.query(UserModel).all()
        
        if not users:
            print("No users found in the database.")
            return
        
        # Update the first user to admin and set is_superuser=True
        admin_user = users[0]
        admin_user.role = UserRole.ADMIN
        admin_user.is_superuser = True
        db.add(admin_user)
        
        # If we have a second user, update to manager
        if len(users) > 1:
            manager_user = users[1]
            manager_user.role = UserRole.MANAGER
            manager_user.is_superuser = False
            db.add(manager_user)
        else:
            # Create a new manager user if we don't have a second user
            manager_user = UserModel(
                email="manager@statio.com",
                hashed_password="$2b$12$RlRxMX9EvJdJx1L3tjXKJuRVjFXWk.Nc1SrLhJwx5XjBVsq3qSKSC",  # manager123
                full_name="Statio Manager",
                is_active=True,
                is_superuser=False,
                role=UserRole.MANAGER
            )
            db.add(manager_user)
        
        # Create a viewer user with a different password hash
        viewer_user = UserModel(
            email="viewer@statio.com",
            hashed_password="$2b$12$QzSB0ZRGPRNhV2JxOTOqAu.3UD6LbLgO4MhZ8Z3XYhRnNvuFG6Z9e",  # viewer123
            full_name="Statio Viewer",
            is_active=True,
            is_superuser=False,
            role=UserRole.VIEWER
        )
        db.add(viewer_user)
            
        # Commit the changes
        db.commit()
        
        # Print the updated users
        updated_users = db.query(UserModel).all()
        print("\nUpdated Users:")
        for user in updated_users:
            print(f"ID: {user.id}, Email: {user.email}, Name: {user.full_name}, Role: {user.role}, Superuser: {user.is_superuser}")
            
    except Exception as e:
        print(f"Error updating user roles: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_user_roles()
