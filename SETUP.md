# Setup Instructions

## Environment Variables

Create a `.env.local` file in the root project with the following content:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"
```

## Database Setup

1. Generate Prisma Client:

```bash
npx prisma generate
```

2. Push schema to database:

```bash
npx prisma db push
```

**Note:** If you encounter `citext` extension errors, you may need to:

- Enable the extension in your database: `CREATE EXTENSION IF NOT EXISTS citext;`
- Or modify the schema to use `@db.VarChar` instead of `@db.Citext`

## Running the Application

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open http://localhost:3000/auth/register to test the registration feature

## Features

- ✅ User registration with validation
- ✅ Password hashing using bcrypt-ts
- ✅ Database integration with Prisma
- ✅ NextAuth setup (for login)
- ✅ Form validation and error handling
- ✅ Responsive UI

## API Endpoints

- `POST /api/auth/[...nextauth]` - NextAuth endpoints

Account registration now uses Server Actions (`app/actions/register.ts`), not separate REST endpoints.

## Database Schema

- **User**: id, email, username, name, password, avatar, timestamps
- **Space**: id, name, description, timestamps
- **Message**: id, content, spaceId, userId, timestamps
