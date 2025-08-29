# UI/UX Specification: Minimal Waitlist Website (Further Revised)

**1. Introduction**
This document details the user interface (UI) and user experience (UX) specifications for the Minimal Waitlist Website. It translates the functional and non-functional requirements from the **further revised PRD** into actionable design guidelines, emphasizing the **macOS-style trendy design**, simplicity, ease of use, and a premium aesthetic. This specification will serve as a comprehensive blueprint for the frontend development using `lovable`.

**2. Design Principles**
* **macOS-Style Trendiness:** Embrace clean lines, subtle translucency (e.g., frosted glass effects), refined system-like typography, consistent spacing, crisp iconography, and fluid micro-interactions. The design should feel premium, modern, and intuitive, consistent with Apple's aesthetic.
* **Minimalism & Clarity:** Focus on essential elements, ample negative space, and clear visual hierarchy to reduce cognitive load across all user flows.
* **Effortless Interaction:** Design intuitive flows that guide users through tasks with minimal friction and clear feedback.
* **Responsiveness:** Ensure a consistent, beautiful, and functional experience across all devices (desktop, tablet, mobile), adapting elegantly to different screen sizes while maintaining the core design aesthetic.
* **Accessibility:** Design with WCAG 2.1 AA standards in mind for inclusive usability across all features and interfaces.
* **Consistency:** Maintain a unified design language across all organizer-facing dashboards, forms, and public-facing waitlist pages.

**3. User Flows**

**3.1. Waitlist Provider (Organizer) Flow (Authenticated Experience)**

1.  **Account Creation / Sign-up:**
    * **Screen:** Clean, prominent sign-up form. macOS-style input fields (subtle borders, rounded corners, gentle focus states).
    * **Fields:** Email, Password, Confirm Password.
    * **Actions:** "Sign Up" button (primary). "Login" link for existing users.
    * **Flow:** Email verification step (e.g., "Check your email" message, link to verification page).
2.  **Login:**
    * **Screen:** Dedicated login form, minimalist, centered.
    * **Fields:** Email, Password. "Forgot Password?" link.
    * **Actions:** "Login" button (primary). "Sign Up" link for new users.
3.  **Organizer Dashboard:**
    * **Layout:** Clean, macOS-inspired sidebar or top navigation for primary sections (Dashboard, My Services, Account Settings). Main content area displays an overview.
    * **Dashboard View:**
        * Overview cards/widgets for total services, total participants, recent activity.
        * Quick access to "Register New Service."
        * Prominent display of active services with their key metrics (name, participant count, status).
4.  **Register New Service / Create Waitlist:**
    * **Screen:** Step-by-step form or a multi-section single page. Clear progress indicator if multi-step.
    * **Section 1: Service Details:**
        * `Service Name` (required, text input)
        * `Service Description` (required, multiline textarea, placeholder hints content)
        * `Unique URL Slug` (dynamically generated, editable, with validation feedback for uniqueness).
    * **Section 2: Waitlist Configuration:** (This is directly linked to the service)
        * `Waitlist Title` (defaults to Service Name, editable)
        * `Waitlist Description` (defaults to Service Description, editable for public view)
        * `Public Page Background:` (macOS-style color picker or image upload with preview, supporting subtle blur/gradient effects).
        * `Email Notifications:` (Toggle for new participant notifications).
    * **Actions:** "Save Service & Create Waitlist" (primary), "Cancel," "Back" (if multi-step).
5.  **My Services / Service Detail Page:**
    * **Layout:** List or card view of all registered services. Clicking on a service navigates to its detailed view.
    * **Service Detail View:**
        * Prominent `Service Name` and `Waitlist Title`.
        * **Public Waitlist URL:** Clearly displayed URL with a one-click "Copy URL" button.
        * **Participant Count:** Large, easily readable number.
        * List/table of waitlist participants (email, join date).
        * **Actions:** "Export Participants (CSV)" button, "Edit Service/Waitlist" button.
6.  **Account Settings:**
    * **Screen:** Simple forms for changing password, updating email, or other account-related preferences.

**3.2. Waitlist Participant Flow (Anonymous Experience)**

1.  **Access Public Waitlist Page:** User clicks on the unique waitlist URL provided by an organizer.
2.  **Public Waitlist View:**
    * **Appearance:** Full-screen, elegant page designed with the organizer's chosen macOS-style background/design. Focus is on the waitlist title, description, and the single email input.
    * **Elements:**
        * Large, clear `Waitlist Title` (from organizer config).
        * Concise `Waitlist Description`.
        * `Email Address` input field (with placeholder "your@email.com").
        * Prominent `Join Waitlist` button (primary, perhaps with a subtle gradient or hover effect, consistent with macOS button styling).
        * Minimalist footer (e.g., "Powered by Minimal Waitlist").
3.  **Join Confirmation:**
    * **Appearance:** An overlay modal or a new full-screen confirmation page with a satisfying, subtle animation (e.g., a fluid checkmark animation, gentle fade).
    * **Elements:**
        * Clear success message (e.g., "You're on the list!").
        * Optional secondary message (e.g., "We'll notify you when [Product/Event] is ready.").

**4. Key Screens & Elements (Detailed & macOS-Style)**

**4.1. Input Fields:**
* **Style:** Clean, minimal, translucent backgrounds (glassmorphism effect), subtle rounded corners.
* **Focus State:** A gentle, glowing ring or a subtle accent border that expands/contracts, mimicking macOS active input fields.
* **Placeholders:** Clear, light grey text.
* **Error States:** Distinct visual cue (e.g., a subtle red outline, small error text below) for validation errors.

**4.2. Buttons:**
* **Primary:** Solid fill with subtle gradients or glassmorphism effect, well-rounded corners, clear white or dark contrasting text. Fluid hover states (slight lift, color shift).
* **Secondary/Tertiary:** Outline buttons or simple text links for less critical actions, maintaining minimalist aesthetic, consistent with macOS app buttons.
* **Icons:** Use SF Symbols-like (or similar style) clean, outline icons.

**4.3. Typography:**
* **Fonts:** System fonts preferred (e.g., a font family that renders similar to San Francisco for macOS-like feel) or a clean, modern sans-serif with excellent legibility.
* **Hierarchy:** Strict typographic hierarchy for headings (e.g., H1 for main titles, H2 for section titles), body text, and labels, ensuring clear information distinction.

**4.4. Layout & Spacing:**
* **Grids & Alignment:** Strict use of a consistent 8pt or 12pt grid system for precise alignment and balanced layout.
* **Whitespace:** Abundant and intentional whitespace to enhance readability, reduce clutter, and give a premium, breathable feel.
* **Card Elements:** Use subtle shadows and rounded corners for card-like components (e.g., dashboard widgets, service details), consistent with macOS UI.

**4.5. Micro-interactions & Animations:**
* **Transitions:** Smooth, easing animations (e.g., cubic-bezier timing functions) for page transitions (e.g., fade-ins, gentle slides), modal openings/closings.
* **Hover/Click Effects:** Subtle visual feedback on interactive elements (buttons, links, inputs).
* **Loading States:** Minimalist, elegant loading indicators (e.g., progress bars, subtle spinners, content skeleton loaders) that integrate with the macOS-style aesthetic.

**4.6. Visual Design Guidelines (Specific to macOS-Style Trendiness)**
* **Color Palette:** Primarily desaturated, neutral colors (grays, whites, muted blues/greens) as base, with a limited, carefully chosen vibrant accent color for primary actions and highlights. Use of translucent layers for "frosted glass" effects where appropriate.
* **Shadows:** Soft, diffused, multi-layered shadows for depth, consistent with macOS UI elements (e.g., windows, cards).
* **Borders:** Minimal, often subtle or non-existent, letting whitespace and shadows define boundaries. When present, thin and crisp.

**5. Technical Considerations for `lovable` Frontend Development:**
* The design explicitly considers `lovable`'s component-based nature, ensuring that each UI element and screen can be broken down into reusable and maintainable components.
* Animations and interactive effects will leverage `lovable`'s capabilities for smooth, performant rendering.
* State management within `lovable` will be designed to handle both organizer session/data and public waitlist form submissions efficiently.

**6. Accessibility Considerations**
* **Keyboard Navigation:** All interactive elements (buttons, inputs, links, navigation) must be fully navigable and operable via keyboard.
* **Focus States:** Clear and visually distinct focus indicators for all interactive elements to aid keyboard users.
* **Semantic HTML:** Proper use of HTML5 semantic tags for better screen reader compatibility.
* **ARIA Attributes:** Strategic use of ARIA attributes for complex components (e.g., modals, form validation messages) to convey state and context.
* **Color Contrast:** Ensure sufficient color contrast ratio (WCAG AA) for all text and interactive elements against their backgrounds.