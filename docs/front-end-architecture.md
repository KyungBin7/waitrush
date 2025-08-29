# Frontend Architecture Document: Minimal Waitlist Website (Further Revised)

**1. Introduction**
This document outlines the proposed frontend architecture for the Minimal Waitlist Website, building upon the Product Requirements Document (PRD) and the UI/UX Specification. The architecture is designed to support both authenticated Waitlist Providers and anonymous Waitlist Participants, adhering to a macOS-style trendy design, with the explicit use of `lovable` for the frontend and a **Nest.js backend**. The aim is to create a robust, scalable, maintainable, and high-performance system.

**2. Guiding Principles for Architecture**
* **Modularity & Component-Based:** Leverage `lovable`'s capabilities for a highly modular, reusable component structure.
* **Clean Separation of Concerns:** Clear distinction between UI, state management, and API communication.
* **Performance Optimized:** Implement strategies for fast loading, smooth transitions, and efficient data rendering, crucial for the macOS-style responsive feel.
* **Scalability & Maintainability:** Design for ease of future feature additions, bug fixes, and increased user load.
* **Security:** Implement best practices for secure communication and data handling, especially for authenticated routes.
* **Developer Experience:** Promote efficient development workflows within the `lovable` ecosystem.

**3. Technology Stack Recommendation (Confirmed)**

* **Frontend Framework/Library:** **`lovable`** (as per user requirement)
    * *Rationale:* This choice directly addresses the user's explicit requirement. The architecture will design around `lovable`'s core principles for component creation, state management, and rendering.
* **Styling:** **CSS-in-JS (e.g., Styled Components, Emotion) or utility-first CSS (e.g., Tailwind CSS)**
    * *Rationale:* To achieve the precise macOS-style trendy design, granular control over styling and component-level encapsulation is crucial. These options allow for dynamic theming, subtle effects (glassmorphism), and consistent application of the design system.
* **Build Tool:** **Vite or Webpack (integrated with `lovable`'s build process)**
    * *Rationale:* Fast development server, hot module replacement, and efficient production builds are essential for rapid iteration and optimal performance.
* **Deployment:** **Vercel, Netlify, or AWS Amplify**
    * *Rationale:* Ideal for single-page applications (SPAs) or static site generation (SSG)/server-side rendering (SSR) if `lovable` supports it efficiently for better SEO/initial load, offering global CDN, CI/CD, and scalability.

**4. Component Structure (High-Level, `lovable` Specific)**

The application will be structured around `lovable` components, categorizing them for maintainability and reusability.

* **Core Layout Components:**
    * `AppLayout` (Handles overall structure, routing context)
    * `AuthenticatedLayout` (For Organizer Dashboard, Service Management – might include sidebar navigation, consistent header)
    * `PublicLayout` (For anonymous waitlist pages – minimal header/footer, content centered)
    * `ModalContainer` (For system-wide modals, e.g., confirmations, alerts)
* **Page Components (Routes):**
    * `Auth/LoginPage`
    * `Auth/SignupPage`
    * `Organizer/DashboardPage`
    * `Organizer/ServiceRegistrationPage` (or `NewServiceForm`)
    * `Organizer/ServiceDetailPage` (includes waitlist overview)
    * `Public/WaitlistJoinPage` (dynamic route based on `serviceId` or `slug`)
    * `Public/ConfirmationPage`
    * `NotFoundPage`
* **UI Components (Reusable & Styled for macOS-style):**
    * `Button` (Primary, Secondary, Icon buttons)
    * `Input` (Text, Email, Password, Textarea)
    * `Checkbox/Toggle` (for notifications)
    * `Card` (for dashboard widgets, service overview)
    * `Table` (for participant lists)
    * `Loader/Spinner`
    * `ToastNotification`
    * `Icon` (leveraging a consistent icon set, potentially an SVG sprite or component library)
    * `Typography` components (H1, P, etc. with predefined styles)
    * `BackgroundEffects` (components or utilities to apply glassmorphism/blur effects).

**5. Data Flow & API Integration with Nest.js Backend**

The `lovable` frontend will communicate exclusively with the **Nest.js backend** via RESTful APIs.

* **API Client/Service Layer:**
    * A dedicated layer (e.g., `api.js` or `services/` folder in `lovable`) will handle all HTTP requests using `axios` or `fetch`.
    * This layer will encapsulate base URL, authentication headers (for organizer routes), and error handling.
* **Key API Endpoints (Conceptual - to be detailed by Backend Architect):**
    * **Authentication & Authorization (Nest.js handled):**
        * `POST /auth/signup` (Organizer registration)
        * `POST /auth/login` (Organizer login)
        * `GET /auth/me` (Fetch authenticated organizer profile)
    * **Service Management (Authenticated Organizers):**
        * `POST /api/services` (Create a new service/waitlist)
        * `GET /api/services` (Get all services for an organizer)
        * `GET /api/services/{serviceId}` (Get details for a specific service/waitlist)
        * `PUT /api/services/{serviceId}` (Update service/waitlist details)
        * `GET /api/services/{serviceId}/participants` (Export participants, CSV format via Nest.js)
    * **Public Waitlist Interaction (Anonymous):**
        * `GET /api/public/waitlists/{slug}` (Retrieve public waitlist details by slug)
        * `POST /api/public/waitlists/{slug}/join` (Add participant to waitlist)
* **Data Models:** Frontend will define interfaces/types (e.g., TypeScript interfaces) for data structures received from the Nest.js API (e.g., `Organizer`, `Service`, `WaitlistParticipant`).

**6. State Management (`lovable`'s Approach)**

Given `lovable`'s likely component-based nature, state management will be organized as follows:

* **Local Component State:** For ephemeral UI states (e.g., form input values, loading indicators, modal open/close).
* **Global Application State:** For data shared across multiple, disconnected components (e.g., authenticated organizer's user data, list of services, application-wide notifications). `lovable` likely provides its own state management solution (e.g., Context API-like, or a dedicated store similar to Redux/Vuex). The architecture will leverage this native solution for efficiency and consistency.

**7. Routing**

* **Client-Side Routing:** `lovable`'s built-in routing solution (or a recommended community router) will be used for seamless SPA navigation.
* **Protected Routes:** Implement route guards or authentication middleware to protect organizer-only routes, redirecting unauthenticated users to the login page.
* **Dynamic Routes:** `/waitlist/{slug}` for public waitlist pages.

**8. Error Handling & Feedback**

* **API Error Handling:** Centralized error handling layer in the API client to catch and process HTTP errors (e.g., 401 Unauthorized, 404 Not Found, 500 Server Error).
* **User Feedback:** Implement a consistent system for displaying success, error, and warning messages (e.g., toast notifications, inline form errors) that aligns with the macOS design.

**9. Build Process & Development Environment**

* **Development Server:** Fast local development server provided by `lovable`'s CLI/ecosystem.
* **Linting & Formatting:** Integrate ESLint/Prettier to enforce code quality and consistency.
* **Unit & Integration Testing:** Implement unit tests for `lovable` components and utility functions, and integration tests for API interactions (e.g., Jest, React Testing Library-like approach).
* **Version Control:** Git (e.g., GitHub, GitLab) for collaborative development.
* **CI/CD Pipeline:** Automate testing, building, and deployment processes for both frontend and backend to ensure rapid and reliable releases.