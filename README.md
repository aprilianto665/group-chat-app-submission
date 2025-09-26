# Binder - Group Chat Application

A modern, real-time group chat application built with Next.js 15, featuring collaborative note-taking, space management, and real-time messaging powered by Pusher.

## 🚀 Features

### Core Features

- **Real-time Messaging**: Instant messaging with Pusher WebSocket integration
- **Space Management**: Create and manage multiple chat spaces
- **User Authentication**: Secure login/register with NextAuth.js and bcrypt
- **Collaborative Notes (Real-time)**: Rich text/heading/todo blocks with drag-and-drop ordering, instantly synced across members via Pusher
- **Member Management**: Role-based access control (Admin/Member)

### Technical Features

- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Server Actions**: Modern Next.js server-side data mutations
- **Real-time Updates**: Live updates for messages, notes, and member activities
- **Drag-and-Drop (DnD)**: Reordering for note blocks and todo items
- **File Upload**: Azure Blob Storage integration for avatar uploads
- **Form Validation**: Comprehensive validation with Zod schemas

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with credentials provider
- **Real-time**: Pusher WebSocket
- **Drag-and-Drop**: @dnd-kit (core, sortable)
- **File Storage**: Azure Blob Storage
- **State Management**: Zustand
- **Validation**: Zod
- **UI Components**: Custom component library with atomic design

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Pusher account (for real-time features)
- Azure Storage account (for file uploads)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd group-chat-app-submission
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

#### Required Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Pusher Configuration (Real-time Features)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster

# Azure Storage Configuration (File Uploads)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your-account;AccountKey=your-key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=avatars
```

#### Database Setup Options

**Option A: Local PostgreSQL**

```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb groupchat

# Enable citext extension (if needed)
psql groupchat -c "CREATE EXTENSION IF NOT EXISTS citext;"
```

**Option B: Docker PostgreSQL**

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

**Option C: Cloud PostgreSQL Services**

- [Supabase](https://supabase.com/) - Free tier, supports citext
- [Railway](https://railway.app/) - Free tier available
- [Neon](https://neon.tech/) - Free tier, supports citext
- [Azure Database for PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql)
- [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/)

#### Service Setup Guides

**Pusher Setup:**

1. Go to [Pusher Dashboard](https://dashboard.pusher.com/)
2. Click "Create app"
3. Choose a name and cluster
4. Select "React" as the front-end tech
5. Copy the credentials to your `.env.local`

**Azure Storage Setup:**

1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a new Storage Account
3. Go to "Containers" and create a new container named `avatars`
4. Set the access level to "Blob (anonymous read access for blobs only)"
5. Go to "Access keys" and copy the connection string

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

**Note:** If you encounter `citext` extension errors, you may need to:

- Enable the extension in your database: `CREATE EXTENSION IF NOT EXISTS citext;`
- Or modify the schema to use `@db.VarChar` instead of `@db.Citext`

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 6. Verification Steps

After setting up all services, verify your configuration:

1. **Database Connection:**

   ```bash
   npm run prisma:db:push
   ```

2. **Pusher Connection:**

   - Start the app and check browser console for Pusher connection logs

3. **File Storage:**
   - Try uploading an avatar image in the app

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── auth/              # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React Components (Atomic Design)
│   ├── atoms/             # Basic UI components
│   ├── molecules/         # Composite components
│   └── organisms/         # Complex components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── prisma/               # Database schema and migrations
├── stores/               # Zustand state stores
├── types/                # TypeScript type definitions
└── utils/                # Helper functions and utilities
```

## 🎯 Usage

### Getting Started

1. **Register**: Visit `/auth/register` to create a new account
2. **Login**: Use `/auth/login` to sign in
3. **Create Space**: Click "Create Space" to start a new chat room
4. **Invite Members**: Share space links or invite users by email
5. **Start Chatting**: Send messages and collaborate on notes

### Key Features

- **Spaces**: Organize conversations into different spaces
- **Notes (Real-time)**: Collaborative editor for text/headings/todo lists with drag-and-drop reordering. Edits are broadcast in real-time to all members in the space.
- **Real-time**: See messages and updates instantly
- **Member Roles**: Admins can manage space settings and members

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:db:push  # Push schema changes to database
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
```

## 🏛️ Architecture

### Component Architecture

The application follows **Atomic Design** principles:

- **Atoms**: Basic UI elements (Button, Input, Avatar)
- **Molecules**: Simple combinations (FormField, MessageBubble)
- **Organisms**: Complex components (ChatArea, SpaceManager)

### State Management

- **Zustand**: Global state management for user profile
- **React State**: Local component state for UI interactions
- **Server State**: Managed through Server Actions and real-time updates

### Data Flow

1. **Server Actions**: Handle data mutations and business logic
2. **Pusher**: Broadcast real-time updates to connected clients (notes emit `note:created`, `note:updated`, `note:deleted` on channel `space-<spaceId>`)
3. **Prisma**: Type-safe database operations
4. **Zod**: Runtime validation for all inputs

## 🔒 Security Features

- **Password Hashing**: bcrypt-ts for secure password storage
- **Input Validation**: Comprehensive validation with Zod schemas
- **Authentication**: NextAuth.js with JWT sessions
- **Authorization**: Role-based access control
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🔧 Troubleshooting

### Database Issues

- Ensure PostgreSQL is running (for local setup)
- Check connection string format
- Verify database exists
- For `citext` errors: Enable extension or use application-level case-insensitive handling

### Pusher Issues

- Check app credentials in Pusher dashboard
- Verify cluster region matches your location
- Check browser console for connection errors

### File Storage Issues (Azure)

- Verify connection string format
- Check container permissions
- Ensure container name matches `AZURE_STORAGE_CONTAINER_NAME`

## 🚀 Deployment

### Environment Variables for Production

For production deployment, update these variables:

```env
# Production database
DATABASE_URL="postgresql://prod_user:prod_password@prod_host:5432/prod_db"
DIRECT_URL="postgresql://prod_user:prod_password@prod_host:5432/prod_db"

# Production URL
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-key

# Production Pusher (recommended to use separate app)
PUSHER_APP_ID=your-prod-pusher-app-id
PUSHER_KEY=your-prod-pusher-key
PUSHER_SECRET=your-prod-pusher-secret
PUSHER_CLUSTER=your-prod-pusher-cluster

# Production File Storage (Azure)
AZURE_STORAGE_CONNECTION_STRING=your-prod-azure-storage-connection-string
AZURE_STORAGE_CONTAINER_NAME=prod-avatars
```

### Build and Deploy

```bash
npm run build
npm run start
```

### Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Regularly rotate API keys and secrets
- Use environment-specific Pusher apps for better security
- Consider using Azure Key Vault for production secrets
