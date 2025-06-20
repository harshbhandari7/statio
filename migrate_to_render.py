#!/usr/bin/env python
"""
Data Migration Script: Local PostgreSQL Docker → Render Database

This script migrates all data from your local PostgreSQL Docker container
to your Render database service.

Usage:
1. First, deploy your application to Render and get the database credentials
2. Update the RENDER_DB_* variables below with your Render database details
3. Run: python migrate_to_render.py

Prerequisites:
- Your local Docker PostgreSQL container must be running
- You must have the Render database credentials
- psycopg2-binary must be installed: pip install psycopg2-binary
"""

import psycopg2
import os
import sys
from datetime import datetime
import json

# Local PostgreSQL (Docker) Configuration
LOCAL_DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'statio',
    'user': 'postgres',
    'password': 'postgres'
}

# Render Database Configuration
# Update these with your actual Render database credentials
RENDER_DB_CONFIG = {
    'host': 'YOUR_RENDER_DB_HOST',  # e.g., 'dpg-xxx-a.oregon-postgres.render.com'
    'port': 5432,
    'database': 'YOUR_RENDER_DB_NAME',  # e.g., 'statio_db'
    'user': 'YOUR_RENDER_DB_USER',  # e.g., 'statio_user'
    'password': 'YOUR_RENDER_DB_PASSWORD'  # Your actual password
}

def test_connection(config, name):
    """Test database connection."""
    try:
        conn = psycopg2.connect(**config)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ {name} connection successful: {version[0]}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"❌ {name} connection failed: {e}")
        return False

def get_table_names(conn):
    """Get all table names from the database."""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    return tables

def get_table_data(conn, table_name):
    """Get all data from a table."""
    cursor = conn.cursor()
    
    # Get column names
    cursor.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '{table_name}' 
        ORDER BY ordinal_position;
    """)
    columns = cursor.fetchall()
    
    # Get all data
    cursor.execute(f"SELECT * FROM {table_name};")
    rows = cursor.fetchall()
    
    cursor.close()
    return columns, rows

def create_table_schema(conn, table_name, columns):
    """Create table schema in the target database."""
    cursor = conn.cursor()
    
    # Get the CREATE TABLE statement
    cursor.execute(f"""
        SELECT 
            'CREATE TABLE ' || quote_ident(tablename) || ' (' ||
            string_agg(
                quote_ident(attname) || ' ' || 
                format_type(atttypid, atttypmod) ||
                CASE 
                    WHEN attnotnull THEN ' NOT NULL'
                    ELSE ''
                END ||
                CASE 
                    WHEN atthasdef THEN ' DEFAULT ' || pg_get_expr(adbin, adrelid)
                    ELSE ''
                END,
                ', '
                ORDER BY attnum
            ) || ');'
        FROM pg_attribute
        JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        LEFT JOIN pg_attrdef ON pg_attribute.attrelid = pg_attrdef.adrelid 
            AND pg_attribute.attnum = pg_attrdef.adnum
        WHERE pg_class.relname = '{table_name}'
        AND pg_namespace.nspname = 'public'
        AND pg_attribute.attnum > 0
        AND NOT pg_attribute.attisdropped
        GROUP BY tablename;
    """)
    
    create_statement = cursor.fetchone()
    if create_statement:
        try:
            cursor.execute(create_statement[0])
            print(f"  ✅ Created table schema for {table_name}")
        except Exception as e:
            print(f"  ⚠️  Table {table_name} might already exist: {e}")
    
    cursor.close()

def insert_data(conn, table_name, columns, rows):
    """Insert data into the target table."""
    if not rows:
        print(f"  ℹ️  No data to insert for {table_name}")
        return
    
    cursor = conn.cursor()
    
    # Prepare column names for INSERT statement
    column_names = [col[0] for col in columns]
    placeholders = ', '.join(['%s'] * len(column_names))
    column_list = ', '.join(column_names)
    
    # Insert data in batches
    batch_size = 100
    total_rows = len(rows)
    
    for i in range(0, total_rows, batch_size):
        batch = rows[i:i + batch_size]
        try:
            cursor.executemany(
                f"INSERT INTO {table_name} ({column_list}) VALUES ({placeholders})",
                batch
            )
            print(f"  ✅ Inserted batch {i//batch_size + 1} ({len(batch)} rows) for {table_name}")
        except Exception as e:
            print(f"  ❌ Error inserting batch for {table_name}: {e}")
            # Try inserting row by row to identify problematic data
            for j, row in enumerate(batch):
                try:
                    cursor.execute(
                        f"INSERT INTO {table_name} ({column_list}) VALUES ({placeholders})",
                        [row]
                    )
                except Exception as row_error:
                    print(f"    ❌ Row {i + j + 1} error: {row_error}")
                    print(f"    Data: {row}")
    
    cursor.close()

def migrate_table(local_conn, render_conn, table_name):
    """Migrate a single table from local to Render database."""
    print(f"\n📋 Migrating table: {table_name}")
    
    try:
        # Get table data from local database
        columns, rows = get_table_data(local_conn, table_name)
        print(f"  📊 Found {len(rows)} rows in {table_name}")
        
        # Create table schema in Render database
        create_table_schema(render_conn, table_name, columns)
        
        # Insert data into Render database
        insert_data(render_conn, table_name, columns, rows)
        
        print(f"  ✅ Successfully migrated {table_name}")
        
    except Exception as e:
        print(f"  ❌ Error migrating {table_name}: {e}")

def main():
    """Main migration function."""
    print("🚀 Starting data migration from Local PostgreSQL to Render Database")
    print("=" * 70)
    
    # Test connections
    print("\n🔍 Testing database connections...")
    if not test_connection(LOCAL_DB_CONFIG, "Local PostgreSQL"):
        print("❌ Cannot connect to local database. Make sure Docker container is running.")
        return
    
    if not test_connection(RENDER_DB_CONFIG, "Render Database"):
        print("❌ Cannot connect to Render database. Check your credentials.")
        return
    
    # Connect to both databases
    try:
        local_conn = psycopg2.connect(**LOCAL_DB_CONFIG)
        render_conn = psycopg2.connect(**RENDER_DB_CONFIG)
    except Exception as e:
        print(f"❌ Error connecting to databases: {e}")
        return
    
    try:
        # Get all tables from local database
        tables = get_table_names(local_conn)
        print(f"\n📋 Found {len(tables)} tables to migrate: {', '.join(tables)}")
        
        # Migrate each table
        for table_name in tables:
            migrate_table(local_conn, render_conn, table_name)
        
        print("\n🎉 Migration completed successfully!")
        print("\n📝 Next steps:")
        print("1. Update your application's environment variables to use Render database")
        print("2. Test your application with the new database")
        print("3. Once confirmed working, you can stop your local Docker container")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        local_conn.close()
        render_conn.close()

if __name__ == "__main__":
    # Check if Render database config is still default
    if RENDER_DB_CONFIG['host'] == 'YOUR_RENDER_DB_HOST':
        print("❌ Please update the RENDER_DB_CONFIG variables with your actual Render database credentials.")
        print("\nTo get your Render database credentials:")
        print("1. Go to your Render dashboard")
        print("2. Click on your PostgreSQL service")
        print("3. Go to the 'Connections' tab")
        print("4. Copy the connection details")
        print("\nThen update the variables in this script and run it again.")
        sys.exit(1)
    
    main() 