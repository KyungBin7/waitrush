# Backend Architecture Document: Minimal Waitlist Website (Nest.js)

## 1. Introduction
This document outlines the proposed backend architecture for the Minimal Waitlist Website, to be implemented using **Nest.js**. It details the structural design, API specifications, and database schema necessary to support the `lovable` frontend, catering to both authenticated Waitlist Providers and anonymous Waitlist Participants, as defined in the PRD and UI/UX Specification.

## 2. Guiding Principles
* **Modularity & Scalability:** Leverage Nest.js's module-based structure for clear separation of concerns, promoting scalability and maintainability.
* **Robustness & Reliability:** Implement strong validation, error handling, and security measures.
* **Performance:** Optimize API endpoints for fast response times and efficient data processing.
* **Security:** Ensure secure authentication, authorization, and data handling (e.g., password hashing, input sanitization).
* **Maintainability:** Write clean, testable, and well-documented code following Nest.js best practices.

## 3. Technology Stack (Backend)
* **Framework:** **Nest.js** (Node.js framework)
    * *Rationale:* Provides a robust, scalable, and maintainable server-side application framework based on TypeScript, aligning with enterprise-grade application development.
* **Language:** TypeScript
* **Database:** **MongoDB** (NoSQL Document Database) or **PostgreSQL** (Relational Database)
    * *Rationale:*
        * **MongoDB:** Flexible schema, suitable for rapid prototyping and evolving data models, scales horizontally. Good fit if `lovable` frontend data structures are less rigid.
        * **PostgreSQL:** Robust, ACID-compliant, strong support for relational data and complex queries. Excellent for structured user/service data.
        * *Decision:* For MVP, **MongoDB** offers more flexibility. If strong relational integrity becomes a primary concern, PostgreSQL should be considered. (Assuming MongoDB for this document's schema examples due to common Nest.js integration patterns with Mongoose).
* **ORM/ODM:** Mongoose (for MongoDB) or TypeORM (for PostgreSQL/other RDBMS)
* **Authentication:** JWT (JSON Web Tokens) with Passport.js for Nest.js.
* **Validation:** Class-validator / Class-transformer.

## 4. High-Level Architecture Overview

The Nest.js application will follow a modular, layered architecture:

* **Core Module (`app.module.ts`):** Entry point, imports other feature modules.
* **Authentication Module (`auth.module.ts`):** Handles user registration, login, JWT generation/validation.
* **Users Module (`users.module.ts`):** Manages `Organizer` user data.
* **Services Module (`services.module.ts`):** Manages `Service` data and `Waitlist` data associated with services.
* **Participants Module (`participants.module.ts`):** Handles participant sign-ups for waitlists.
* **Global Modules/Middleware:** Logging, Exception Filters, Validation Pipes, Guards.

**Nest.js Layers:**
* **Controllers:** Handle incoming HTTP requests, route them to services.
* **Services:** Contain business logic, interact with repositories/database.
* **Repositories/Schemas (Mongoose/TypeORM):** Interact directly with the database.
* **DTOs (Data Transfer Objects):** Define data structure for incoming requests (validation).

## 5. Detailed API Endpoints & Contracts

All APIs will be RESTful, using JSON for requests and responses. Base URL: `/api/v1/`

### 5.1. Authentication & Authorization (Auth Module)

* **`POST /auth/signup`**
    * **Description:** Register a new Waitlist Provider (Organizer) account.
    * **Request Body (`CreateOrganizerDto`):**
        ```json
        {
          "email": "string",  // Must be valid email, unique
          "password": "string" // Min length 8, contains uppercase, lowercase, number, special char
        }
        ```
    * **Response Body (Success `201 Created`):**
        ```json
        {
          "id": "string",
          "email": "string",
          "createdAt": "ISOString"
        }
        ```
    * **Response Body (Error `400 Bad Request`, `409 Conflict`):** Standard error format.
* **`POST /auth/login`**
    * **Description:** Authenticate a Waitlist Provider.
    * **Request Body (`LoginDto`):**
        ```json
        {
          "email": "string",
          "password": "string"
        }
        ```
    * **Response Body (Success `200 OK`):**
        ```json
        {
          "accessToken": "string" // JWT Token
        }
        ```
    * **Response Body (Error `401 Unauthorized`):** Standard error format.
* **`GET /auth/me`** (Protected Route - Requires `Authorization: Bearer <token>`)
    * **Description:** Get authenticated Organizer's profile.
    * **Response Body (Success `200 OK`):**
        ```json
        {
          "id": "string",
          "email": "string",
          "createdAt": "ISOString"
        }
        ```
    * **Response Body (Error `401 Unauthorized`):** Standard error format.

### 5.2. Service Management (Services Module - Protected Routes)

* **`POST /services`** (Requires `Authorization: Bearer <token>`)
    * **Description:** Create a new service and its associated waitlist.
    * **Request Body (`CreateServiceDto`):**
        ```json
        {
          "name": "string",        // Service name
          "description": "string", // Service description
          "slug": "string",        // Unique URL friendly identifier for public waitlist page
          "waitlistTitle": "string", // Public waitlist page title (defaults to name)
          "waitlistDescription": "string", // Public waitlist page description (defaults to description)
          "waitlistBackground": "string" // URL or hex code for background
        }
        ```
    * **Response Body (Success `201 Created`):**
        ```json
        {
          "id": "string",
          "organizerId": "string",
          "name": "string",
          "slug": "string",
          "waitlistUrl": "string", // Full public URL
          "participantCount": 0,
          "createdAt": "ISOString"
        }
        ```
* **`GET /services`** (Requires `Authorization: Bearer <token>`)
    * **Description:** Get all services registered by the authenticated Organizer.
    * **Response Body (Success `200 OK`):** Array of service objects (similar to `POST /services` response).
* **`GET /services/{id}`** (Requires `Authorization: Bearer <token>`)
    * **Description:** Get details for a specific service by its ID.
    * **Response Body (Success `200 OK`):** Single service object.
* **`PUT /services/{id}`** (Requires `Authorization: Bearer <token>`)
    * **Description:** Update a specific service and its waitlist details.
    * **Request Body (`UpdateServiceDto`):** Partial `CreateServiceDto`.
    * **Response Body (Success `200 OK`):** Updated service object.
* **`GET /services/{id}/participants`** (Requires `Authorization: Bearer <token>`)
    * **Description:** Export participants for a given service.
    * **Response:** CSV file containing participant emails and join dates.
    * **Headers:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename="..."`

### 5.3. Public Waitlist Interaction (Participants Module - Public Routes)

* **`GET /public/waitlists/{slug}`**
    * **Description:** Get public details of a waitlist by its unique slug.
    * **Response Body (Success `200 OK`):**
        ```json
        {
          "title": "string",
          "description": "string",
          "background": "string",
          "currentParticipants": 123 // Count of participants
        }
        ```
    * **Response Body (Error `404 Not Found`):** Standard error format.
* **`POST /public/waitlists/{slug}/join`**
    * **Description:** Add a participant to the specified waitlist.
    * **Request Body (`JoinWaitlistDto`):**
        ```json
        {
          "email": "string" // Participant's email, must be valid
        }
        ```
    * **Response Body (Success `201 Created`):**
        ```json
        {
          "message": "Successfully joined the waitlist.",
          "waitlistEntryId": "string"
        }
        ```
    * **Response Body (Error `400 Bad Request`, `409 Conflict` (if email already registered for this waitlist)):** Standard error format.

## 6. Database Schema (MongoDB - using Mongoose)

### 6.1. Organizer Schema
* **Collection Name:** `organizers`
* **Fields:**
    * `_id`: `ObjectId` (auto-generated)
    * `email`: `String` (Unique, Indexed, Required)
    * `passwordHash`: `String` (Required, hashed password)
    * `createdAt`: `Date` (Default: `Date.now`)
    * `updatedAt`: `Date` (Default: `Date.now`)

### 6.2. Service Schema
* **Collection Name:** `services`
* **Fields:**
    * `_id`: `ObjectId` (auto-generated)
    * `organizerId`: `ObjectId` (Refers to `organizers`._id, Indexed, Required)
    * `name`: `String` (Required)
    * `description`: `String`
    * `slug`: `String` (Unique, Indexed, Required - used for public URLs)
    * `waitlistTitle`: `String`
    * `waitlistDescription`: `String`
    * `waitlistBackground`: `String` (URL or hex code)
    * `createdAt`: `Date`
    * `updatedAt`: `Date`

### 6.3. WaitlistParticipant Schema
* **Collection Name:** `waitlistParticipants`
* **Fields:**
    * `_id`: `ObjectId` (auto-generated)
    * `serviceId`: `ObjectId` (Refers to `services`._id, Indexed, Required)
    * `email`: `String` (Indexed, Required - combined with `serviceId` for unique constraint)
    * `joinDate`: `Date` (Default: `Date.now`)

## 7. Authentication & Authorization Flow (Nest.js)
* **JWT Strategy:** Nest.js Passport.js with a JWT strategy will be used.
* **Token Issuance:** Upon successful login, the Nest.js backend will issue a JWT containing the `organizerId`.
* **Token Verification:** On protected routes, a JWT Guard will extract and verify the token, attaching the authenticated user's payload to the request.
* **Password Hashing:** `bcrypt` will be used to hash and salt passwords before storing them in the database.

## 8. Error Handling & Validation
* **Global Exception Filters:** Centralized error handling using Nest.js's exception filters to catch errors and return consistent JSON error responses (e.g., 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
* **Class-Validator:** Use DTOs with `class-validator` decorators for automatic request payload validation.
* **Custom Errors:** Implement custom error classes for specific business logic failures.

## 9. Key Nest.js Dependencies & Modules
* `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
* `@nestjs/mongoose` (if using MongoDB) or `@nestjs/typeorm` (if using PostgreSQL)
* `@nestjs/passport`, `passport-jwt`, `@nestjs/jwt`
* `bcrypt` (for password hashing)
* `class-validator`, `class-transformer`
* `dotenv` (for environment variables)