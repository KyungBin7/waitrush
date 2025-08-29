# Project Overview

This is a waitlist management application with the following structure:

## Purpose
A platform that allows organizers to create waitlists for their services/products and manage participants. Users can join waitlists through public pages.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: ShadcN UI + Radix UI + Tailwind CSS
- **Routing**: React Router DOM v6
- **State Management**: React Context (AuthContext) + TanStack Query
- **Backend**: NestJS (separate service in waitlist-backend folder)

## Project Structure
```
/
├── front/listly-ease/          # React frontend application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable UI components  
│   │   ├── services/           # API service classes
│   │   ├── contexts/           # React contexts
│   │   └── utils/              # Utility functions
└── waitlist-backend/           # NestJS backend API
```

## Key Routes
- `/` - Home page
- `/waitlist/:slug` - Public waitlist join page
- `/service/:slug` - Service detail page
- `/dashboard` - Protected organizer dashboard
- `/create-service` - Protected service creation