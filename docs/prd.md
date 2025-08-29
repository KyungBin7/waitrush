# Product Requirements Document (PRD): Minimal Waitlist Website (Further Revised)

## 1. Introduction
This document outlines the requirements for the "Minimal Waitlist Website" project, building upon the further revised Project Brief. The primary goal is to develop an intuitive, user-friendly, and visually stunning waitlist platform that supports both **registered waitlist providers** and **anonymous participants**. This PRD details the functional and non-functional requirements, incorporating specific technology choices and the refined design aesthetic.

## 2. Goals
* **Core Goal:** To enable quick and effortless creation and management of waitlists by registered providers, and seamless, anonymous participation by general users, leveraging specified modern technologies.
* **Provider Experience Goal:** Provide a secure, efficient, and intuitive platform for organizers to manage their services and waitlists, from account creation to participant tracking.
* **Participant Experience Goal:** Deliver a delightful and frictionless user experience for joining waitlists, characterized by a clean, responsive interface with a trendy macOS-style design, requiring only an email address.
* **Technical Goal:** Build a scalable, robust, and maintainable web application using specified frontend (lovable) and backend (Nest.js) technologies, ensuring high performance, data integrity, and security for both user types.

## 3. User Stories / Features (Functional Requirements)

### 3.1. Waitlist Provider (Organizer) Stories (Requires Account & Login):
* **Account Management:**
    * **As an organizer, I want to sign up for a new account, so that I can create and manage my waitlists.**
        * *Details:* Standard email/password registration, email verification (for security and contact), login/logout functionality.
    * **As an organizer, I want to log in to my account securely, so that I can access my dashboard and services.**
        * *Details:* Login form, password recovery option.
    * **As an organizer, I want to manage my account profile (e.g., password, email), so that I can keep my information up-to-date.**
        * *Details:* Simple profile settings page.
* **Service & Waitlist Management Dashboard:**
    * **As an organizer, I want a personalized dashboard, so that I can easily view and manage all my registered services and their associated waitlists.**
        * *Details:* Overview of active waitlists, participant counts, quick links to manage individual services/waitlists.
    * **As an organizer, I want to register a new service/product, so that I can create a waitlist for it.**
        * *Details:* Form for service name, description, optional branding (background, image), and linking it to a waitlist.
    * **As an organizer, I want to create a waitlist for my registered service, so that I can start collecting interest.**
        * *Details:* Simple form within the service management section, linking to the service details.
    * **As an organizer, I want to view the unique, shareable URL for each of my waitlists, so that I can promote them effectively.**
        * *Details:* URL displayed prominently on the service/waitlist detail page, with an easy "Copy URL" button.
    * **As an organizer, I want to see the total number of participants for each of my waitlists, so that I can track interest and gauge engagement.**
        * *Details:* Real-time participant count displayed on the dashboard and individual waitlist pages.
    * **As an organizer, I want to export the list of waitlist participants (emails), so that I can use it for my marketing efforts.**
        * *Details:* CSV export option for registered emails (MVP: simple export, no advanced filtering).
    * **As an organizer, I want to receive notifications (e.g., email) when new users join my waitlist, so that I can stay updated on its growth.**
        * *Details:* Configurable email notifications.

### 3.2. Waitlist Participant (General User) Stories (Email Only, No Login):
* **As a participant, I want to access a public waitlist page via its unique URL, so that I can learn about the service/product.**
    * *Details:* Public-facing page displaying waitlist name, description, and organizer-provided visuals.
* **As a participant, I want to join a waitlist by simply entering my email address, without needing to create an account or log in, so that the process is quick, simple, and private.**
    * *Details:* Prominent email input field with clear call to action on the public waitlist page.
* **As a participant, I want to receive an instant, clear confirmation that I have successfully joined the waitlist, so that I am assured my submission was received.**
    * *Details:* An aesthetically pleasing confirmation message on screen (modal or dedicated page), and an optional confirmation email to the provided address.
* **As a participant, I want to experience a modern, macOS-style interface, so that the site feels premium and trustworthy.**
    * *Details:* Consistent design elements (typography, spacing, subtle effects) across all public-facing pages.

## 4. Non-Functional Requirements

* **Performance:**
    * Ultra-fast page load times (e.g., under 1.5 seconds) for both organizers (dashboard, forms) and participants (public pages).
    * Highly responsive UI, ensuring smooth animations and interactions for a premium feel.
    * Ability to handle a high volume of concurrent organizer actions and participant sign-ups efficiently, leveraging Nest.js's performance.
* **Scalability:** The system must be designed to scale robustly, accommodating a rapidly growing number of registered organizers, services, and participants.
* **Security:**
    * Robust user authentication and authorization for organizers.
    * Secure storage and protection of all user data (emails, organizer info).
    * Comprehensive spam and bot protection for waitlist submissions.
    * Strict adherence to secure communication protocols (HTTPS) and best practices for API security (e.g., JWT for authentication, input validation).
* **Usability (UI/UX):**
    * **Strict adherence to macOS-style trendy design principles:** Consistent use of subtle translucency, refined typography, crisp iconography, fluid micro-interactions, clean aesthetics, subtle shadows, and ample white space across both public and authenticated views.
    * Intuitive navigation and clear calls to action for both user types.
    * Fully responsive design for a seamless and aesthetically pleasing experience across all modern devices.
* **Maintainability:** The codebase for both frontend (lovable) and backend (Nest.js) should be clean, modular, well-documented, and follow established best practices for their respective frameworks.
* **Accessibility:** Adhere to WCAG 2.1 AA standards for inclusive usability.

## 5. Technical Preferences & Constraints:
* **Frontend Development Framework:** **lovable**.
* **Backend Development Framework:** **Nest.js**.
* **Backend Implementation Phase:** Backend will be fully implemented and integrated with the frontend during the IDE development phase. This includes API endpoints for organizer authentication, service management, and participant registration.
* **API Design:** A well-defined RESTful API will facilitate seamless and secure communication between the lovable frontend and the Nest.js backend.

## 6. Out of Scope (for Initial MVP):
* Advanced analytics dashboards beyond basic participant counts and service overview.
* Integrated email marketing or CRM functionalities (beyond basic email notifications).
* Complex customization options for waitlist pages beyond visual themes and basic content.
* Multi-language support (initial focus on English/Korean).
* Rich text editing for descriptions.
* Payment processing for services.

## 7. Future Considerations:
* Social sharing integrations (e.g., share waitlist, refer a friend).
* Advanced referral tracking for participants.
* Custom domains for waitlist pages.
* Integration with third-party marketing and analytics tools.
* Tiered plans for organizers (e.g., more waitlists, advanced features).

## 8. Success Metrics (Refined from Project Brief):
* **Primary:**
    * Number of **Registered Waitlist Providers** per month.
    * Monthly Active Waitlists (MAW): Number of waitlists receiving at least one new sign-up per month.
    * Monthly Waitlist Joins (MWJ): Total number of unique sign-ups across all waitlists per month.
* **Secondary:**
    * Organizer retention rate.
    * Average time for an organizer to create a service and associated waitlist (should be under 2 minutes).
    * User satisfaction score (e.g., Net Promoter Score, based on feedback regarding design, usability, and functionality for both providers and participants).
    * Frontend and Backend performance metrics (e.g., Lighthouse scores, API response times).