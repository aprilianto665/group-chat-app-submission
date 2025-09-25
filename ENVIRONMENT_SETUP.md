# Environment Setup Guide

This guide will help you configure all the necessary environment variables and external services for the Binder Group Chat Application.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### 1. Database Configuration

```env
# Database Connection URLs
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"
```

**Setup Instructions:**

Choose one of the following database options:

**Option A: Local PostgreSQL**

1. Install PostgreSQL on your system
2. Create a new database
3. Update connection strings with your credentials

**Option B: Cloud PostgreSQL Services**

- [Supabase](https://supabase.com/) - Free tier available
- [Railway](https://railway.app/) - Free tier available
- [Neon](https://neon.tech/) - Free tier available
- [Azure Database for PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql)
- [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/)

**Option C: Docker PostgreSQL**

```bash
docker run --name postgres-groupchat \
  -e POSTGRES_DB=groupchat \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### 2. NextAuth Configuration

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here
```

**Setup Instructions:**

1. For development, use `http://localhost:3000`
2. Generate a secure secret key:
   ```bash
   openssl rand -base64 32
   ```

### 3. Pusher Configuration (Real-time Features)

```env
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
```

**Setup Instructions:**

1. Go to [Pusher Dashboard](https://dashboard.pusher.com/)
2. Create a new app or use an existing one
3. Copy the credentials from the "App Keys" section
4. Choose a cluster closest to your users

### 4. Azure Storage Configuration (File Uploads)

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your-account;AccountKey=your-key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=avatars
```

**Setup Instructions:**

1. Create an Azure Storage Account
2. Create a container named `avatars` (or update the variable)
3. Get the connection string from "Access keys" section
4. Ensure the container allows public read access for avatars

## Complete .env.local Example

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Pusher (Real-time)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster

# File Storage (Choose one)
# Option 1: Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your-account;AccountKey=your-key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=avatars

# Option 2: AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name

# Option 3: Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Service Setup Guides

### Database Setup

**Option 1: Local PostgreSQL**

```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb groupchat

# Enable citext extension (if needed)
psql groupchat -c "CREATE EXTENSION IF NOT EXISTS citext;"
```

**Option 2: Docker PostgreSQL**

```bash
docker run --name postgres-groupchat \
  -e POSTGRES_DB=groupchat \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Enable citext extension
docker exec -it postgres-groupchat psql -U username -d groupchat -c "CREATE EXTENSION IF NOT EXISTS citext;"
```

**Option 3: Cloud PostgreSQL Services**

- [Supabase](https://supabase.com/) - Free tier, supports citext
- [Railway](https://railway.app/) - Free tier available
- [Neon](https://neon.tech/) - Free tier, supports citext
- [Azure Database for PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql) - Limited extensions
- [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/) - Full PostgreSQL support

**Note:** Some cloud providers may not support all PostgreSQL extensions. If you encounter `citext` errors, consider using application-level case-insensitive handling or choose a provider that supports the extension.

### Pusher Setup

1. Go to [Pusher Dashboard](https://dashboard.pusher.com/)
2. Click "Create app"
3. Choose a name and cluster
4. Select "React" as the front-end tech
5. Copy the credentials to your `.env.local`

### File Storage Setup

**Option 1: Azure Storage**

1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a new Storage Account
3. Go to "Containers" and create a new container named `avatars`
4. Set the access level to "Blob (anonymous read access for blobs only)"
5. Go to "Access keys" and copy the connection string

**Option 2: AWS S3**

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create an S3 bucket
3. Configure bucket permissions for public read access
4. Create IAM user with S3 access
5. Copy access key and secret key

**Option 3: Cloudinary**

1. Go to [Cloudinary Dashboard](https://cloudinary.com/)
2. Create a new account or use existing
3. Copy cloud name, API key, and API secret from dashboard

## Verification Steps

After setting up all services, verify your configuration:

1. **Database Connection:**

   ```bash
   npm run prisma:db:push
   ```

2. **Pusher Connection:**

   - Start the app and check browser console for Pusher connection logs

3. **Azure Storage:**
   - Try uploading an avatar image in the app

## Troubleshooting

### Database Issues

- Ensure PostgreSQL is running (for local setup)
- Check connection string format
- Verify database exists
- For `citext` errors: Enable extension or use application-level case-insensitive handling

### Pusher Issues

- Check app credentials in Pusher dashboard
- Verify cluster region matches your location
- Check browser console for connection errors

### File Storage Issues

- Verify connection string/credentials format
- Check bucket/container permissions
- Ensure bucket/container name matches environment variable
- For AWS S3: Verify IAM permissions and region settings

## Production Deployment

For production deployment, update these variables:

```env
# Production database
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/prod_db"

# Production URL
NEXTAUTH_URL=https://your-domain.com

# Production Pusher (recommended to use separate app)
PUSHER_APP_ID=your-prod-pusher-app-id
PUSHER_KEY=your-prod-pusher-key
PUSHER_SECRET=your-prod-pusher-secret
PUSHER_CLUSTER=your-prod-pusher-cluster

# Production File Storage (choose one)
# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-prod-azure-storage-connection-string
AZURE_STORAGE_CONTAINER_NAME=prod-avatars

# AWS S3
AWS_ACCESS_KEY_ID=your-prod-access-key
AWS_SECRET_ACCESS_KEY=your-prod-secret-key
AWS_REGION=your-prod-region
AWS_S3_BUCKET=your-prod-bucket-name

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-prod-cloud-name
CLOUDINARY_API_KEY=your-prod-api-key
CLOUDINARY_API_SECRET=your-prod-api-secret
```

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Regularly rotate API keys and secrets
- Use environment-specific Pusher apps for better security
- Consider using Azure Key Vault for production secrets
