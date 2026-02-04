great# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview capabilities. It allows users to describe components in natural language and see them rendered in real-time. The application uses a virtual file system (no files written to disk) and leverages Claude AI for component generation.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma (SQLite), Anthropic Claude AI, Vercel AI SDK

## Important: Communication Style

**The user is a PM with limited developer skills.** When performing tasks:
- Explain what you're doing in simple, non-technical terms
- Explain why each action is important
- Avoid jargon where possible
- When technical terms are necessary, explain them clearly
- Break complex tasks into understandable steps

## Common Commands

### Development
```bash
npm run dev              # Start dev server with Turbopack
npm run dev:daemon       # Start dev server in background, logs to logs.txt
npm run build            # Build for production
npm run start            # Start production server
```

### Testing
```bash
npm test                 # Run tests with Vitest
```

### Database
```bash
npm run setup            # Install deps + generate Prisma client + run migrations
npx prisma generate      # Generate Prisma client (output: src/generated/prisma)
npx prisma migrate dev   # Run database migrations
npm run db:reset         # Reset database (force)
```

### Linting
```bash
npm run lint             # Run ESLint
```

### Security & Maintenance
```bash
npm audit                # Audit for vulnerabilities
npm audit fix            # Automatically fix vulnerabilities
npm outdated             # Check for outdated dependencies
npm update               # Update dependencies within semver ranges
```

## Project-Specific Tasks

When the user asks you to perform maintenance tasks, use these commands:

### "audit vulnerabilities" or "check security"
Run `npm audit` to check for security vulnerabilities in dependencies. If vulnerabilities are found, suggest running `npm audit fix` to automatically fix them, or `npm audit fix --force` for breaking changes (with user confirmation).

### "check outdated dependencies" or "update dependencies"
Run `npm outdated` to see which packages have newer versions. Explain what can be safely updated. For updates, run `npm update` for patch/minor updates within semver ranges.

### "run all tests" or "test everything"
Run `npm test` to execute the full Vitest test suite. The project has 238 tests covering components, utilities, and contexts.

### "build for production" or "create production build"
Run `npm run build` to create an optimized production build. Check for any build errors or warnings.

### "reset database" or "fresh database"
Run `npm run db:reset` to reset the SQLite database. This will delete all data and re-run migrations. Always confirm with the user before running this.

### "generate prisma client" or "update database schema"
Run `npx prisma generate` after schema changes to regenerate the Prisma client in `src/generated/prisma`.

## Architecture

### Virtual File System

The core of UIGen is a virtual file system (`src/lib/file-system.ts`) that operates entirely in memory:

- **VirtualFileSystem class:** Implements file/directory operations (create, read, update, delete, rename) without touching the actual filesystem
- **Serialization:** The VFS serializes to JSON for storage in the database (Project.data field)
- **Context:** `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) wraps the VFS and provides React hooks for component integration
- The VFS exposes text editor-like commands: `viewFile`, `createFileWithParents`, `replaceInFile`, `insertInFile`

### AI Integration

The AI chat endpoint (`src/app/api/chat/route.ts`) uses the Vercel AI SDK with two specialized tools:

1. **str_replace_editor** (`src/lib/tools/str-replace.ts`): Allows the AI to create files and edit them with string replacement or line insertion operations
2. **file_manager** (`src/lib/tools/file-manager.ts`): Allows the AI to rename/move and delete files

The system prompt is defined in `src/lib/prompts/generation.tsx` and instructs the AI on how to generate React components.

**Mock Mode:** If `ANTHROPIC_API_KEY` is not set, the app uses a mock provider (`src/lib/provider.ts`) that returns static placeholder code instead of calling Claude.

### Live Preview System

The preview system (`src/components/preview/PreviewFrame.tsx`) renders user components in an isolated iframe:

1. **JSX Transformation** (`src/lib/transform/jsx-transformer.ts`): Uses Babel Standalone to transform JSX/TSX to JavaScript at runtime
2. **Import Map Generation:** Creates ES Module import maps that:
   - Map third-party packages to esm.sh CDN URLs
   - Convert local file paths to blob URLs
   - Handle @/ path aliases (maps to root directory)
   - Support CSS imports (inline them into the preview)
3. **HTML Generation:** Constructs a complete HTML document with Tailwind CDN, error boundary, and the transformed code
4. **Syntax Error Display:** If transformation fails, shows formatted syntax errors in the preview instead of attempting to render

Entry points are auto-detected in this order: `/App.jsx`, `/App.tsx`, `/index.jsx`, `/index.tsx`, `/src/App.jsx`, `/src/App.tsx`

### Authentication & Persistence

- **JWT-based auth:** User sessions stored in cookies (`src/lib/auth.ts`)
- **Anonymous mode:** Users can work without signing up; their work is tracked via `anon-work-tracker.ts` but not persisted to database
- **Registered users:** Projects are saved to database automatically on AI response completion (messages + VFS state)
- **Prisma schema:** Custom output directory is `src/generated/prisma` (not the default `node_modules/.prisma`)

### State Management

Two primary React contexts manage application state:

1. **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`): Manages VFS operations, selected file, and tool call handling
2. **ChatContext** (`src/lib/contexts/chat-context.tsx`): Manages AI chat messages and streaming

Both contexts trigger re-renders via refresh triggers when their underlying data changes.

## Code Style

**Comments:** Use comments sparingly. Only comment complex code that isn't self-evident. Prefer clear naming and simple logic over explanatory comments.

## Key Patterns

### Path Normalization
The VFS normalizes all paths to start with `/` and handles relative paths, multiple slashes, and trailing slashes consistently.

### Tool Call Handling
When the AI uses tools during streaming, `FileSystemContext.handleToolCall` processes them immediately to update the VFS. This ensures the UI reflects changes as they happen.

### Project Loading
When loading a project from the database:
1. Messages are deserialized from JSON string
2. VFS data is deserialized using `deserializeFromNodes` which reconstructs the full tree structure
3. Both are passed to their respective contexts for initialization

### Testing
Tests use Vitest with jsdom environment. Test files are colocated in `__tests__` directories next to the code they test.

## Environment Variables

- `ANTHROPIC_API_KEY`: Optional. If not set, uses mock provider that returns static code
- `DATABASE_URL`: Set in prisma/schema.prisma (defaults to file:./dev.db)

## Path Aliases

- `@/*` maps to `src/*` (configured in tsconfig.json)
- In the VFS, `@/` is treated as an alias for the root directory `/`
