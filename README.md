# Future - Modern Authentication Platform

A comprehensive Next.js application with **Google OAuth**, **RBAC (Role-Based Access Control)**, **session management**, and **auto-refresh capabilities**.

**Domain:** [future.lssgoo.com](https://future.lssgoo.com)

## 🚀 Features

- ✅ **OAuth Authentication** - Google OAuth with automatic user provisioning
- ✅ **RBAC System** - Role-based access control (USER & ADMIN roles)
- ✅ **Session Management** - Automatic session refresh and token management
- ✅ **User Management** - Complete user management with audit logs
- ✅ **RESTful API** - Following `/api/v1/[area]/[sub-area]` pattern
- ✅ **TypeScript** - Fully typed with Zod validation
- ✅ **Prisma ORM** - Database schema with migrations
- ✅ **shadcn/ui** - Beautiful UI components with custom color palette
- ✅ **Sonner Toasts** - Toast notifications for user feedback
- ✅ **Middleware** - Route protection and authentication checks

## 🎨 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL + Prisma
- **UI:** shadcn/ui + Tailwind CSS v4
- **Validation:** Zod
- **Notifications:** Sonner

## 📁 Project Structure

```
src/
├── app/
│   ├── api/v1/
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   ├── signout/
│   │   │   ├── session/
│   │   │   ├── refresh/
│   │   │   ├── google/
│   │   │   └── callback/
│   │   ├── users/             # User management
│   │   │   ├── me/
│   │   │   └── [id]/
│   │   └── admin/             # Admin endpoints
│   │       └── users/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/                  # Auth components
│   │   ├── AuthForm.tsx
│   │   ├── LoginButton.tsx
│   │   ├── UserMenu.tsx
│   │   └── ProtectedRoute.tsx
│   └── ui/                    # shadcn/ui components
├── hooks/
│   ├── useAuth.ts             # Authentication hook
│   └── useSession.ts          # Session management hook
├── services/
│   └── auth.service.ts        # Auth service layer
├── types/
│   ├── api.ts                 # API response types
│   ├── auth.ts                # Auth types
│   └── index.ts
├── utils/
│   └── supabase/              # Supabase utilities
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── lib/
│   ├── prisma.ts              # Prisma client
│   └── utils.ts               # shadcn/ui utils
└── middleware.ts              # Next.js middleware
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Supabase account

### 2. Clone and Install

```bash
cd future
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://future.lssgoo.com
DATABASE_URL="postgresql://user:password@host:5432/database"
SESSION_SECRET=your-secret-key-change-in-production
```

### 4. Configure Supabase

#### Enable Google OAuth in Supabase:

1. Go to **Authentication > Providers** in your Supabase dashboard
2. Enable **Google** provider
3. Add your Google OAuth credentials
4. Add redirect URL: `https://future.lssgoo.com/api/v1/auth/callback`

#### Create Database Tables:

Run the Prisma migration:

```bash
pnpm prisma generate
pnpm prisma db push
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Authentication

- `POST /api/v1/auth/signin` - Sign in with email/password
- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/signout` - Sign out
- `GET /api/v1/auth/session` - Get current session
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/callback` - OAuth callback

### Users

- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update current user
- `GET /api/v1/users/:id` - Get user by ID
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Admin

- `GET /api/v1/admin/users` - List all users (Admin only)
- `PATCH /api/v1/admin/users/:id/role` - Update user role (Admin only)

## 🎨 Color Palette

The application uses a custom OKLCH color palette:

```css
--primary: oklch(86.5% 0.127 207.078)
--secondary: oklch(86.9% 0.022 252.894)
--background: oklch(98.5% 0 0)
--foreground: oklch(37.1% 0 0)
--accent: oklch(97.7% 0.017 320.058)
```

## 🔐 RBAC (Role-Based Access Control)

### Roles

- **USER** - Default role with basic permissions
- **ADMIN** - Full access to all resources and admin panel

### Permissions

- Users can view and update their own profile
- Admins can:
  - View all users
  - Update user roles
  - Delete users
  - Access admin panel
  - View audit logs

## 🔄 Session Management

- Automatic session refresh every 5 minutes
- Token-based authentication with refresh tokens
- Secure session storage in PostgreSQL
- IP address and user agent tracking
- Session expiration handling

## 🧪 Type Safety

All API responses follow a consistent structure:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  message?: string;
  timestamp: string;
}
```

## 📦 Database Schema

```prisma
model User {
  id            String        @id @default(uuid())
  email         String        @unique
  name          String?
  avatarUrl     String?
  role          Role          @default(USER)
  authProvider  AuthProvider  @default(EMAIL)
  emailVerified Boolean       @default(false)
  authUserId    String        @unique
  sessions      Session[]
  auditLogs     AuditLog[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Session {
  id           String    @id @default(uuid())
  userId       String
  token        String    @unique
  refreshToken String?   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime  @default(now())
  user         User      @relation(fields: [userId], references: [id])
}

model AuditLog {
  id        String    @id @default(uuid())
  userId    String?
  action    String
  resource  String
  details   Json?
  createdAt DateTime  @default(now())
  user      User?     @relation(fields: [userId], references: [id])
}
```

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Database Migration

```bash
pnpm prisma migrate deploy
```

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 👨‍💻 Author

Built with ❤️ for **future.lssgoo.com**

---

**Note:** Make sure to update your `.env.local` file with actual credentials before running the application. Never commit sensitive credentials to version control.
