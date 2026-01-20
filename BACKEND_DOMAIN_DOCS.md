# Domain Classes Documentation

This document provides comprehensive documentation for all domain classes in the RegManager API project.

## Table of Contents

1. [Overview](#overview)
2. [Base Entity](#base-entity)
3. [Core Domain Entities](#core-domain-entities)
   - [Tenant](#tenant)
   - [User](#user)
   - [Role](#role)
4. [Process Domain Entities](#process-domain-entities)
   - [Process](#process)
   - [ProcessClassification](#processclassification)
   - [ProcessSummary](#processsummary)
   - [OnGoingList](#ongoinglist)
   - [Protocol](#protocol)
5. [Authentication & Security](#authentication--security)
   - [RefreshToken](#refreshtoken)
6. [Logging & Audit](#logging--audit)
   - [UserInteractionLog](#userinteractionlog)
   - [UserAccessLog](#useraccesslog)
   - [DailyBotLog](#dailybotlog)
7. [Enumerations](#enumerations)
   - [InteractionType](#interactiontype)
8. [Entity Relationships Diagram](#entity-relationships-diagram)
9. [Common Annotations Reference](#common-annotations-reference)

---

## Overview

The RegManager API follows a Domain-Driven Design (DDD) approach with clearly separated domain entities. All domain classes are located under the `com.rioanalytics.regmanager_api.domain` package, organized by aggregate roots.

### Package Structure

```
com.rioanalytics.regmanager_api.domain/
├── base/                    # Base entity with audit fields
├── daily_bot_log/           # Bot execution logging
├── on_going_list/           # Process ongoing tracking
├── process/                 # Core process entity
├── process_classification/  # Process categorization
├── process_summary/         # AI-generated process summaries
├── protocol/                # Process protocol records
├── refresh_token/           # JWT refresh token management
├── role/                    # User roles
├── tenants/                 # Multi-tenant support
├── user/                    # User management
├── user_access_log/         # User login tracking
└── user_interaction_log/    # AI interaction logging
```

---

## Base Entity

### BaseEntity

**Location:** `com.rioanalytics.regmanager_api.domain.base.BaseEntity`

Abstract base class providing audit and soft-delete functionality inherited by most domain entities.

#### Annotations

| Annotation                                                  | Purpose                                       |
| ----------------------------------------------------------- | --------------------------------------------- |
| `@MappedSuperclass`                                         | Allows JPA inheritance without separate table |
| `@EntityListeners(AuditingEntityListener.class)`            | Enables Spring Data JPA auditing              |
| `@Getter`, `@Setter`, `@SuperBuilder`, `@NoArgsConstructor` | Lombok annotations                            |

#### Fields

| Field       | Type      | Description                       | Annotations                       |
| ----------- | --------- | --------------------------------- | --------------------------------- |
| `enabled`   | `boolean` | Soft-delete flag (default: true)  | -                                 |
| `createdBy` | `String`  | User who created the record       | `@CreatedBy`, `updatable=false`   |
| `updatedBy` | `String`  | User who last modified the record | `@LastModifiedBy`                 |
| `createdAt` | `Instant` | Creation timestamp                | `@CreatedDate`, `updatable=false` |
| `updatedAt` | `Instant` | Last modification timestamp       | `@LastModifiedDate`               |

---

## Core Domain Entities

### Tenant

**Location:** `com.rioanalytics.regmanager_api.domain.tenants.Tenant`

**Table:** `tenants`

Represents an organization/company in the multi-tenant architecture. All data is segregated by tenant.

#### Fields

| Field        | Type     | Nullable | Description                  |
| ------------ | -------- | -------- | ---------------------------- |
| `id`         | `Long`   | No       | Primary key (auto-generated) |
| `name`       | `String` | No       | Tenant/organization name     |
| `tenantLogo` | `String` | Yes      | URL to tenant logo           |

_Inherits audit fields from BaseEntity_

#### Domain Methods

| Method                       | Description                       |
| ---------------------------- | --------------------------------- |
| `updateName(String name)`    | Validates and updates tenant name |
| `updateLogo(String logoUrl)` | Updates tenant logo URL           |

#### Relationships

- Referenced by: `User`, `Process`, `UserInteractionLog`, `UserAccessLog`

---

### User

**Location:** `com.rioanalytics.regmanager_api.domain.user.User`

**Table:** `users`

Represents a system user with authentication credentials and role assignments.

#### Fields

| Field            | Type            | Nullable | Description                  |
| ---------------- | --------------- | -------- | ---------------------------- |
| `id`             | `Long`          | No       | Primary key (auto-generated) |
| `tenant`         | `Tenant`        | No       | Associated tenant (FK)       |
| `name`           | `String`        | No       | User's display name          |
| `email`          | `String`        | No       | Unique email address         |
| `password`       | `String`        | No       | Hashed password              |
| `roles`          | `Set<Role>`     | No       | Assigned roles               |
| `lastLoggedInAt` | `ZonedDateTime` | Yes      | Last login timestamp         |

_Inherits audit fields from BaseEntity_

#### Domain Methods

| Method                            | Description                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| `recordLogin()`                   | Updates `lastLoggedInAt` with Brazil timezone (America/Sao_Paulo) |
| `changePassword(String password)` | Validates and updates password                                    |
| `assignRole(Role role)`           | Adds a role to the user                                           |
| `removeRole(Role role)`           | Removes a role from the user                                      |
| `hasRole(String roleName)`        | Checks if user has a specific role                                |

#### Relationships

| Relationship | Type         | Entity   | Fetch | Join               |
| ------------ | ------------ | -------- | ----- | ------------------ |
| `tenant`     | Many-to-One  | `Tenant` | EAGER | `tenantId`         |
| `roles`      | Many-to-Many | `Role`   | EAGER | `user_roles` table |

---

### Role

**Location:** `com.rioanalytics.regmanager_api.domain.role.Role`

**Table:** `roles`

Represents a security role for authorization purposes.

#### Fields

| Field  | Type     | Nullable | Description                              |
| ------ | -------- | -------- | ---------------------------------------- |
| `id`   | `Long`   | No       | Primary key (auto-generated)             |
| `name` | `String` | No       | Unique role name (e.g., "ADMIN", "USER") |

#### Relationships

- Many-to-Many with `User` via `user_roles` join table

---

## Process Domain Entities

### Process

**Location:** `com.rioanalytics.regmanager_api.domain.process.Process`

**Table:** `process`

Core entity representing a regulatory process being tracked in the system.

#### Fields

| Field               | Type                    | Nullable | Description                         |
| ------------------- | ----------------------- | -------- | ----------------------------------- |
| `id`                | `UUID`                  | No       | Primary key (auto-generated)        |
| `processNumber`     | `String`                | No       | Unique process identifier number    |
| `classification`    | `ProcessClassification` | No       | Process category/type               |
| `tenant`            | `Tenant`                | Yes      | Associated tenant                   |
| `generationDate`    | `Instant`               | No       | Process creation date               |
| `lastUpdateDate`    | `Instant`               | No       | Last update from source             |
| `interestedParties` | `List<String>`          | No       | List of interested parties          |
| `pdfUrl`            | `String`                | No       | URL to process PDF document         |
| `isFavorite`        | `boolean`               | No       | User favorite flag (default: false) |

_Inherits audit fields from BaseEntity_

#### Domain Methods

| Method                                        | Description                                         |
| --------------------------------------------- | --------------------------------------------------- |
| `addInterestedParty(String party)`            | Adds party to list (validates, prevents duplicates) |
| `removeInterestedParty(String party)`         | Removes party from list                             |
| `updateLastUpdateDate(Instant date)`          | Validates date is not before generation date        |
| `updateProcessNumber(String number)`          | Validates and updates process number                |
| `updatePdfUrl(String url)`                    | Validates and updates PDF URL                       |
| `updateClassification(ProcessClassification)` | Updates classification reference                    |
| `updateGenerationDate(Instant date)`          | Validates against lastUpdateDate                    |
| `updateIsFavorite(boolean favorite)`          | Updates favorite status                             |
| `updateTenant(Tenant tenant)`                 | Updates tenant reference                            |

#### Relationships

| Relationship     | Type        | Entity                  | Fetch | Description  |
| ---------------- | ----------- | ----------------------- | ----- | ------------ |
| `classification` | Many-to-One | `ProcessClassification` | EAGER | Process type |
| `tenant`         | Many-to-One | `Tenant`                | LAZY  | Owner tenant |

#### Related Entities

- `OnGoingList` - Process movement history
- `Protocol` - Associated protocols
- `ProcessSummary` - AI-generated summary

---

### ProcessClassification

**Location:** `com.rioanalytics.regmanager_api.domain.process_classification.ProcessClassification`

**Table:** `process_classification`

Categorization/type definition for processes.

#### Fields

| Field          | Type     | Nullable | Description                  |
| -------------- | -------- | -------- | ---------------------------- |
| `id`           | `Long`   | No       | Primary key (auto-generated) |
| `name`         | `String` | No       | Full classification name     |
| `abbreviation` | `String` | No       | Short code/abbreviation      |
| `category`     | `String` | No       | Main category                |
| `subCategory`  | `String` | No       | Sub-category                 |

_Inherits audit fields from BaseEntity_

#### Domain Methods

| Method                                  | Description                        |
| --------------------------------------- | ---------------------------------- |
| `updateName(String name)`               | Validates and updates name         |
| `updateAbbreviation(String abbr)`       | Validates and updates abbreviation |
| `updateCategory(String category)`       | Validates and updates category     |
| `updateSubCategory(String subCategory)` | Validates and updates sub-category |

---

### ProcessSummary

**Location:** `com.rioanalytics.regmanager_api.domain.process_summary.ProcessSummary`

**Table:** `process_summary`

Stores AI-generated summaries for processes.

#### Fields

| Field              | Type      | Nullable | Description                            |
| ------------------ | --------- | -------- | -------------------------------------- |
| `id`               | `UUID`    | No       | Primary key (auto-generated)           |
| `process`          | `Process` | No       | Associated process (unique constraint) |
| `summaryData`      | `Object`  | No       | JSON summary data (stored as JSONB)    |
| `lastSummarizedAt` | `Instant` | Yes      | Last summary generation timestamp      |

_Inherits audit fields from BaseEntity_

#### Relationships

| Relationship | Type        | Entity    | Fetch | Description                      |
| ------------ | ----------- | --------- | ----- | -------------------------------- |
| `process`    | Many-to-One | `Process` | LAZY  | One-to-one via unique constraint |

---

### OnGoingList

**Location:** `com.rioanalytics.regmanager_api.domain.on_going_list.OnGoingList`

**Table:** `on_going_list`

Tracks the movement/progress history of a process through different units.

#### Fields

| Field                | Type      | Nullable | Description                  |
| -------------------- | --------- | -------- | ---------------------------- |
| `id`                 | `UUID`    | No       | Primary key (auto-generated) |
| `process`            | `Process` | No       | Associated process           |
| `onGoingDate`        | `Instant` | No       | Date of movement             |
| `onGoingUnit`        | `String`  | No       | Unit/department name         |
| `onGoingDescription` | `String`  | No       | Movement description         |

_Inherits audit fields from BaseEntity_

#### Domain Methods

| Method                                  | Description                       |
| --------------------------------------- | --------------------------------- |
| `updateOnGoingUnit(String unit)`        | Validates and updates unit        |
| `updateOnGoingDescription(String desc)` | Validates and updates description |
| `updateOnGoingDate(Instant date)`       | Validates and updates date        |
| `updateProcess(Process process)`        | Updates process reference         |

#### Relationships

| Relationship | Type        | Entity    | Fetch |
| ------------ | ----------- | --------- | ----- |
| `process`    | Many-to-One | `Process` | LAZY  |

---

### Protocol

**Location:** `com.rioanalytics.regmanager_api.domain.protocol.Protocol`

**Table:** `protocols`

Represents protocol records associated with a process.

#### Fields

| Field                | Type      | Nullable | Description                  |
| -------------------- | --------- | -------- | ---------------------------- |
| `id`                 | `UUID`    | No       | Primary key (auto-generated) |
| `process`            | `Process` | No       | Associated process           |
| `protocolNumber`     | `String`  | No       | Protocol identifier          |
| `protocolType`       | `String`  | No       | Type of protocol             |
| `protocolUnit`       | `String`  | No       | Issuing unit                 |
| `protocolCreatedAt`  | `Instant` | No       | Protocol creation date       |
| `protocolIncludedAt` | `Instant` | No       | Date added to system         |

_Inherits audit fields from BaseEntity_

#### Domain Methods

| Method                                   | Description               |
| ---------------------------------------- | ------------------------- |
| `updateProtocolNumber(String number)`    | Validates and updates     |
| `updateProtocolType(String type)`        | Validates and updates     |
| `updateProtocolUnit(String unit)`        | Validates and updates     |
| `updateProtocolCreatedAt(Instant date)`  | Validates and updates     |
| `updateProtocolIncludedAt(Instant date)` | Validates and updates     |
| `updateProcess(Process process)`         | Updates process reference |

#### Relationships

| Relationship | Type        | Entity    | Fetch |
| ------------ | ----------- | --------- | ----- |
| `process`    | Many-to-One | `Process` | LAZY  |

---

## Authentication & Security

### RefreshToken

**Location:** `com.rioanalytics.regmanager_api.domain.refresh_token.RefreshToken`

**Table:** `refresh_tokens`

Stores JWT refresh tokens for session management.

#### Fields

| Field       | Type      | Nullable | Description                          |
| ----------- | --------- | -------- | ------------------------------------ |
| `id`        | `Long`    | No       | Primary key (auto-generated)         |
| `token`     | `String`  | No       | Unique refresh token (max 512 chars) |
| `user`      | `User`    | No       | Token owner                          |
| `expiry`    | `Instant` | No       | Token expiration timestamp           |
| `createdAt` | `Instant` | No       | Creation timestamp                   |

#### Relationships

| Relationship | Type        | Entity | Fetch |
| ------------ | ----------- | ------ | ----- |
| `user`       | Many-to-One | `User` | LAZY  |

---

## Logging & Audit

### UserInteractionLog

**Location:** `com.rioanalytics.regmanager_api.domain.user_interaction_log.UserInteractionLog`

**Table:** `user_interaction_logs`

Logs user interactions with the AI assistant and system features.

#### Fields

| Field               | Type              | Nullable | Description                        |
| ------------------- | ----------------- | -------- | ---------------------------------- |
| `id`                | `Long`            | No       | Primary key (auto-generated)       |
| `user`              | `User`            | No       | User who performed the interaction |
| `tenant`            | `Tenant`          | No       | User's tenant                      |
| `interactionType`   | `InteractionType` | No       | Type of interaction (enum)         |
| `threadId`          | `String`          | Yes      | OpenAI conversation thread ID      |
| `runId`             | `String`          | Yes      | OpenAI run ID                      |
| `userMessage`       | `String`          | Yes      | User's message (TEXT)              |
| `assistantResponse` | `String`          | Yes      | AI response (TEXT)                 |
| `metadata`          | `String`          | Yes      | Additional metadata (TEXT)         |
| `status`            | `String`          | Yes      | Interaction status (max 50 chars)  |
| `tokensUsed`        | `Integer`         | Yes      | Token consumption                  |
| `responseTimeMs`    | `Long`            | Yes      | Response time in milliseconds      |
| `ipAddress`         | `String`          | Yes      | Client IP address (max 45 chars)   |
| `userAgent`         | `String`          | Yes      | Client user agent (TEXT)           |

_Inherits audit fields from BaseEntity_

#### Relationships

| Relationship | Type        | Entity   | Fetch |
| ------------ | ----------- | -------- | ----- |
| `user`       | Many-to-One | `User`   | LAZY  |
| `tenant`     | Many-to-One | `Tenant` | LAZY  |

---

### UserAccessLog

**Location:** `com.rioanalytics.regmanager_api.domain.user_access_log.UserAccessLog`

**Table:** `user_access_logs`

Tracks user login events for security and analytics.

#### Fields

| Field        | Type            | Nullable | Description                      |
| ------------ | --------------- | -------- | -------------------------------- |
| `id`         | `Long`          | No       | Primary key (auto-generated)     |
| `user`       | `User`          | No       | User who logged in               |
| `tenant`     | `Tenant`        | No       | User's tenant                    |
| `ipAddress`  | `String`        | Yes      | Client IP address (max 45 chars) |
| `userAgent`  | `String`        | Yes      | Client user agent (TEXT)         |
| `loggedInAt` | `ZonedDateTime` | No       | Login timestamp                  |

_Inherits audit fields from BaseEntity_

#### Domain Methods

| Method                                                          | Description                                      |
| --------------------------------------------------------------- | ------------------------------------------------ |
| `createForLogin(User user, String ipAddress, String userAgent)` | Static factory method for creating login records |

#### Relationships

| Relationship | Type        | Entity   | Fetch |
| ------------ | ----------- | -------- | ----- |
| `user`       | Many-to-One | `User`   | LAZY  |
| `tenant`     | Many-to-One | `Tenant` | LAZY  |

---

### DailyBotLog

**Location:** `com.rioanalytics.regmanager_api.domain.daily_bot_log.DailyBotLog`

**Table:** `daily_bot_logs`

Tracks daily bot execution statistics.

#### Fields

| Field             | Type      | Nullable | Description                  |
| ----------------- | --------- | -------- | ---------------------------- |
| `id`              | `Long`    | No       | Primary key (auto-generated) |
| `createdAt`       | `Instant` | No       | Record creation timestamp    |
| `updatedAt`       | `Instant` | No       | Last update timestamp        |
| `numberOfUpdates` | `Integer` | No       | Number of updates performed  |

**Note:** This entity does NOT extend `BaseEntity`; it manages its own timestamp fields.

---

## Enumerations

### InteractionType

**Location:** `com.rioanalytics.regmanager_api.domain.user_interaction_log.InteractionType`

Defines types of user interactions logged in the system.

| Value               | Description                         |
| ------------------- | ----------------------------------- |
| `CHAT_MESSAGE`      | Chat message sent to AI assistant   |
| `THREAD_CREATED`    | New conversation thread was created |
| `PROCESS_VIEW`      | User viewed a process               |
| `PROCESS_SEARCH`    | User performed a process search     |
| `DOCUMENT_DOWNLOAD` | User downloaded a document          |
| `LOGIN`             | User logged in                      |
| `LOGOUT`            | User logged out                     |
| `OTHER`             | Other interaction type              |

---

## Entity Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TENANT (Multi-tenant Root)                      │
│                                                                             │
│  ┌──────────┐                                                               │
│  │  Tenant  │                                                               │
│  └────┬─────┘                                                               │
│       │                                                                     │
│       ├──────────────────┬──────────────────┬──────────────────┐           │
│       │                  │                  │                  │           │
│       ▼                  ▼                  ▼                  ▼           │
│  ┌─────────┐      ┌───────────┐    ┌────────────────┐  ┌──────────────┐   │
│  │  User   │      │  Process  │    │UserInteraction │  │ UserAccess   │   │
│  └────┬────┘      └─────┬─────┘    │     Log        │  │    Log       │   │
│       │                 │          └────────────────┘  └──────────────┘   │
│       │                 │                                                  │
└───────┼─────────────────┼──────────────────────────────────────────────────┘
        │                 │
        │                 │
   ┌────┴────┐            ├────────────────┬─────────────────┬────────────────┐
   │         │            │                │                 │                │
   ▼         ▼            ▼                ▼                 ▼                ▼
┌──────┐  ┌──────────┐  ┌──────────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────┐
│ Role │  │ Refresh  │  │  Process     │ │ OnGoing   │ │ Protocol │ │   Process    │
│(M:M) │  │  Token   │  │Classification│ │   List    │ │          │ │   Summary    │
└──────┘  └──────────┘  └──────────────┘ └───────────┘ └──────────┘ └──────────────┘
```

### Relationship Summary

| From               | To                    | Type         | Description                   |
| ------------------ | --------------------- | ------------ | ----------------------------- |
| User               | Tenant                | Many-to-One  | User belongs to a tenant      |
| User               | Role                  | Many-to-Many | Users have multiple roles     |
| RefreshToken       | User                  | Many-to-One  | Token belongs to a user       |
| Process            | Tenant                | Many-to-One  | Process belongs to a tenant   |
| Process            | ProcessClassification | Many-to-One  | Process has a classification  |
| OnGoingList        | Process               | Many-to-One  | Movement belongs to a process |
| Protocol           | Process               | Many-to-One  | Protocol belongs to a process |
| ProcessSummary     | Process               | One-to-One   | Summary for a process         |
| UserInteractionLog | User                  | Many-to-One  | Log entry for a user          |
| UserInteractionLog | Tenant                | Many-to-One  | Log entry for a tenant        |
| UserAccessLog      | User                  | Many-to-One  | Access log for a user         |
| UserAccessLog      | Tenant                | Many-to-One  | Access log for a tenant       |

---

## Common Annotations Reference

### JPA Annotations

| Annotation                        | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `@Entity`                         | Marks class as JPA entity                       |
| `@Table(name = "...")`            | Specifies database table name                   |
| `@Id`                             | Marks primary key field                         |
| `@GeneratedValue(strategy = ...)` | Auto-generation strategy (IDENTITY, AUTO)       |
| `@Column(...)`                    | Column configuration (nullable, unique, length) |
| `@ManyToOne(fetch = ...)`         | Many-to-one relationship                        |
| `@ManyToMany(fetch = ...)`        | Many-to-many relationship                       |
| `@JoinColumn(name = "...")`       | Foreign key column specification                |
| `@JoinTable(name = "...")`        | Join table for many-to-many                     |
| `@ElementCollection`              | Collection of basic/embeddable types            |
| `@Enumerated(EnumType.STRING)`    | Maps enum to database as string                 |
| `@MappedSuperclass`               | Inheritance without separate table              |

### Spring Data JPA Auditing

| Annotation                                       | Purpose                               |
| ------------------------------------------------ | ------------------------------------- |
| `@EntityListeners(AuditingEntityListener.class)` | Enables auditing                      |
| `@CreatedBy`                                     | Auto-populates with current user      |
| `@LastModifiedBy`                                | Auto-populates with modifier          |
| `@CreatedDate`                                   | Auto-populates creation timestamp     |
| `@LastModifiedDate`                              | Auto-populates modification timestamp |

### Lombok Annotations

| Annotation                              | Purpose                                                |
| --------------------------------------- | ------------------------------------------------------ |
| `@Data`                                 | Generates getters, setters, equals, hashCode, toString |
| `@Builder`                              | Generates builder pattern                              |
| `@SuperBuilder`                         | Builder with inheritance support                       |
| `@NoArgsConstructor`                    | No-argument constructor                                |
| `@AllArgsConstructor`                   | All-arguments constructor                              |
| `@EqualsAndHashCode(callSuper = false)` | Customizes equals/hashCode                             |
| `@Getter`, `@Setter`                    | Individual accessor methods                            |

### Hibernate Specific

| Annotation                     | Purpose                         |
| ------------------------------ | ------------------------------- |
| `@JdbcTypeCode(SqlTypes.JSON)` | Maps field to JSON/JSONB column |

---

## Database Tables Summary

| Entity                | Table Name               | Primary Key Type  |
| --------------------- | ------------------------ | ----------------- |
| Tenant                | `tenants`                | `Long` (IDENTITY) |
| User                  | `users`                  | `Long` (IDENTITY) |
| Role                  | `roles`                  | `Long` (IDENTITY) |
| RefreshToken          | `refresh_tokens`         | `Long` (IDENTITY) |
| Process               | `process`                | `UUID` (AUTO)     |
| ProcessClassification | `process_classification` | `Long` (IDENTITY) |
| ProcessSummary        | `process_summary`        | `UUID` (AUTO)     |
| OnGoingList           | `on_going_list`          | `UUID` (AUTO)     |
| Protocol              | `protocols`              | `UUID` (AUTO)     |
| UserInteractionLog    | `user_interaction_logs`  | `Long` (IDENTITY) |
| UserAccessLog         | `user_access_logs`       | `Long` (IDENTITY) |
| DailyBotLog           | `daily_bot_logs`         | `Long` (IDENTITY) |

### Join Tables

| Table                        | Purpose                               |
| ---------------------------- | ------------------------------------- |
| `user_roles`                 | User ↔ Role many-to-many              |
| `process_interested_parties` | Process interested parties collection |

---

_Documentation generated from source code analysis of the RegManager API project._
