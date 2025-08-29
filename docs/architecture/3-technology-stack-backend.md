# 3. Technology Stack (Backend)
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
