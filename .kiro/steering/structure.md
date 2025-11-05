# Project Structure & Organization

## Root Directory Layout

```
├── src/                          # Main application source
├── extension-v6.0.0/             # Browser extension (separate project)
├── drizzle/                      # Database schema and migrations
├── public/                       # Static assets
├── docs/                         # Project documentation
├── scripts/                      # Utility scripts
└── .kiro/                        # Kiro AI assistant configuration
```

## Main Application Structure (`src/`)

### App Router Architecture (`src/app/`)
```
src/app/
├── (frontend)/                   # Public marketing pages
├── (backend)/                    # Protected user dashboard
├── admin/                        # Admin panel routes
├── api/                          # API routes and webhooks
├── auth/                         # Authentication pages
├── _components/                  # App-level shared components
├── layout.tsx                    # Root layout
├── robots.ts                     # SEO robots configuration
└── sitemap.ts                    # SEO sitemap generation
```

### Component Organization (`src/components/`)
```
src/components/
├── ui/                           # shadcn/ui base components
├── auth/                         # Authentication-related components
├── blog/                         # Blog functionality components
├── performance/                  # Performance monitoring components
├── feature-access-guard.tsx      # Feature access control
└── server-feature-access-guard.tsx
```

### Server Architecture (`src/server/`)
```
src/server/
├── api/                          # tRPC routers and procedures
├── auth/                         # Authentication configuration
├── db/                           # Database connection and utilities
├── services/                     # Business logic services
└── utils/                        # Server-side utilities
```

### Supporting Directories
```
src/
├── hooks/                        # Custom React hooks
├── lib/                          # Shared utilities and configurations
├── trpc/                         # tRPC client configuration
├── types/                        # TypeScript type definitions
├── utils/                        # Client-side utilities
├── styles/                       # Global CSS and Tailwind
└── env.js                        # Environment variable validation
```

## Database Structure (`drizzle/`)

### Schema Organization
- **`schema.ts`**: Complete database schema with all tables
- **`relations.ts`**: Table relationships and foreign keys
- **Migration files**: Numbered SQL migration files
- **`meta/`**: Drizzle metadata and snapshots

### Key Database Tables
- `replier_user`: User accounts and profiles
- `replier_billing`: Subscription and payment data
- `replier_products`: Available plans and features
- `replier_generation`: AI response generation logs
- `replier_usage`: Feature usage tracking
- `replier_blog_*`: Blog system tables
- `replier_security_event`: Security audit logs

## Browser Extension Structure (`extension-v6.0.0/`)

### Extension Architecture
```
extension-v6.0.0/src/
├── entrypoints/                  # Extension entry points (popup, content, background)
├── components/                   # React components for extension UI
├── auth/                         # Authentication handling
├── hooks/                        # Extension-specific hooks
├── lib/                          # Extension utilities
├── locales/                      # Internationalization files
├── schemas/                      # Validation schemas
└── assets/                       # Extension assets and icons
```

## Configuration Files

### Root Level
- **`package.json`**: Main project dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration with path aliases
- **`next.config.js`**: Next.js configuration with optimizations
- **`drizzle.config.ts`**: Database configuration
- **`components.json`**: shadcn/ui configuration
- **`.eslintrc.cjs`**: ESLint rules with Drizzle plugin
- **`prettier.config.js`**: Code formatting configuration

### Path Aliases
```typescript
// Configured in tsconfig.json
"@/*": ["./src/*"]

// Available aliases from components.json
"@/components": "src/components"
"@/lib": "src/lib"
"@/utils": "src/lib/utils"
"@/ui": "src/components/ui"
"@/hooks": "src/hooks"
```

## Naming Conventions

### Files & Directories
- **kebab-case**: For file names (`user-profile.tsx`)
- **PascalCase**: For React components (`UserProfile.tsx`)
- **camelCase**: For utility functions and hooks
- **SCREAMING_SNAKE_CASE**: For environment variables

### Database
- **snake_case**: All table and column names
- **`replier_`** prefix: All table names for namespace isolation
- **Descriptive names**: Clear, self-documenting column names

### Code Organization
- **Feature-based**: Group related functionality together
- **Separation of concerns**: Clear boundaries between UI, business logic, and data
- **Reusable components**: Shared components in appropriate directories
- **Type safety**: Comprehensive TypeScript usage throughout

## Development Workflow

### File Creation Patterns
1. **Pages**: Create in appropriate `app/` directory with `page.tsx`
2. **Components**: Start in feature directory, move to shared if reused
3. **API Routes**: Use tRPC routers in `src/server/api/`
4. **Database Changes**: Generate migrations with `bun run db:generate`
5. **Types**: Define in `src/types/` for shared interfaces

### Import Organization
1. **External libraries** (React, Next.js, etc.)
2. **Internal utilities** (`@/lib`, `@/utils`)
3. **Components** (`@/components`)
4. **Types** (`@/types`)
5. **Relative imports** (same directory)