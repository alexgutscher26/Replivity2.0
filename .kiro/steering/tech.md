# Technology Stack

## Web Platform (Main Application)

### Framework & Runtime
- **Next.js 16** with App Router architecture
- **React 18** with TypeScript 5.8
- **Node.js 18+** runtime environment
- **Turbo** for development acceleration

### Backend & Database
- **tRPC** for type-safe API layer
- **PostgreSQL 13+** as primary database
- **Drizzle ORM** for database operations and migrations
- **Better Auth** for authentication with 2FA support
- **TanStack Query** for client-side data management

### UI & Styling
- **Tailwind CSS 4** for styling
- **Radix UI** component primitives
- **shadcn/ui** component system (New York style)
- **Lucide React** for icons
- **Framer Motion** for animations

### AI Integration
- **Vercel AI SDK** for multi-provider support
- **OpenAI GPT-4** integration
- **Google Gemini** integration  
- **Mistral AI** integration
- **Anthropic Claude** integration

### Services & Integrations
- **Stripe & PayPal** for payments
- **Resend** for email services
- **UploadThing** for file uploads
- **AppSumo** integration for licensing

## Browser Extension

### Framework
- **WXT Framework** for cross-browser extension development
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **tRPC Chrome** for communication with web platform

### Build Targets
- Chrome (Manifest V3)
- Firefox
- Safari
- Edge
- Opera

## Development Commands

### Web Platform
```bash
# Development
bun run dev              # Start dev server with Turbo
bun run build           # Production build
bun run start           # Start production server
bun run preview         # Build and preview

# Database
bun run db:push         # Push schema changes
bun run db:migrate      # Run migrations
bun run db:studio       # Open Drizzle Studio
bun run db:generate     # Generate migrations
bun run db:optimize     # Run database optimization

# Code Quality
bun run lint            # Run ESLint
bun run lint:fix        # Fix ESLint issues
bun run typecheck       # TypeScript checking
bun run format:check    # Check Prettier formatting
bun run format:write    # Apply Prettier formatting
bun run check           # Run lint + typecheck

# Seeding
bun run seed:features   # Seed feature permissions
```

### Browser Extension
```bash
# Development
bun run dev             # Chrome development mode
bun run dev:firefox     # Firefox development mode

# Production
bun run build           # Build for Chrome
bun run build:firefox   # Build for Firefox
bun run zip             # Package for distribution
```

## Code Quality Tools

### Linting & Formatting
- **ESLint** with TypeScript rules and Drizzle plugin
- **Prettier** with Tailwind CSS plugin
- **TypeScript** strict mode enabled

### Key ESLint Rules
- Drizzle ORM safety (enforce WHERE clauses)
- TypeScript strict type checking
- Consistent import styles (type imports)
- Next.js best practices

## Environment Requirements

### Development
- Node.js 18+
- PostgreSQL 13+
- API keys for at least one AI provider
- Stripe/PayPal credentials for payment testing

### Production
- Vercel/similar hosting platform
- PostgreSQL database
- Redis for caching (recommended)
- CDN for static assets