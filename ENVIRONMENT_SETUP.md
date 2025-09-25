# Environment Setup Guide

This guide will help you configure all the necessary environment variables and external services for the Binder Group Chat Application.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### 1. Database Configuration

```env
DATABASE_URL="postgresql://username:password@localhost:5432/binder_db"
```

**Setup Instructions:**

1. Install PostgreSQL on your system
2. Create a new database named `binder_db`
3. Update the connection string with your actual credentials

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
DATABASE_URL="postgresql://username:password@localhost:5432/binder_db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Pusher (Real-time)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster

# Azure Storage (File Uploads)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your-account;AccountKey=your-key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=avatars
```

## Service Setup Guides

### PostgreSQL Setup

**Option 1: Local Installation**

```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb binder_db
```

**Option 2: Docker**

```bash
docker run --name postgres-binder \
  -e POSTGRES_DB=binder_db \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

**Option 3: Cloud Services**

- [Supabase](https://supabase.com/) (Free tier available)
- [Railway](https://railway.app/) (Free tier available)
- [Neon](https://neon.tech/) (Free tier available)

### Pusher Setup

1. Go to [Pusher Dashboard](https://dashboard.pusher.com/)
2. Click "Create app"
3. Choose a name and cluster
4. Select "React" as the front-end tech
5. Copy the credentials to your `.env.local`

### Azure Storage Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a new Storage Account
3. Go to "Containers" and create a new container named `avatars`
4. Set the access level to "Blob (anonymous read access for blobs only)"
5. Go to "Access keys" and copy the connection string

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

- Ensure PostgreSQL is running
- Check connection string format
- Verify database exists

### Pusher Issues

- Check app credentials in Pusher dashboard
- Verify cluster region matches your location
- Check browser console for connection errors

### Azure Storage Issues

- Verify connection string format
- Check container permissions
- Ensure container name matches environment variable

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

# Production Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-prod-azure-storage-connection-string
AZURE_STORAGE_CONTAINER_NAME=prod-avatars
```

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Regularly rotate API keys and secrets
- Use environment-specific Pusher apps for better security
- Consider using Azure Key Vault for production secrets
