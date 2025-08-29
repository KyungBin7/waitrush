# Project Brief: Minimal Waitlist Website (Further Revised)

**1. Project Name:** Minimal Waitlist (Working Title: Simple Waitlist Hub)

**2. Project Objective:**
To develop a web-based platform that allows **waitlist providers to register as members and set up their services/products**, enabling other users to effortlessly join these waitlists. The goal is to simplify waitlist management for various purposes such as product launches, event registrations, and service pre-bookings. The core focus remains on providing the best user experience through 'ease of use' and a 'minimalist design', evolving with specific technical and aesthetic directions, and now including a robust system for organizers.

**3. Target Users:**
* **Waitlist Providers (Organizers - now with Accounts):** Startups launching new products, event organizers planning specific events, individuals/businesses seeking pre-registrations for limited services. These users will **sign up for an account** to manage their waitlists.
* **Waitlist Participants (General Users - email only):** General web users who wish to receive early information about products, services, or events of interest. These users will **join waitlists by simply entering their email without needing to log in or create an account.**

**4. Key Features (MVP Scope):**
* **Organizer Account & Service Registration:**
    * **Organizer Sign-up/Login:** Providers can create an account and log in to access their dashboard.
    * **Service Registration:** Authenticated providers can register and configure their specific services/products that will have waitlists.
    * **Dashboard:** A personalized dashboard for providers to view and manage their registered services and associated waitlists.
* **Waitlist Creation & Management (by Registered Provider):**
    * Simple waitlist creation tied to a registered service (e.g., set name, description, background image/color).
    * Generation and sharing of a unique waitlist URL for each service.
    * Ability to view the number of registered waitlist participants for each service.
* **Participant Waitlist Joining (Email Only):**
    * Users access a public waitlist page via a unique URL.
    * **Users register for the waitlist by entering only their email, without needing to log in or create an account.**
    * Provision of a waitlist sign-up confirmation message/page (optional: queue position notification).
    * Intuitive and highly engaging UI/UX for participants.

**5. Core Value Proposition:**
* **Streamlined Provider Management:** Empowering waitlist providers with a dedicated account to easily manage multiple services and their waitlists.
* **Extreme Simplicity for Participants:** Maintaining an ultra-simple, no-login, email-only sign-up process for participants.
* **Elegant & Trendy Design:** A visually appealing, macOS-style trendy design that prioritizes a clean and intuitive user interface for both providers and participants.
* **Rapid Setup and Use:** Providing maximum impact with minimal effort for both waitlist creators and participants.

**6. Design Goals & Preferences:**
* **Design Style:** macOS-style trendy design. Emphasis on clean aesthetics, subtle animations, and a polished user interface that feels modern and intuitive, akin to Apple's design principles. This applies to both provider dashboards/forms and public participant pages.
* **User Interface:** Simple, easy to use, and minimalist for both provider and participant experiences.

**7. Technical Considerations & Preferences:**
* **Frontend Development:** To be developed using **lovable** for the frontend.
* **Backend Development:** Backend implementation will occur in the IDE phase.
* **Backend Technology Stack:** **Nest.js** will be used for the backend development, ensuring robust support for user accounts, service registration, and waitlist management, while maintaining compatibility with the frontend.

**8. Out of Scope (Initial MVP):**
* Complex analytics dashboards beyond basic participant counts.
* Integrated email marketing or CRM functionalities.
* Complex customization options for waitlist pages beyond visual themes.
* Multi-language support (initial focus on English/Korean).
* User-to-user messaging or complex notification systems beyond basic email alerts to providers/participants.

**9. Success Metrics (Initial):**
* Number of **registered Waitlist Providers**.
* Monthly Active Waitlists (MAW): Number of waitlists receiving at least one new sign-up per month.
* Monthly Waitlist Joins (MWJ): Total number of unique sign-ups across all waitlists per month.
* User feedback (satisfaction with simplicity, design, and ease of use for both providers and participants).