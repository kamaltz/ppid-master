# PPID Garut - Unified Next.js Application

Aplikasi PPID Garut yang menggabungkan backend dan frontend dalam satu project Next.js untuk kemudahan konfigurasi dan deployment.

## Struktur Project

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API Routes (menggantikan Express server)
│   │   └── ...             # Frontend pages
│   ├── components/         # React components
│   ├── context/           # React contexts
│   └── hooks/             # Custom hooks
├── lib/                   # Backend logic
│   ├── controllers/       # API controllers
│   ├── middleware/        # Express middleware (adapted for Next.js)
│   ├── routes/           # Route definitions (reference)
│   ├── scripts/          # Database scripts
│   └── types/            # TypeScript types
└── public/               # Static assets
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure environment variables in `.env.local`

4. Run development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run seed` - Seed database users
- `npm run reset-admin` - Reset admin password

## API Endpoints

All API endpoints are now available under `/api/` prefix:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/informasi` - Get public information
- `POST /api/informasi` - Create information (PPID only)
- And more...

## Migration from Separate Projects

This project combines the previous `ppid-backend` and `ppid-frontend` projects:

- Backend Express routes → Next.js API Routes (`src/app/api/`)
- Backend controllers → Reused in API routes (`lib/controllers/`)
- Frontend pages → Next.js App Router (`src/app/`)
- Shared configuration and dependencies

## Benefits

- Single deployment
- Unified configuration
- Better development experience
- Simplified environment management
- Built-in API and frontend optimization