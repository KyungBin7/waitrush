# Development Workflow: Frontend-Backend Integration

This document provides instructions for running both the Lovable frontend and NestJS backend projects together during development.

## Project Structure

```
waitlist2/
├── waitlist-backend/          # NestJS backend project
│   ├── src/
│   ├── test/
│   ├── .env                   # Backend environment configuration
│   └── package.json
├── front/listly-ease/         # Lovable frontend project  
│   ├── src/
│   ├── vite.config.ts         # Includes API proxy configuration
│   └── package.json
└── docs/                      # Project documentation
```

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally (if using database features)
- Two terminal windows/tabs

### Development Startup

**Terminal 1 - Backend:**
```bash
cd waitlist-backend
npm install
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd front/listly-ease
npm install
npm run dev
```

### Access URLs
- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3001
- **Backend Health Check:** http://localhost:3001/health

## Configuration Details

### Backend Configuration (waitlist-backend)

**CORS Configuration** (`src/config/cors.config.ts`):
- Configured to accept requests from `http://localhost:8080`
- Supports credentials and all necessary HTTP methods
- Environment variable: `CORS_ORIGIN=http://localhost:8080`

**Environment Variables** (`.env`):
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:8080
JWT_SECRET=dev-secret-key-change-in-production-please-use-strong-random-key
DATABASE_URL=mongodb://localhost:27017/waitlist
```

### Frontend Configuration (front/listly-ease)

**Vite Proxy Configuration** (`vite.config.ts`):
```typescript
server: {
  host: "::",
  port: 8080,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

**API Usage in Frontend:**
- All API calls should use `/api/` prefix
- Example: `fetch('/api/health')` → routed to `http://localhost:3001/health`

## Development Testing

### Backend Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "database": {
    "status": "up"
  }
}
```

### Frontend to Backend Connectivity
```bash
# From frontend (while both servers are running)
curl -H "Origin: http://localhost:8080" http://localhost:8080/api/health
```

### CORS Verification
```bash
curl -i -X OPTIONS http://localhost:3001/health \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"
```

## Testing

### Backend Tests
```bash
cd waitlist-backend
npm test                    # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Test coverage
```

### Frontend Tests
The frontend project uses Lovable and doesn't include a traditional test setup. For testing frontend-backend connectivity, use the ConnectivityTest component:

```typescript
import { ConnectivityTest } from './components/ConnectivityTest';

// In your React component
<ConnectivityTest />
```

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Symptom: "Access-Control-Allow-Origin" errors in browser console
- Solution: Verify `CORS_ORIGIN=http://localhost:8080` in backend `.env` file
- Check: Backend logs should show CORS configuration on startup

**2. API Calls Return 404**
- Symptom: Frontend API calls to `/api/*` return 404
- Solution: Ensure both servers are running and proxy is configured
- Check: Vite proxy configuration in `vite.config.ts`

**3. Backend Won't Start**
- Symptom: "Port 3001 already in use" or environment errors
- Solution: Check if another process is using port 3001: `lsof -i :3001`
- Check: Ensure `.env` file exists with proper configuration

**4. Frontend Can't Connect**
- Symptom: Network errors or connection refused
- Solution: Verify backend is running on port 3001
- Check: Visit http://localhost:3001/health directly

### Debug Steps

1. **Verify Server Status:**
   ```bash
   # Check backend
   curl http://localhost:3001/health
   
   # Check frontend
   curl http://localhost:8080
   ```

2. **Check CORS Headers:**
   ```bash
   curl -i -H "Origin: http://localhost:8080" http://localhost:3001/health
   ```

3. **Verify Proxy Routing:**
   ```bash
   # With both servers running
   curl -H "Origin: http://localhost:8080" http://localhost:8080/api/health
   ```

## Port Configuration

| Service | Port | URL | Notes |
|---------|------|-----|-------|
| Frontend | 8080 | http://localhost:8080 | Vite development server |
| Backend | 3001 | http://localhost:3001 | NestJS application |
| MongoDB | 27017 | mongodb://localhost:27017 | Database (if using) |

## Development Scripts

### Backend (waitlist-backend)
```bash
npm run start:dev          # Development server with hot reload
npm run start:debug        # Debug mode with --inspect
npm run build             # Production build
npm run lint              # ESLint check
npm run format            # Prettier formatting
```

### Frontend (front/listly-ease)
```bash
npm run dev               # Development server
npm run build             # Production build
npm run preview           # Preview production build
npm run lint              # ESLint check
```

## File Structure for Cross-Project Communication

### Backend Files
- `src/config/cors.config.ts` - CORS configuration
- `src/modules/health/health.controller.ts` - Health check endpoint
- `.env` - Environment variables
- `test/cross-project-connectivity.e2e-spec.ts` - Integration tests

### Frontend Files
- `vite.config.ts` - Proxy configuration
- `src/utils/connectivity.ts` - Connectivity testing utilities
- `src/components/ConnectivityTest.tsx` - UI component for testing

## Production Considerations

When deploying to production:

1. **Backend:**
   - Update `CORS_ORIGIN` to production frontend URL
   - Use secure JWT secrets
   - Configure proper database connections

2. **Frontend:**
   - Update API proxy target to production backend URL
   - Consider using environment-specific configuration
   - Build and serve static assets

3. **Security:**
   - Use HTTPS in production
   - Configure proper CORS origins
   - Implement rate limiting and security headers

## Next Steps

After successful cross-project communication setup:

1. **Authentication Integration:** Connect frontend login/signup forms to backend auth endpoints
2. **API Development:** Implement and connect business logic endpoints
3. **Error Handling:** Ensure consistent error handling across both projects
4. **Testing:** Add comprehensive integration tests for key user flows