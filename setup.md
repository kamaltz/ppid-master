# Setup Instructions

## 1. Install Dependencies
```bash
cd e:\app\sidogar-garut
npm install
```

## 2. Environment Setup
```bash
# Copy environment template
copy .env.local.example .env.local

# Edit .env.local with your actual values:
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_key
# JWT_SECRET=your_jwt_secret
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 3. Database Setup
```bash
# Seed users (if needed)
npm run seed

# Reset admin password (if needed)
npm run reset-admin
```

## 4. Run Development Server
```bash
npm run dev
```

## 5. Access Application
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

## Migration Notes

### What Changed:
- ✅ Combined backend and frontend into single Next.js project
- ✅ Express routes → Next.js API Routes
- ✅ Single port (3000) instead of separate ports
- ✅ Unified environment configuration
- ✅ Single deployment process

### File Structure:
- `src/app/` - Frontend pages (Next.js App Router)
- `src/app/api/` - API endpoints (replaces Express server)
- `lib/` - Backend logic (controllers, middleware, etc.)
- `src/components/` - React components
- `public/` - Static assets

### Benefits:
- Easier deployment
- Single configuration
- Better development experience
- Automatic API optimization
- Built-in TypeScript support