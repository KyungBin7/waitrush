# External Frontend Integration Epic - Cross-Project Connection

**Epic Title:** Lovable Frontend & Internal Backend Integration - Cross-Project API Connection

**Epic Goal:** Integrate two separately developed projects: the external Lovable-built React frontend (`front/listly-ease/`) with the internal NestJS backend (`waitlist-backend/`) to create a unified waitlist application with full end-to-end functionality.

## Current System State

**External Frontend Project** (`front/listly-ease/`):
- **Development Origin**: Built externally using Lovable platform/tooling
- **Current State**: Standalone React/TypeScript application (port 8080)
- **Functionality**: Complete UI with authentication, dashboard, waitlist joining forms
- **Data Source**: Currently uses mock data and simulated API responses
- **Technology Stack**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router
- **API Integration**: Placeholder API calls that need to connect to real backend
- **Status**: ✅ UI Complete, ❌ No real API integration

**Internal Backend Project** (`waitlist-backend/`):
- **Development Origin**: Built internally with BMad development process
- **Current State**: Complete NestJS infrastructure (port 3001)
- **Functionality**: Database connection, authentication framework, error handling, health endpoints
- **Data Storage**: MongoDB with proper connection and configuration
- **Technology Stack**: NestJS, TypeScript, MongoDB, Mongoose, JWT, validation
- **Epic History**: Foundation & Infrastructure Epic completed (Stories 1.1-1.5)
- **Status**: ✅ Infrastructure Complete, ❌ Missing business logic endpoints

## Integration Requirements

**Integration Challenge:**
Two independently developed projects need to be connected:
1. **Communication Gap**: Frontend has no way to communicate with backend
2. **API Contract Mismatch**: Frontend expects certain API structure, backend needs to provide it
3. **Authentication Flow**: Frontend auth forms need real JWT integration
4. **Data Persistence**: Frontend needs to replace mock data with real database operations
5. **Cross-Origin Configuration**: Two separate dev servers need proper CORS setup

**What's Being Integrated:**
- Lovable frontend project → Internal NestJS backend project
- Mock data responses → Real MongoDB data persistence
- Placeholder authentication → JWT-based real authentication system
- Standalone frontend → Full-stack integrated application

**Integration Architecture:**
- Frontend (`localhost:8080`) communicates with Backend (`localhost:3001`)
- API proxy configuration in Vite to route `/api/*` calls to backend
- CORS configuration in backend to accept requests from frontend origin
- Shared data contracts between frontend expectations and backend responses
- JWT token flow for authenticated organizer sessions

**Success Criteria:**
- ✅ Two separate projects work together as unified application
- ✅ Frontend completely replaces mock data with real backend responses
- ✅ Authentication flow works across both projects
- ✅ Waitlist creation and management functions end-to-end
- ✅ Public waitlist joining works with real data persistence
- ✅ Both projects can still be developed and deployed independently

## Story 2.1 Communication Setup

**Goal:** Establish communication bridge between external frontend and internal backend projects

**Scope:**
- Configure CORS in backend to accept requests from frontend origin (`localhost:8080`)
- Set up API proxy in frontend Vite config to route calls to backend (`localhost:3001`)
- Implement basic connectivity test endpoint and frontend test call
- Verify both projects can communicate while running independently
- Document the development workflow for running both projects together

**Acceptance Criteria:**
- Frontend can successfully make HTTP requests to backend
- CORS errors are resolved between the two projects
- Health check endpoint accessible from frontend via `/api/health`
- Both projects can be started independently and work together
- Development documentation updated for dual-project setup

## Story 2.2 Authentication Integration

**Goal:** Connect Lovable frontend authentication UI to internal backend JWT system

**Scope:**
- Implement authentication API endpoints in backend (`POST /auth/register`, `POST /auth/login`)
- Modify frontend authentication forms to call real backend APIs instead of mock responses
- Implement JWT token storage and management in frontend project
- Create protected route guards that verify JWT tokens with backend
- Handle authentication errors and validation feedback from backend

**Acceptance Criteria:**
- Frontend registration form creates real user accounts in backend database
- Login form authenticates against backend and receives real JWT tokens
- Frontend stores and manages JWT tokens for authenticated sessions
- Protected routes (dashboard) verify authentication with backend
- Authentication errors from backend display properly in frontend UI
- Users can register, login, and access dashboard across both projects

## Story 2.3 Waitlist Business Logic

**Goal:** Connect frontend waitlist functionality to backend data persistence and API

**Scope:**
- Implement waitlist CRUD API endpoints in backend
  - `POST /waitlists` - Create new waitlist
  - `GET /waitlists` - Get organizer's waitlists
  - `GET /waitlists/:id` - Get specific waitlist details
  - `PUT /waitlists/:id` - Update waitlist
  - `DELETE /waitlists/:id` - Delete waitlist
- Implement public waitlist endpoints for anonymous participation
  - `GET /public/waitlists/:slug` - Get public waitlist info
  - `POST /public/waitlists/:slug/join` - Join waitlist with email
- Connect frontend dashboard and waitlist pages to real backend APIs
- Replace all mock data in frontend with real API calls
- Implement participant management and CSV export functionality

**Acceptance Criteria:**
- Organizers can create and manage waitlists through frontend dashboard using real backend
- Waitlist data persists in backend MongoDB database
- Public waitlist pages load real data from backend by slug/ID
- Anonymous users can join waitlists, with data saved to backend database
- Participant counts and statistics reflect real database values
- CSV export downloads actual participant data from backend
- All mock data removed from frontend project
- Error handling works correctly between frontend and backend

## Technical Requirements

**Frontend Project Changes** (`front/listly-ease/`):
- **Vite Config**: Add proxy configuration to route `/api/*` to `http://localhost:3001`
- **API Calls**: Replace mock `fetch()` calls with real API endpoints
- **Environment Variables**: Add backend URL configuration for different environments
- **Token Management**: Implement JWT storage, retrieval, and automatic refresh
- **Error Handling**: Handle backend validation errors and display in UI

**Backend Project Changes** (`waitlist-backend/`):
- **CORS Configuration**: Accept requests from `http://localhost:8080` (frontend origin)
- **API Endpoints**: Implement missing business logic endpoints for waitlist functionality
- **Database Models**: Create User, Waitlist, and Participant entities in MongoDB
- **Authentication Middleware**: JWT verification for protected endpoints
- **Validation**: Input validation and error responses matching frontend expectations

**Development Workflow:**
1. **Dual Server Setup**: Both projects run simultaneously during development
2. **Independent Deployment**: Projects can be deployed separately to different servers
3. **Shared API Contract**: Documented API specification both projects follow
4. **Environment Configuration**: Different backend URLs for development/staging/production

## Compatibility Requirements

- ✅ **Project Independence**: Both projects remain independently developable and deployable
- ✅ **Existing Functionality**: Backend infrastructure (Stories 1.1-1.5) remains unchanged
- ✅ **Frontend UI**: No changes to Lovable-built UI components required
- ✅ **Database Schema**: Uses existing MongoDB connection and adds new collections
- ✅ **Technology Stacks**: No changes to React/Vite frontend or NestJS backend stacks

## Risk Management

**Primary Risk:** Integration complexity between two independently developed projects

**Mitigation Strategies:**
- **Phase 1**: Establish basic communication before implementing business logic
- **API Contract First**: Define and document API specification before implementation
- **Incremental Integration**: Connect one feature at a time (auth first, then waitlists)
- **Fallback Mechanism**: Frontend retains mock data capability during development
- **Independent Testing**: Each project maintains its own test suites

**Rollback Plan:**
- Frontend can revert to mock data mode if backend is unavailable
- Backend can be rolled back independently without affecting frontend development
- Projects remain separate, so issues in one don't break the other
- CORS and proxy configurations can be quickly disabled if needed

## Success Criteria

**Epic Completion Requirements:**
- ✅ Both projects communicate successfully in development environment
- ✅ Authentication flow works end-to-end across both projects
- ✅ All waitlist functionality uses real backend data instead of mock data
- ✅ Public waitlist joining works with database persistence
- ✅ Projects can be developed and deployed independently while working together
- ✅ API integration is documented for future development
- ✅ No regression in existing functionality of either project

**Validation Checklist:**
- Start both projects independently and verify full application functionality
- Register new user, login, create waitlist, test public joining - all should work
- Frontend completely operates with backend data (no mock data in production)
- Backend serves all required endpoints for frontend functionality
- Cross-origin requests work correctly between the projects
- Development workflow documented for future contributors

## Project Dependencies

**Prerequisites:**
- ✅ Backend Foundation & Infrastructure Epic completed (Stories 1.1-1.5)
- ✅ Frontend UI development completed via Lovable platform
- ✅ MongoDB database accessible and configured
- ✅ Both projects can run independently in development environment

**External Dependencies:**
- No external services required beyond existing MongoDB
- Both projects use existing technology stacks
- Integration relies only on HTTP communication between localhost ports

## Performance Metrics

**Integration Success:**
- 100% of frontend mock data replaced with real backend API calls
- Authentication success rate > 95% across both projects
- API response times < 300ms for good user experience
- Zero regression in existing backend infrastructure functionality
- Both projects maintainable and deployable independently

**User Experience:**
- Registration to dashboard workflow success rate > 95%
- Waitlist creation and management functions without errors
- Public waitlist joining conversion maintains current mock data levels
- Page load times remain acceptable with real API calls

## Story Manager Handoff

This integration epic connects two independently developed projects that need to work together. Key considerations for story development:

- **Project Separation**: Maintain independence of both projects while enabling integration
- **API Contract**: Define clear specifications that both projects follow
- **Incremental Approach**: Connect functionality step by step to minimize risk
- **Development Workflow**: Enable developers to work on both projects simultaneously
- **Rollback Capability**: Ensure either project can function if integration fails

The epic transforms two standalone projects into a unified application while preserving their independent development and deployment capabilities.