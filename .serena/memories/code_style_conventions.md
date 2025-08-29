# Code Style & Conventions

## TypeScript/React Standards
- **File naming**: PascalCase for components, camelCase for utilities
- **Component structure**: Functional components with TypeScript
- **Import order**: External libraries → Internal components → Utils/Types
- **Props typing**: Always use TypeScript interfaces
- **State management**: useState for local state, Context for shared state

## Code Patterns
- **API Services**: Class-based services in `/services/` directory
- **Error handling**: Try-catch blocks with proper error types  
- **UI Components**: ShadcN UI + custom styling with Tailwind
- **Routing**: React Router DOM with protected routes pattern
- **Forms**: React Hook Form + Zod validation

## Naming Conventions
- **Components**: PascalCase (e.g., `ServiceDetailPage`)
- **Hooks**: camelCase starting with 'use' (e.g., `useToast`)
- **Services**: camelCase with 'Service' suffix (e.g., `waitlistService`)
- **Types/Interfaces**: PascalCase (e.g., `WaitlistDetails`)

## File Structure
- Each page component in its own file
- Shared components in `/components/` with subdirectories
- Services grouped by domain (auth, waitlist, etc.)
- Types defined close to usage or in dedicated files