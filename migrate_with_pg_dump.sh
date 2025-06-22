#!/bin/bash

# Data Migration Script using PostgreSQL tools
# This script uses pg_dump to export data from local Docker and psql to import to Render

echo "🚀 Starting data migration using PostgreSQL tools"
echo "=================================================="

# Local PostgreSQL (Docker) Configuration
LOCAL_HOST="localhost"
LOCAL_PORT="5432"
LOCAL_DB="statio"
LOCAL_USER="postgres"
LOCAL_PASSWORD="postgres"

# Render Database Configuration
# Update these with your actual Render database credentials
RENDER_HOST="YOUR_RENDER_DB_HOST"  # e.g., 'dpg-xxx-a.oregon-postgres.render.com'
RENDER_PORT="5432"
RENDER_DB="YOUR_RENDER_DB_NAME"  # e.g., 'statio_db'
RENDER_USER="YOUR_RENDER_DB_USER"  # e.g., 'statio_user'
RENDER_PASSWORD="YOUR_RENDER_DB_PASSWORD"  # Your actual password

# Check if credentials are updated
if [ "$RENDER_HOST" = "YOUR_RENDER_DB_HOST" ]; then
    echo "❌ Please update the RENDER_* variables with your actual Render database credentials."
    echo ""
    echo "To get your Render database credentials:"
    echo "1. Go to your Render dashboard"
    echo "2. Click on your PostgreSQL service"
    echo "3. Go to the 'Connections' tab"
    echo "4. Copy the connection details"
    echo ""
    echo "Then update the variables in this script and run it again."
    exit 1
fi

# Function to check if PostgreSQL tools are available
check_pg_tools() {
    if ! command -v pg_dump &> /dev/null; then
        echo "❌ pg_dump not found. Please install PostgreSQL client tools."
        echo "On macOS: brew install postgresql"
        echo "On Ubuntu: sudo apt-get install postgresql-client"
        exit 1
    fi
    
    if ! command -v psql &> /dev/null; then
        echo "❌ psql not found. Please install PostgreSQL client tools."
        echo "On macOS: brew install postgresql"
        echo "On Ubuntu: sudo apt-get install postgresql-client"
        exit 1
    fi
    
    echo "✅ PostgreSQL tools found"
}

# Function to test database connections
test_connections() {
    echo "🔍 Testing database connections..."
    
    # Test local connection
    if PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB -c "SELECT version();" &> /dev/null; then
        echo "✅ Local PostgreSQL connection successful"
    else
        echo "❌ Local PostgreSQL connection failed. Make sure Docker container is running."
        exit 1
    fi
    
    # Test Render connection
    if PGPASSWORD=$RENDER_PASSWORD psql -h $RENDER_HOST -p $RENDER_PORT -U $RENDER_USER -d $RENDER_DB -c "SELECT version();" &> /dev/null; then
        echo "✅ Render database connection successful"
    else
        echo "❌ Render database connection failed. Check your credentials."
        exit 1
    fi
}

# Function to create backup
create_backup() {
    echo "📦 Creating backup of local database..."
    
    BACKUP_FILE="statio_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    PGPASSWORD=$LOCAL_PASSWORD pg_dump \
        -h $LOCAL_HOST \
        -p $LOCAL_PORT \
        -U $LOCAL_USER \
        -d $LOCAL_DB \
        --clean \
        --if-exists \
        --create \
        --no-owner \
        --no-privileges \
        --verbose \
        -f $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup created: $BACKUP_FILE"
        echo "📊 Backup size: $(du -h $BACKUP_FILE | cut -f1)"
    else
        echo "❌ Backup failed"
        exit 1
    fi
}

# Function to restore to Render
restore_to_render() {
    echo "🔄 Restoring data to Render database..."
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    # First, drop and recreate the database to ensure clean state
    echo "🧹 Cleaning Render database..."
    PGPASSWORD=$RENDER_PASSWORD psql -h $RENDER_HOST -p $RENDER_PORT -U $RENDER_USER -d postgres -c "DROP DATABASE IF EXISTS $RENDER_DB;"
    PGPASSWORD=$RENDER_PASSWORD psql -h $RENDER_HOST -p $RENDER_PORT -U $RENDER_USER -d postgres -c "CREATE DATABASE $RENDER_DB;"
    
    # Restore the backup
    echo "📥 Restoring data..."
    PGPASSWORD=$RENDER_PASSWORD psql \
        -h $RENDER_HOST \
        -p $RENDER_PORT \
        -U $RENDER_USER \
        -d $RENDER_DB \
        -f $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        echo "✅ Data restored successfully to Render database"
    else
        echo "❌ Data restoration failed"
        exit 1
    fi
}

# Function to verify migration
verify_migration() {
    echo "🔍 Verifying migration..."
    
    # Get table counts from local database
    echo "📊 Local database table counts:"
    PGPASSWORD=$LOCAL_PASSWORD psql -h $LOCAL_HOST -p $LOCAL_PORT -U $LOCAL_USER -d $LOCAL_DB -c "
        SELECT schemaname, relname, n_tup_ins as row_count 
        FROM pg_stat_user_tables 
        ORDER BY relname;
    "
    
    echo ""
    echo "📊 Render database table counts:"
    PGPASSWORD=$RENDER_PASSWORD psql -h $RENDER_HOST -p $RENDER_PORT -U $RENDER_USER -d $RENDER_DB -c "
        SELECT schemaname, relname, n_tup_ins as row_count 
        FROM pg_stat_user_tables 
        ORDER BY relname;
    "
}

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up backup file..."
    if [ -f "$BACKUP_FILE" ]; then
        rm $BACKUP_FILE
        echo "✅ Backup file removed"
    fi
}

# Main execution
main() {
    check_pg_tools
    test_connections
    create_backup
    restore_to_render
    verify_migration
    cleanup
    
    echo ""
    echo "🎉 Migration completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your application's environment variables to use Render database"
    echo "2. Test your application with the new database"
    echo "3. Once confirmed working, you can stop your local Docker container"
    echo ""
    echo "🔗 Your Render database is now ready at:"
    echo "   Host: $RENDER_HOST"
    echo "   Database: $RENDER_DB"
    echo "   User: $RENDER_USER"
}

# Run main function
main 