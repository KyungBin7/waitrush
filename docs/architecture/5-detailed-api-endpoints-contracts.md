# 5. Detailed API Endpoints & Contracts

All APIs will be RESTful, using JSON for requests and responses. Base URL: `/api/v1/`

## 5.1. Authentication & Authorization (Auth Module)

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

## 5.2. Service Management (Services Module - Protected Routes)

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

## 5.3. Public Waitlist Interaction (Participants Module - Public Routes)

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
