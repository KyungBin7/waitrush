# 6. Database Schema (MongoDB - using Mongoose)

## 6.1. Organizer Schema
* **Collection Name:** `organizers`
* **Fields:**
    * `_id`: `ObjectId` (auto-generated)
    * `email`: `String` (Unique, Indexed, Required)
    * `passwordHash`: `String` (Required, hashed password)
    * `createdAt`: `Date` (Default: `Date.now`)
    * `updatedAt`: `Date` (Default: `Date.now`)

## 6.2. Service Schema
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

## 6.3. WaitlistParticipant Schema
* **Collection Name:** `waitlistParticipants`
* **Fields:**
    * `_id`: `ObjectId` (auto-generated)
    * `serviceId`: `ObjectId` (Refers to `services`._id, Indexed, Required)
    * `email`: `String` (Indexed, Required - combined with `serviceId` for unique constraint)
    * `joinDate`: `Date` (Default: `Date.now`)
