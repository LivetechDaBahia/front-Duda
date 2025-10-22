# Frontend V2

A fast, modern dashboard to visualize and manage Purchase Orders (POs). Built with Vite, React, TypeScript, Tailwind CSS, and the Radix/shadcn UI ecosystem. The app includes Kanban and Table views, rich filtering, and an order details panel with approve/decline actions.

- Tech stack: React 18, Vite 5, TypeScript, Tailwind CSS, Radix UI, shadcn/ui, TanStack Query, React Router, Zod, Recharts, Sonner, Lucide
- Localization: English (en), Portuguese Brazil (pt-BR), Spanish Spain (es-ES)
- API: Works with mock data by default and can connect to a real backend. See API_INTEGRATION.md

## Quick start

Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm 9+ (or use pnpm/yarn if you prefer)

1) Install dependencies

```bash
npm install
```

2) Configure environment

```bash
cp .env.example .env
# then edit .env to match your setup
```

Available variables (see .env.example):
- VITE_API_URL: Base URL of your backend API (default: http://localhost:3000/api)
- VITE_USE_MOCK_DATA: true to use mock data, false to call a real API
- VITE_BYPASS_AUTH: development helper to bypass auth flows (use with caution)

3) Start the app

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Scripts

- npm run dev: Start Vite dev server
- npm run build: Production build
- npm run build:dev: Development-optimized build (with --mode development)
- npm run preview: Preview the production build locally
- npm run lint: Lint the codebase with ESLint
- npm run format: Format the codebase with Prettier

## Features

- Dashboard with two modes: Kanban and Table
- Powerful filtering: search, status, branch, date range
- Order details side panel with approve/decline actions
- Pagination for large datasets
- Snackbar/toast notifications for actions and errors
- Responsive layout and dark mode ready (via next-themes)

## Tech highlights

- React 18 + TypeScript for robust UI development
- Vite 5 for lightning-fast dev and builds
- Tailwind CSS for utility-first styling (+ tailwind-merge, tailwindcss-animate)
- Radix UI primitives and shadcn/ui components
- TanStack Query for data fetching and caching
- React Router v6 for routing
- Zod for schema validation

## API integration

The app is designed to work with a real API or with mocked data during development. Read the full guide:

- API integration guide: ./API_INTEGRATION.md

Key points
- When VITE_USE_MOCK_DATA=true, the UI uses local mock data and does not call a backend
- To connect to a real API, set VITE_API_URL and VITE_USE_MOCK_DATA=false and restart the dev server
- Environment variables must be prefixed with VITE_ to be exposed to the client in Vite

## Project structure (high level)

```
po-flow-vista/
├─ src/
│  ├─ components/        # Reusable UI components (dashboard, navigation, ui)
│  ├─ contexts/          # React contexts (e.g., LocaleContext)
│  ├─ hooks/             # Custom hooks (e.g., useOrders)
│  ├─ lib/               # Utilities (e.g., status mapping)
│  ├─ pages/             # Route components (Index.tsx)
│  ├─ services/          # API services (e.g., orderService.ts)
│  └─ types/             # Shared TypeScript types
├─ public/               # Static assets
├─ index.html            # App entry HTML
├─ vite.config.ts        # Vite config
└─ tailwind.config.ts    # Tailwind config
```

## Development notes

- ESLint and Prettier are configured; run npm run lint and npm run format
- If you change environment variables, stop and restart the dev server
- Localization: The app supports en, pt-BR, and es-ES for user-facing messages

## Troubleshooting

- Blank screen or network errors:
  - Ensure VITE_API_URL is correct if VITE_USE_MOCK_DATA=false
  - Check browser console and network tab for failed requests
- Env variables not applied:
  - Variables must start with VITE_
  - Restart the dev server after changing .env
- Port already in use:
  - Change the dev server port in vite.config.ts or stop the other process

## License

No license file is provided in this repository. If you intend to use or distribute this project, please add an appropriate LICENSE file or contact the repository owner.
