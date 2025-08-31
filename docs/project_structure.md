# Project Structure - AI Mentions Platform

## Root Directory Structure

```
aimentions-masterbranch/
├── app/                          # Next.js 15 App Router
├── components/                   # React components and UI
├── lib/                         # Utility libraries and services
├── prisma/                      # Database schema and migrations
├── public/                      # Static assets and files
├── scripts/                     # Database and deployment scripts
├── styles/                      # Global styles and CSS
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
├── docs/                        # Project documentation
├── .env.local                   # Local environment variables
├── package.json                 # Dependencies and scripts
├── tailwind.config.ts           # Tailwind CSS configuration
├── next.config.mjs              # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── render.yaml                  # Render deployment configuration
```

## Detailed Structure

### `/app` - Next.js App Router
```
app/
├── api/                         # API route handlers
│   ├── auth/                    # Authentication endpoints
│   │   ├── [...nextauth]/       # NextAuth.js configuration
│   │   ├── debug/               # Auth debugging
│   │   └── register/            # User registration
│   ├── competitive/             # Competitive analysis
│   ├── content/                 # Content strategy
│   ├── gemini/                  # Google Gemini AI integration
│   ├── keywords/                # Keyword analysis
│   ├── mentions/                # Mention tracking system
│   ├── openai/                  # OpenAI integration
│   ├── perplexity/              # Perplexity AI integration
│   ├── setup-database/          # Database initialization
│   ├── stripe/                  # Payment processing
│   ├── subscriptions/           # Subscription management
│   ├── topics/                  # Topic tracking
│   └── tracking/                # Automated tracking
├── account/                     # User account management
├── auth/                        # Authentication pages
├── dashboard/                   # Main dashboard
├── keyword-research/            # AI keyword research tool
├── mention-tracking/            # Mention tracking interface
├── pricing/                     # Pricing and plans
├── globals.css                  # Global styles
├── layout.tsx                   # Root layout component
├── loading.tsx                  # Loading states
├── page.tsx                     # Home page
└── providers.tsx                # Context providers
```

### `/components` - React Components
```
components/
├── ui/                          # shadcn/ui base components
│   ├── accordion.tsx            # Collapsible content
│   ├── alert-dialog.tsx         # Confirmation dialogs
│   ├── avatar.tsx               # User avatars
│   ├── badge.tsx                # Status indicators
│   ├── button.tsx               # Button components
│   ├── card.tsx                 # Content containers
│   ├── dialog.tsx               # Modal dialogs
│   ├── dropdown-menu.tsx        # Dropdown menus
│   ├── form.tsx                 # Form components
│   ├── input.tsx                # Input fields
│   ├── label.tsx                # Form labels
│   ├── progress.tsx             # Progress indicators
│   ├── select.tsx               # Selection dropdowns
│   ├── separator.tsx            # Visual dividers
│   ├── table.tsx                # Data tables
│   ├── tabs.tsx                 # Tabbed interfaces
│   ├── textarea.tsx             # Multi-line inputs
│   ├── toast.tsx                # Notification system
│   └── use-toast.ts             # Toast utilities
├── enhanced-mention-tracking.tsx # Main mention tracking component
├── account-dropdown.tsx         # User account menu
├── add-keyword-modal.tsx        # Keyword addition modal
├── add-mention-modal.tsx        # Mention addition modal
├── ai-query-insights.tsx        # AI query analysis
├── auth-modal.tsx               # Authentication modal
├── brand-tracking.tsx           # Brand monitoring
├── charts.tsx                   # Data visualization
├── competitive-intelligence.tsx # Competitive analysis
├── content-strategy.tsx         # Content strategy tools
├── edit-project-modal.tsx       # Project editing
├── mention-chart.tsx            # Mention analytics
├── project-modal.tsx            # Project management
├── project-selection-modal.tsx  # Project selection
├── subscription-dashboard.tsx   # Subscription management
├── theme-provider.tsx           # Theme context
├── topic-tracking.tsx           # Topic monitoring
└── trend-analysis.tsx           # Trend analysis
```

### `/lib` - Utility Libraries and Services
```
lib/
├── ai-scanning.ts               # AI platform scanning service
├── ai-tracking.ts               # Brand mention tracking
├── auth.ts                      # Authentication utilities
├── dataseo.ts                   # DataForSEO API integration
├── openai.ts                    # OpenAI API client
├── perplexity.ts                # Perplexity AI client
├── prisma.ts                    # Database client
├── stripe.ts                    # Stripe payment integration
└── utils.ts                     # General utilities
```

### `/prisma` - Database Management
```
prisma/
├── schema.prisma                # Database schema definition
└── migrations/                  # Database migration files
```

### `/public` - Static Assets
```
public/
├── development-plan.md           # Development documentation
├── placeholder-logo.png         # Default logo
├── placeholder-logo.svg         # SVG logo version
├── placeholder-user.jpg         # Default user avatar
├── placeholder.jpg              # Generic placeholder
└── placeholder.svg              # SVG placeholder
```

### `/scripts` - Automation Scripts
```
scripts/
├── deploy-render.sh             # Render deployment script
├── migrate.js                   # Database migration script
└── setup-db.js                  # Database setup script
```

### `/styles` - Global Styling
```
styles/
└── globals.css                  # Global CSS styles
```

### `/hooks` - Custom React Hooks
```
hooks/
├── use-mobile.ts                # Mobile detection hook
└── use-toast.ts                 # Toast notification hook
```

### `/types` - TypeScript Definitions
```
types/
└── next-auth.d.ts               # NextAuth.js type extensions
```

### `/docs` - Project Documentation
```
docs/
├── project_structure.md          # This file
├── Implementation.md             # Implementation plan
├── UI_UX_doc.md                 # UI/UX specifications
├── dataforseo-api.md            # DataForSEO API documentation
├── DATABASE_SETUP.md            # Database setup guide
├── OAUTH_SETUP.md               # OAuth configuration
├── PROGRESS_REPORT.md           # Development progress
├── RENDER_DEPLOYMENT.md         # Deployment guide
├── SETUP_GUIDE.md               # Setup instructions
└── STRIPE_SETUP.md              # Payment setup
```

## Configuration Files

### **Build and Development**
- `package.json` - Dependencies, scripts, and project metadata
- `pnpm-lock.yaml` - Exact dependency versions
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration

### **Environment and Deployment**
- `.env.local` - Local environment variables (not committed)
- `production.env.example` - Production environment template
- `render.yaml` - Render cloud deployment configuration
- `.gitignore` - Git ignore patterns

## File Naming Conventions

### **Components**
- **PascalCase** for React components: `EnhancedMentionTracking.tsx`
- **kebab-case** for component files: `enhanced-mention-tracking.tsx`
- **Descriptive names** that indicate functionality

### **Utilities and Services**
- **camelCase** for utility functions: `aiScanning.ts`
- **Descriptive names** that indicate purpose
- **Service suffix** for API clients: `openai.ts`, `perplexity.ts`

### **Configuration Files**
- **Standard naming** for config files: `next.config.mjs`, `tailwind.config.ts`
- **Environment-specific** naming: `.env.local`, `production.env.example`

## Module Organization Patterns

### **Feature-Based Organization**
- **AI Tools**: `keyword-research/`, `mention-tracking/`
- **Authentication**: `auth/`, `account/`
- **Management**: `dashboard/`, `pricing/`

### **Component Hierarchy**
- **Base Components**: `ui/` - Reusable, generic components
- **Feature Components**: Feature-specific, business logic components
- **Layout Components**: `layout.tsx`, `providers.tsx`

### **Service Layer**
- **API Clients**: `lib/openai.ts`, `lib/perplexity.ts`
- **Business Logic**: `lib/ai-scanning.ts`, `lib/ai-tracking.ts`
- **Utilities**: `lib/utils.ts`, `lib/auth.ts`

## Build and Deployment Structure

### **Development**
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run linting
```

### **Database Operations**
```bash
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run database migrations
pnpm db:deploy    # Deploy database schema
```

### **Production (Render)**
```bash
pnpm install --frozen-lockfile  # Install dependencies
pnpm run db:deploy              # Deploy database schema
pnpm run build                  # Build application
pnpm run start                  # Start production server
```

## Environment-Specific Configurations

### **Local Development**
- `.env.local` - Local API keys and database URLs
- `pnpm dev` - Development server with hot reloading
- Local PostgreSQL database or connection

### **Production (Render)**
- Environment variables set in Render dashboard
- PostgreSQL database hosted on Render
- Automated builds and deployments
- Production-optimized builds

## Asset Organization

### **Images and Media**
- **Placeholder images** in `/public` for development
- **User avatars** generated dynamically or stored in database
- **Logos and branding** in `/public` directory

### **Styles and CSS**
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components for consistent design
- **Global styles** in `app/globals.css`
- **Component-specific styles** co-located with components

### **Icons and UI Elements**
- **Lucide React** for consistent iconography
- **Radix UI** primitives for accessible components
- **Custom components** built on top of base primitives

## Documentation Placement

### **Technical Documentation**
- **Implementation plans** in `/docs/Implementation.md`
- **Project structure** in `/docs/project_structure.md`
- **UI/UX specifications** in `/docs/UI_UX_doc.md`

### **Setup and Configuration**
- **Database setup** in `/docs/DATABASE_SETUP.md`
- **OAuth configuration** in `/docs/OAUTH_SETUP.md`
- **Deployment guides** in `/docs/RENDER_DEPLOYMENT.md`

### **Progress Tracking**
- **Development progress** in `/PROGRESS_REPORT.md`
- **Current status** and roadmap updates
- **Feature completion** tracking and milestones
