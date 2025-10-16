# Spin Lucky - Multiplayer Slot Machine Game

## Overview

Spin Lucky is a real-time multiplayer slot machine game built with a modern web stack. Players can join games, place bets, spin virtual slot machines, and compete on a live leaderboard. The application features real-time updates via WebSockets, allowing players to see each other's spins and wins as they happen. The game uses a casino-themed visual design with vibrant colors, celebratory animations, and instant feedback for an engaging gaming experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Components**: The application uses shadcn/ui components built on Radix UI primitives. This provides a comprehensive set of accessible, customizable components following the "new-york" style variant.

**Styling**: Tailwind CSS with a custom design system defined in the configuration. The color palette is optimized for a casino gaming aesthetic with dark mode as primary, featuring emerald green primary colors, gold accents for wins, and carefully calibrated contrast ratios.

**Typography**: Custom font stack including:
- Display/Numbers: Bebas Neue or Rajdhani for bold casino-style text
- UI Text: Inter or Roboto for clean readability
- Decorative: Cinzel for branding
- Fonts are loaded from Google Fonts via the HTML head

**State Management**: React hooks for local state, with TanStack Query (React Query) for server state management. The query client is configured with specific defaults to prevent unnecessary refetching.

**Routing**: Wouter for lightweight client-side routing. Currently implements a single main game route with a fallback 404 page.

**Real-time Communication**: WebSocket connection to the server for bidirectional real-time updates. The connection is established on component mount and handles game state synchronization, spin results, and leaderboard updates.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript support via tsx in development.

**WebSocket Server**: ws library integrated with the HTTP server to provide real-time communication on the `/ws` path. The server maintains active connections, broadcasts game events, and handles player join/leave events.

**Game Logic**: Pure functions for slot machine mechanics including:
- Symbol selection using weighted randomization (defined in SYMBOL_WEIGHTS)
- Payout calculations based on reel combinations
- Win amount computation relative to bet size

**Data Storage**: Currently using an in-memory storage implementation (`MemStorage` class) that maintains:
- User accounts (though not actively used in the current game flow)
- Active players with balances and statistics
- Spin history for the live feed
- Leaderboard rankings

**Session Management**: The architecture includes session middleware setup (connect-pg-simple) prepared for PostgreSQL-backed sessions, though the current implementation relies on in-memory storage.

**Build Process**: Two-stage build using Vite for the client bundle and esbuild for the server bundle, with separate development and production modes.

### Data Storage Solutions

**Current Implementation**: In-memory storage via the `MemStorage` class. This is suitable for development and demonstration but data is lost on server restart.

**Database Schema**: Drizzle ORM is configured with PostgreSQL dialect and includes schema definitions for users table. The schema includes:
- User authentication fields (username, password)
- Shared TypeScript types for game entities (Player, SpinResult, LeaderboardEntry, SlotSymbol)

**Migration Setup**: Drizzle Kit is configured to output migrations to the `./migrations` directory, with schema defined in `./shared/schema.ts`.

**Database Provider**: Configured to use Neon serverless PostgreSQL (@neondatabase/serverless), requiring a DATABASE_URL environment variable.

**Design Decision**: The application is architected to support database persistence but currently operates with in-memory storage. This allows for rapid development and testing while maintaining a clear migration path to persistent storage. The storage interface (`IStorage`) abstracts the implementation, making it straightforward to swap in a database-backed version.

### External Dependencies

**UI Component Libraries**:
- Radix UI primitives for accessible component foundations
- shadcn/ui as the component system
- Lucide React for iconography
- Framer Motion for celebration animations
- Embla Carousel for potential carousel features

**Data Management**:
- TanStack Query for server state synchronization
- React Hook Form with Zod resolvers for form validation (infrastructure in place)
- date-fns for date formatting

**Database & ORM**:
- Drizzle ORM for type-safe database queries
- Neon serverless PostgreSQL driver
- drizzle-zod for schema validation

**Development Tools**:
- Vite with React plugin for fast development and optimized builds
- TypeScript for type safety across the stack
- Tailwind CSS with PostCSS for styling
- Replit-specific plugins for error overlays and development banners

**Runtime**:
- WebSocket (ws) for real-time bidirectional communication
- Express for HTTP server and middleware
- nanoid for unique ID generation

**Design Pattern**: The application follows a monorepo structure with shared TypeScript types between client and server. Path aliases (@/, @shared, @assets) simplify imports and maintain clean separation of concerns. The build process handles both client and server compilation, with development mode using tsx for hot reloading and production using compiled JavaScript bundles.