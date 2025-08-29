# Waitlist Backend System Implementation - Master Epic

## Epic Title
Minimal Waitlist Backend System - NestJS API Implementation

## Epic Goal
Implement a complete NestJS backend system for the Minimal Waitlist application that provides secure authentication for organizers, service management capabilities, public waitlist functionality, and seamless integration with the existing Lovable-built frontend.

## Epic Description

### Existing System Context:
- **Current State**: Fully functional React/TypeScript frontend built with Lovable
- **Frontend Stack**: React, TypeScript, Tailwind CSS, React Router, shadcn/ui components
- **Design Philosophy**: macOS-style aesthetic with attention to detail and user experience
- **API Contract**: RESTful JSON API with JWT authentication as documented
- **User Types**: 
  - Waitlist Providers (Organizers) - Require authentication
  - Waitlist Participants - Anonymous, email-only registration

### Enhancement Details:
- **What's being added**: Complete NestJS backend API system following enterprise patterns
- **Architecture Approach**: Modular NestJS architecture with separate Auth, Services, and Participants modules
- **Database**: MongoDB with Mongoose for flexible schema evolution
- **Success criteria**: 
  - All frontend features fully functional with real backend
  - Secure authentication for organizers
  - Scalable participant management
  - Data integrity and security maintained

## Sub-Epics and Story Groups

### 1. Foundation & Infrastructure Epic
**Goal**: Set up core NestJS backend infrastructure following best practices

**Stories**:
1. **NestJS Project Setup**: Initialize NestJS project with TypeScript, proper folder structure
2. **MongoDB Configuration**: Set up MongoDB connection with Mongoose integration
3. **Core Configuration**: Implement ConfigModule for environment variables
4. **Global Middleware**: Set up CORS, helmet, compression, and rate limiting
5. **Error Handling**: Implement global exception filters and validation pipes

### 2. Authentication Module Epic
**Goal**: Implement secure JWT-based authentication for organizers

**Stories**:
1. **Organizer Schema**: Create Mongoose schema with email and passwordHash
2. **Auth Service**: Implement signup, login, and token validation logic
3. **Password Security**: Implement bcrypt hashing with proper salt rounds
4. **JWT Strategy**: Configure Passport.js with JWT strategy for NestJS
5. **Auth Guards**: Create guards for protecting organizer-only routes
6. **Auth Endpoints**: Implement /auth/signup, /auth/login, /auth/me endpoints

### 3. Services Module Epic
**Goal**: Enable organizers to create and manage their services/waitlists

**Stories**:
1. **Service Schema**: Create schema with organizerId, name, slug, descriptions
2. **Slug Generation**: Implement unique slug generation and validation
3. **Service CRUD**: Implement create, read, update operations (no delete in MVP)
4. **Service Ownership**: Ensure organizers can only access their own services
5. **Waitlist Customization**: Support custom titles, descriptions, backgrounds
6. **Service Statistics**: Add participant count aggregation

### 4. Participants Module Epic
**Goal**: Enable public waitlist viewing and anonymous participation

**Stories**:
1. **Participant Schema**: Create schema with serviceId, email, joinDate
2. **Public Waitlist API**: Implement /public/waitlists/{slug} endpoint
3. **Join Waitlist**: Implement email-only registration with duplicate prevention
4. **Participant Count**: Efficient counting for public display
5. **Position Tracking**: Calculate participant position in waitlist
6. **Email Validation**: Implement proper email format validation

### 5. Dashboard & Analytics Epic
**Goal**: Provide comprehensive statistics for organizer dashboard

**Stories**:
1. **Stats Aggregation**: Implement service for calculating dashboard metrics
2. **Service Statistics**: Total services, active waitlists per organizer
3. **Participant Analytics**: Total participants, recent signups tracking
4. **Performance Optimization**: Implement caching for frequently accessed stats
5. **Real-time Updates**: Ensure stats reflect current data state

### 6. Data Export & Management Epic
**Goal**: Allow organizers to export and manage participant data

**Stories**:
1. **CSV Export**: Implement participant list export as CSV
2. **Pagination**: Add pagination to participant list endpoints
3. **Search Functionality**: Implement email search for participants
4. **Participant Removal**: Allow organizers to remove participants
5. **Bulk Operations**: Support for future bulk participant management

### 7. Production Readiness Epic
**Goal**: Prepare system for production deployment

**Stories**:
1. **API Documentation**: Generate Swagger/OpenAPI documentation
2. **Health Checks**: Implement health check endpoints
3. **Logging**: Set up structured logging with Winston
4. **Monitoring**: Implement application performance monitoring
5. **Security Audit**: Conduct security review and fixes
6. **Deployment Config**: Create Docker configuration and CI/CD pipeline

## Technical Specifications

### Technology Stack (Per Architecture Document):
- **Framework**: NestJS (latest stable version)
- **Language**: TypeScript with strict mode
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js integration
- **Validation**: class-validator and class-transformer
- **Documentation**: @nestjs/swagger for API docs

### API Design Principles:
- RESTful architecture with consistent naming
- Base URL: `/api/v1/`
- Standard HTTP status codes
- Consistent error response format
- Request/Response DTOs with validation

### Security Requirements:
- [x] Bcrypt password hashing (salt rounds: 10)
- [x] JWT tokens with expiration (24 hours)
- [x] Rate limiting (100 requests per minute per IP)
- [x] Input validation on all endpoints
- [x] CORS configuration for frontend domain
- [x] Helmet.js for security headers
- [x] Environment variables for all secrets

## Database Schemas (MongoDB/Mongoose)

### Organizer Schema:
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Service Schema:
```javascript
{
  _id: ObjectId,
  organizerId: ObjectId (indexed),
  name: String,
  description: String,
  slug: String (unique, indexed),
  waitlistTitle: String,
  waitlistDescription: String,
  waitlistBackground: String,
  createdAt: Date,
  updatedAt: Date
}
```

### WaitlistParticipant Schema:
```javascript
{
  _id: ObjectId,
  serviceId: ObjectId (indexed),
  email: String (indexed),
  joinDate: Date,
  position: Number
}
// Compound unique index on [serviceId, email]
```

## API Endpoint Mapping

### Frontend Expected → Backend Implementation:
1. `POST /api/auth/signup` → `/api/v1/auth/signup`
2. `POST /api/auth/login` → `/api/v1/auth/login`
3. `GET /api/dashboard/stats` → `/api/v1/services/stats` (new endpoint)
4. `GET /api/services` → `/api/v1/services`
5. `POST /api/services` → `/api/v1/services`
6. `GET /api/services/:id` → `/api/v1/services/:id`
7. `PUT /api/services/:id` → `/api/v1/services/:id`
8. `DELETE /api/services/:id` → Not implemented (out of MVP scope)
9. `GET /api/public/waitlists/:slug` → `/api/v1/public/waitlists/:slug`
10. `POST /api/public/waitlists/:slug/join` → `/api/v1/public/waitlists/:slug/join`
11. `GET /api/services/:id/participants` → `/api/v1/services/:id/participants`
12. `DELETE /api/services/:id/participants/:pid` → Future implementation

## Risk Mitigation

### Primary Risks:
1. **API Contract Mismatch**: Frontend expects specific response formats
   - **Mitigation**: Strict adherence to documented API specs, integration testing
2. **Performance at Scale**: Large participant lists could slow queries
   - **Mitigation**: Implement pagination, indexing, and caching strategies
3. **Security Vulnerabilities**: Authentication and data exposure risks
   - **Mitigation**: Follow OWASP guidelines, regular security audits

### Testing Strategy:
- Unit tests for all services and controllers
- Integration tests for API endpoints
- E2E tests with actual frontend
- Load testing for participant-heavy scenarios

## Definition of Done

- [x] All NestJS modules implemented and tested
- [x] MongoDB schemas match specifications
- [x] Authentication flow working end-to-end
- [x] All documented API endpoints functional
- [x] Frontend integration verified
- [x] Validation and error handling complete
- [x] API documentation generated
- [x] Security audit passed
- [x] Performance benchmarks met (<200ms response time)
- [x] Deployment pipeline configured

## Implementation Sequence

1. **Foundation & Infrastructure** (Day 1-2)
   - Critical path - blocks all other development
2. **Authentication Module** (Day 3-4)
   - Blocks all protected routes
3. **Services Module** (Day 5-6)
   - Core business functionality
4. **Participants Module** (Day 7-8)
   - Public-facing priority features
5. **Dashboard & Analytics** (Day 9)
   - Enhanced user experience
6. **Data Export & Management** (Day 10)
   - Organizer tools
7. **Production Readiness** (Day 11-12)
   - Final preparations

## Success Metrics

- 100% of documented endpoints implemented
- Zero critical security vulnerabilities
- All frontend features working without modification
- Response times < 200ms for 95th percentile
- 99.9% uptime during testing phase
- Successful participant registration rate > 99%
- Organizer authentication success rate > 99%

## Notes for Development Team

### Critical Implementation Guidelines:

1. **API Contract Adherence**:
   - Do NOT modify response structures from documentation
   - Frontend is production-ready and expects exact formats
   - Any deviations must be communicated immediately

2. **NestJS Best Practices**:
   - Use dependency injection consistently
   - Implement proper separation of concerns
   - Follow NestJS naming conventions
   - Use DTOs for all request/response validation

3. **Database Considerations**:
   - Create proper indexes for performance
   - Implement compound unique constraints
   - Use transactions where appropriate
   - Plan for future PostgreSQL migration if needed

4. **Security First**:
   - Never log sensitive information
   - Validate all inputs
   - Sanitize data before storage
   - Implement proper CORS policies

5. **Testing Requirements**:
   - Write tests alongside implementation
   - Maintain >80% code coverage
   - Test error scenarios thoroughly
   - Verify with actual frontend regularly

### Recommended Development Flow:
1. Set up NestJS with standard boilerplate
2. Implement one complete vertical (e.g., auth flow)
3. Verify with frontend before proceeding
4. Use Postman/Insomnia for API testing
5. Document any assumptions or changes
6. Regular code reviews for consistency

This epic represents the complete backend implementation for the Minimal Waitlist platform, transforming it from a frontend-only prototype to a production-ready full-stack application.