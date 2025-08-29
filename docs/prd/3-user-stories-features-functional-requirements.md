# 3. User Stories / Features (Functional Requirements)

## 3.1. Waitlist Provider (Organizer) Stories (Requires Account & Login):
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

## 3.2. Waitlist Participant (General User) Stories (Email Only, No Login):
* **As a participant, I want to access a public waitlist page via its unique URL, so that I can learn about the service/product.**
    * *Details:* Public-facing page displaying waitlist name, description, and organizer-provided visuals.
* **As a participant, I want to join a waitlist by simply entering my email address, without needing to create an account or log in, so that the process is quick, simple, and private.**
    * *Details:* Prominent email input field with clear call to action on the public waitlist page.
* **As a participant, I want to receive an instant, clear confirmation that I have successfully joined the waitlist, so that I am assured my submission was received.**
    * *Details:* An aesthetically pleasing confirmation message on screen (modal or dedicated page), and an optional confirmation email to the provided address.
* **As a participant, I want to experience a modern, macOS-style interface, so that the site feels premium and trustworthy.**
    * *Details:* Consistent design elements (typography, spacing, subtle effects) across all public-facing pages.
