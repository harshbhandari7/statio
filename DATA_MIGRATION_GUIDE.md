# Data Migration Guide: Local PostgreSQL → Render Database

This guide will help you migrate your data from your local PostgreSQL Docker container to your Render database service.

## Prerequisites

1. **Local PostgreSQL Docker container running**
2. **Render application deployed** with PostgreSQL service created
3. **PostgreSQL client tools installed** (for the shell script method)

## Method 1: Using PostgreSQL Tools (Recommended)

This method uses PostgreSQL's built-in `pg_dump` and `psql` tools, which is faster and more reliable.

### Step 1: Install PostgreSQL Client Tools

**On macOS:**
```bash
brew install postgresql
```

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

**On Windows:**
Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Step 2: Get Render Database Credentials

1. Go to your [Render Dashboard](https://dashboard.render.com)
2. Click on your PostgreSQL service (e.g., `statio-postgres`)
3. Go to the **Connections** tab
4. Copy the connection details:
   - **Host**: `dpg-xxx-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `statio_db`
   - **User**: `statio_user`
   - **Password**: Your actual password

### Step 3: Update Migration Script

Edit the `migrate_with_pg_dump.sh` file and update these variables:

```bash
RENDER_HOST="your-actual-render-host"
RENDER_DB="your-actual-database-name"
RENDER_USER="your-actual-username"
RENDER_PASSWORD="your-actual-password"
```

### Step 4: Run Migration

```bash
./migrate_with_pg_dump.sh
```

The script will:
- ✅ Test connections to both databases
- 📦 Create a backup of your local database
- 🔄 Restore the data to Render database
- 🔍 Verify the migration
- 🧹 Clean up temporary files

## Method 2: Using Python Script

This method uses a Python script that connects to both databases and migrates data table by table.

### Step 1: Install Dependencies

```bash
pip install psycopg2-binary
```

### Step 2: Get Render Database Credentials

Same as Method 1, get your Render database credentials.

### Step 3: Update Migration Script

Edit the `migrate_to_render.py` file and update the `RENDER_DB_CONFIG`:

```python
RENDER_DB_CONFIG = {
    'host': 'your-actual-render-host',
    'port': 5432,
    'database': 'your-actual-database-name',
    'user': 'your-actual-username',
    'password': 'your-actual-password'
}
```

### Step 4: Run Migration

```bash
python migrate_to_render.py
```

## Method 3: Manual Migration (Advanced)

If you prefer to do it manually or need more control:

### Step 1: Create Backup

```bash
# Create backup of local database
pg_dump -h localhost -p 5432 -U postgres -d statio --clean --if-exists --create --no-owner --no-privileges -f statio_backup.sql
```

### Step 2: Restore to Render

```bash
# Restore to Render database
psql -h YOUR_RENDER_HOST -p 5432 -U YOUR_RENDER_USER -d YOUR_RENDER_DB -f statio_backup.sql
```

## Verification

After migration, verify your data:

### Check Table Counts

```bash
# Local database
psql -h localhost -p 5432 -U postgres -d statio -c "SELECT schemaname, tablename, n_tup_ins as row_count FROM pg_stat_user_tables ORDER BY tablename;"

# Render database
psql -h YOUR_RENDER_HOST -p 5432 -U YOUR_RENDER_USER -d YOUR_RENDER_DB -c "SELECT schemaname, tablename, n_tup_ins as row_count FROM pg_stat_user_tables ORDER BY tablename;"
```

### Test Your Application

1. Update your application's environment variables to use Render database
2. Test all functionality
3. Verify data integrity

## Troubleshooting

### Common Issues

#### 1. Connection Errors

**Problem**: Cannot connect to local database
**Solution**: Make sure your Docker container is running
```bash
docker-compose up -d
```

**Problem**: Cannot connect to Render database
**Solution**: 
- Check your credentials
- Ensure your IP is whitelisted (if required)
- Verify the database service is running

#### 2. Permission Errors

**Problem**: Permission denied when creating tables
**Solution**: The migration scripts handle this automatically, but if doing manual migration:
```sql
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
```

#### 3. Data Type Issues

**Problem**: Some data types might not be compatible
**Solution**: The Python script handles this better as it migrates data row by row

#### 4. Large Database Issues

**Problem**: Timeout or memory issues with large databases
**Solution**: 
- Use the shell script method (faster for large databases)
- Consider migrating in chunks
- Increase timeout settings

### Error Messages and Solutions

| Error | Solution |
|-------|----------|
| `connection to server failed` | Check if Docker container is running |
| `authentication failed` | Verify username/password |
| `database does not exist` | Check database name |
| `permission denied` | Check user permissions |
| `timeout expired` | Increase timeout or use smaller batches |

## Post-Migration Steps

### 1. Update Application Configuration

Update your application's environment variables to use Render database:

```bash
# Backend environment variables
POSTGRES_SERVER=your-render-host
POSTGRES_USER=your-render-user
POSTGRES_PASSWORD=your-render-password
POSTGRES_DB=your-render-database
```

### 2. Test Thoroughly

- ✅ Test all API endpoints
- ✅ Verify user authentication
- ✅ Check data integrity
- ✅ Test all CRUD operations
- ✅ Verify relationships between tables

### 3. Monitor Performance

- Check Render dashboard for database performance
- Monitor connection usage
- Set up alerts if needed

### 4. Clean Up

Once everything is working:
- Stop your local Docker container
- Remove local backup files
- Update your development environment to use Render database

## Security Considerations

1. **Credentials**: Never commit database credentials to version control
2. **Backup**: Keep a copy of your local backup for safety
3. **Access Control**: Ensure only authorized users can access the database
4. **Encryption**: Render provides SSL encryption by default

## Rollback Plan

If something goes wrong:

1. **Keep your local Docker container running** until you're sure everything works
2. **Keep the backup file** created during migration
3. **Test thoroughly** before stopping local services
4. **Have a rollback script ready** if needed

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Render's [PostgreSQL documentation](https://render.com/docs/databases)
3. Check your application logs for specific errors
4. Verify database connectivity and permissions

## Migration Checklist

- [ ] Local Docker container is running
- [ ] Render application is deployed
- [ ] Render database credentials obtained
- [ ] Migration script updated with correct credentials
- [ ] Migration completed successfully
- [ ] Data verified in Render database
- [ ] Application tested with Render database
- [ ] Environment variables updated
- [ ] All functionality working correctly
- [ ] Local Docker container stopped (optional) 