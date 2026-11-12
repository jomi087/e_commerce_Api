# Implementation Notes – Technical Assessment

**Position:** Mid-Level Node.js Developer

## 1. Project Assumptions

- The frontend application is expected to run locally at `http://localhost:5173`.
- This origin has been configured in the backend to allow requests from the frontend during development.

## 2. Business Logic and Design Decisions

### Category Deletion

I implemented restrictions to maintain category relationships and data consistency.

- A category can only be deleted if it has no child categories.
- A category cannot be deleted while any product is referencing it.
- Once no child categories or product references remain, the category can be deleted.

This approach prevents categories from being deleted while they are still being used by other records.

## 3. Security Implementation

- Implemented Helmet to configure HTTP security-related response headers.
- Implemented access-token-based authentication.
- Kept the authentication implementation focused on access tokens within the available development time rather than introducing a complete access-token and refresh-token workflow.

## 4. Race Condition Handling

I considered concurrent operations that could result in duplicate or inconsistent data.

Examples include:

- Multiple users attempting to register or update their accounts using the same email address at approximately the same time.
- Multiple requests attempting to create a category with the same identifying information.

I implemented safeguards to handle these scenarios and reduce the possibility of duplicate records.

## 5. Database Consistency and Transactions

MongoDB transactions are used in critical order operations to maintain consistency between order records and product stock quantities.

- **Order Creation:** The order creation and corresponding stock updates are handled within a transaction.
- **Order Cancellation:** The order cancellation and stock restoration are handled within a transaction.

This helps ensure that related database operations succeed or fail together, preventing partial updates.

## 6. Logging

- Implemented a basic logging mechanism using a dedicated logger.
- Automated log-file cleanup or seven-day log retention has not been implemented due to time constraints.

## 7. Database Indexing

Added database indexes to support query performance and improve the efficiency of relevant database operations.

## 8. Potential Future Enhancements

Due to the limited time available for the assessment, I couldn't implement a few additional enhancements that I had considered:

- **Product Images:** Support product image uploads and management.
- **Product Variants:** Support different product variations, such as size, color, and other configurable attributes.
- **SEO-Friendly Product URLs:** Introduce product slugs instead of relying solely on product IDs in URLs to make URLs more readable and improve SEO.

These are enhancements I would consider adding with additional development time.

## 9. Development Approach

I focused on implementing the core business logic, maintaining a structured codebase, and applying appropriate backend development practices based on my understanding of Node.js, Express, TypeScript, and MongoDB.

I prioritized functionality, data consistency, error handling, and maintainability while keeping the implementation within the assessment timeframe.

---

**Note:** This document describes the assumptions, implementation decisions, and limitations considered during the technical assessment.
