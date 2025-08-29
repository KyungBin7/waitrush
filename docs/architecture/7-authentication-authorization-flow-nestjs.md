# 7. Authentication & Authorization Flow (Nest.js)
* **JWT Strategy:** Nest.js Passport.js with a JWT strategy will be used.
* **Token Issuance:** Upon successful login, the Nest.js backend will issue a JWT containing the `organizerId`.
* **Token Verification:** On protected routes, a JWT Guard will extract and verify the token, attaching the authenticated user's payload to the request.
* **Password Hashing:** `bcrypt` will be used to hash and salt passwords before storing them in the database.
