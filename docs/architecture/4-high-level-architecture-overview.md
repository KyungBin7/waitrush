# 4. High-Level Architecture Overview

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
