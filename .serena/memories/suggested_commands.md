# Suggested Commands

## Frontend Development (from front/listly-ease/)
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run build:dev       # Build for development
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Install dependencies
npm install
```

## Backend Development (from waitlist-backend/)
```bash
# Development  
npm run start:dev       # Start NestJS in development mode
npm run build          # Build the application
npm run start          # Start production build
npm test               # Run tests
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Install dependencies
npm install
```

## Task Completion Commands
After making code changes, always run:
1. `npm run lint` (in respective directory)
2. `npm run build` (to check for type errors)
3. For backend: `npm test` (if tests exist)