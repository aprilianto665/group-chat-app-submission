# Binder - Group Chat Application

A modern, real-time group chat application built with Next.js 15, featuring collaborative note-taking, space management, and real-time messaging powered by Pusher.

## 🚀 Features

### Core Features

- **Real-time Messaging**: Instant messaging with Pusher WebSocket integration
- **Space Management**: Create and manage multiple chat spaces
- **User Authentication**: Secure login/register with NextAuth.js and bcrypt
- **Collaborative Notes**: Rich text editor with todo lists and drag-and-drop reordering
- **Member Management**: Role-based access control (Admin/Member)
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Technical Features

- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Server Actions**: Modern Next.js server-side data mutations
- **Real-time Updates**: Live updates for messages, notes, and member activities
- **File Upload**: Azure Blob Storage integration for avatar uploads
- **Form Validation**: Comprehensive validation with Zod schemas

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with credentials provider
- **Real-time**: Pusher WebSocket
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

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/binder_db"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Pusher Configuration (for real-time features)
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster

# Azure Storage (for file uploads)
AZURE_STORAGE_CONNECTION_STRING=your-azure-storage-connection-string
AZURE_STORAGE_CONTAINER_NAME=avatars
```

### 4. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:db:push

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

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
- **Notes**: Create collaborative documents with rich text and todo lists
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
2. **Pusher**: Broadcast real-time updates to connected clients
3. **Prisma**: Type-safe database operations
4. **Zod**: Runtime validation for all inputs

## 🔒 Security Features

- **Password Hashing**: bcrypt-ts for secure password storage
- **Input Validation**: Comprehensive validation with Zod schemas
- **Authentication**: NextAuth.js with JWT sessions
- **Authorization**: Role-based access control
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🚀 Deployment

### Environment Variables for Production

Ensure all environment variables are properly configured in your production environment:

```env
DATABASE_URL=your-production-database-url
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
AZURE_STORAGE_CONNECTION_STRING=your-azure-storage-connection-string
```

### Build and Deploy

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in `/docs` folder
- Review the code comments for implementation details

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
