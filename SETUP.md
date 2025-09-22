# Setup Instructions

## Environment Variables

Buat file `.env.local` di root project dengan konten berikut:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL="file:./dev.db"
```

## Database Setup

1. Generate Prisma Client:

```bash
npx prisma generate
```

2. Push schema ke database:

```bash
npx prisma db push
```

## Running the Application

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Buka http://localhost:3000/auth/register untuk test fitur register

## Features

- ✅ User registration dengan validasi
- ✅ Password hashing menggunakan bcrypt-ts
- ✅ Database integration dengan Prisma
- ✅ NextAuth setup (untuk login nanti)
- ✅ Form validation dan error handling
- ✅ Responsive UI

## API Endpoints

- `POST /api/auth/[...nextauth]` - NextAuth endpoints

Pendaftaran akun kini menggunakan Server Actions (`app/actions/register.ts`), bukan endpoint REST terpisah.

## Database Schema

- **User**: id, email, username, name, password, avatar, timestamps
- **Space**: id, name, description, timestamps
- **Message**: id, content, spaceId, userId, timestamps
