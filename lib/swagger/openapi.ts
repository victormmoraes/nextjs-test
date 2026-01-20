import { OpenAPIV3 } from "openapi-types";

export const openApiSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "RegManager API",
    description: "API for managing regulatory processes, users, and tenants",
    version: "1.0.0",
    contact: {
      name: "RegManager Support",
    },
  },
  servers: [
    {
      url: "/api",
      description: "API Server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Users", description: "User management" },
    { name: "Roles", description: "Role management" },
    { name: "Tenants", description: "Tenant management" },
    { name: "Processes", description: "Process management" },
    { name: "Classifications", description: "Process classification management" },
    { name: "Logs", description: "Logging endpoints" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token",
      },
    },
    schemas: {
      // Common schemas
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string" },
          code: { type: "string" },
          details: { type: "object" },
        },
      },
      PaginatedResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "array", items: { type: "object" } },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              pageSize: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
      // Auth schemas
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@example.com" },
          password: { type: "string", example: "admin123" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      RefreshRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string" },
          newPassword: { type: "string", minLength: 8 },
        },
      },
      // User schemas
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          tenantId: { type: "integer" },
          lastLoggedInAt: { type: "string", format: "date-time", nullable: true },
          enabled: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          roles: {
            type: "array",
            items: { $ref: "#/components/schemas/Role" },
          },
        },
      },
      CreateUserRequest: {
        type: "object",
        required: ["name", "email", "password", "tenantId"],
        properties: {
          name: { type: "string", minLength: 2 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          tenantId: { type: "integer" },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          email: { type: "string", format: "email" },
        },
      },
      // Role schemas
      Role: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          enabled: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateRoleRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 2 },
        },
      },
      // Tenant schemas
      Tenant: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          tenantLogo: { type: "string", nullable: true },
          enabled: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateTenantRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 2 },
          tenantLogo: { type: "string", nullable: true },
        },
      },
      UpdateTenantRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          tenantLogo: { type: "string", nullable: true },
        },
      },
      // Process schemas
      Process: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          processNumber: { type: "string" },
          classificationId: { type: "integer" },
          tenantId: { type: "integer", nullable: true },
          generationDate: { type: "string", format: "date-time" },
          lastUpdateDate: { type: "string", format: "date-time" },
          interestedParties: { type: "array", items: { type: "string" } },
          pdfUrl: { type: "string", nullable: true },
          isFavorite: { type: "boolean" },
          enabled: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          classification: { $ref: "#/components/schemas/ProcessClassification" },
          tenant: { $ref: "#/components/schemas/Tenant" },
        },
      },
      CreateProcessRequest: {
        type: "object",
        required: ["processNumber", "classificationId", "generationDate", "lastUpdateDate"],
        properties: {
          processNumber: { type: "string" },
          classificationId: { type: "integer" },
          tenantId: { type: "integer", nullable: true },
          generationDate: { type: "string", format: "date-time" },
          lastUpdateDate: { type: "string", format: "date-time" },
          interestedParties: { type: "array", items: { type: "string" }, default: [] },
          pdfUrl: { type: "string", nullable: true },
          isFavorite: { type: "boolean", default: false },
        },
      },
      UpdateProcessRequest: {
        type: "object",
        properties: {
          processNumber: { type: "string" },
          classificationId: { type: "integer" },
          generationDate: { type: "string", format: "date-time" },
          lastUpdateDate: { type: "string", format: "date-time" },
          pdfUrl: { type: "string", nullable: true },
        },
      },
      // Classification schemas
      ProcessClassification: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          abbreviation: { type: "string" },
          category: { type: "string" },
          subCategory: { type: "string" },
          enabled: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateClassificationRequest: {
        type: "object",
        required: ["name", "abbreviation", "category", "subCategory"],
        properties: {
          name: { type: "string" },
          abbreviation: { type: "string" },
          category: { type: "string" },
          subCategory: { type: "string" },
        },
      },
      // Summary schemas
      ProcessSummary: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          processId: { type: "string", format: "uuid" },
          summaryData: { type: "object" },
          lastSummarizedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateSummaryRequest: {
        type: "object",
        required: ["summaryData"],
        properties: {
          summaryData: { type: "object" },
        },
      },
      // OnGoing schemas
      OnGoingEntry: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          processId: { type: "string", format: "uuid" },
          onGoingDate: { type: "string", format: "date-time" },
          onGoingUnit: { type: "string" },
          onGoingDescription: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateOnGoingRequest: {
        type: "object",
        required: ["onGoingDate", "onGoingUnit", "onGoingDescription"],
        properties: {
          onGoingDate: { type: "string", format: "date-time" },
          onGoingUnit: { type: "string" },
          onGoingDescription: { type: "string" },
        },
      },
      // Protocol schemas
      Protocol: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          processId: { type: "string", format: "uuid" },
          protocolNumber: { type: "string" },
          protocolType: { type: "string" },
          protocolUnit: { type: "string" },
          protocolCreatedAt: { type: "string", format: "date-time" },
          protocolIncludedAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateProtocolRequest: {
        type: "object",
        required: ["protocolNumber", "protocolType", "protocolUnit", "protocolCreatedAt", "protocolIncludedAt"],
        properties: {
          protocolNumber: { type: "string" },
          protocolType: { type: "string" },
          protocolUnit: { type: "string" },
          protocolCreatedAt: { type: "string", format: "date-time" },
          protocolIncludedAt: { type: "string", format: "date-time" },
        },
      },
      // Log schemas
      UserInteractionLog: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          tenantId: { type: "integer" },
          interactionType: { type: "string", enum: ["CHAT_MESSAGE", "THREAD_CREATED", "PROCESS_VIEW", "PROCESS_SEARCH", "DOCUMENT_DOWNLOAD", "LOGIN", "LOGOUT", "OTHER"] },
          details: { type: "object", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreateInteractionLogRequest: {
        type: "object",
        required: ["interactionType"],
        properties: {
          interactionType: { type: "string", enum: ["CHAT_MESSAGE", "THREAD_CREATED", "PROCESS_VIEW", "PROCESS_SEARCH", "DOCUMENT_DOWNLOAD", "LOGIN", "LOGOUT", "OTHER"] },
          details: { type: "object", nullable: true },
        },
      },
      UserAccessLog: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          tenantId: { type: "integer" },
          ipAddress: { type: "string", nullable: true },
          userAgent: { type: "string", nullable: true },
          loginAt: { type: "string", format: "date-time" },
          logoutAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      DailyBotLog: {
        type: "object",
        properties: {
          id: { type: "integer" },
          tenantId: { type: "integer" },
          date: { type: "string", format: "date" },
          totalInteractions: { type: "integer" },
          uniqueUsers: { type: "integer" },
          processesViewed: { type: "integer" },
          searchesPerformed: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateBotLogRequest: {
        type: "object",
        required: ["date", "totalInteractions", "uniqueUsers", "processesViewed", "searchesPerformed"],
        properties: {
          date: { type: "string", format: "date" },
          totalInteractions: { type: "integer" },
          uniqueUsers: { type: "integer" },
          processesViewed: { type: "integer" },
          searchesPerformed: { type: "integer" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // Auth endpoints
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Authenticate user and get access tokens",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful login",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/LoginResponse" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        description: "Logout and invalidate refresh token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful logout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh tokens",
        description: "Get new access token using refresh token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Tokens refreshed",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/LoginResponse" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Invalid refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        description: "Get authenticated user's profile",
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/password": {
      put: {
        tags: ["Auth"],
        summary: "Change password",
        description: "Change authenticated user's password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePasswordRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Password changed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
          "400": {
            description: "Invalid current password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    // Users endpoints
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        description: "Get paginated list of users",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create user",
        description: "Create a new user (Admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateUserRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user",
        description: "Get user by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "User details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        description: "Update user by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Soft delete user by ID (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "User deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    "/users/{id}/roles": {
      post: {
        tags: ["Users"],
        summary: "Assign role to user",
        description: "Assign a role to a user (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["roleId"],
                properties: {
                  roleId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Role assigned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Remove role from user",
        description: "Remove a role from a user (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["roleId"],
                properties: {
                  roleId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Role removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    // Roles endpoints
    "/roles": {
      get: {
        tags: ["Roles"],
        summary: "List roles",
        description: "Get all roles",
        responses: {
          "200": {
            description: "List of roles",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Role" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Roles"],
        summary: "Create role",
        description: "Create a new role (Admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRoleRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Role created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Role" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/roles/{id}": {
      get: {
        tags: ["Roles"],
        summary: "Get role",
        description: "Get role by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Role details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Role" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Roles"],
        summary: "Update role",
        description: "Update role by ID (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRoleRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Role updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Role" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Roles"],
        summary: "Delete role",
        description: "Soft delete role by ID (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Role deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    // Tenants endpoints
    "/tenants": {
      get: {
        tags: ["Tenants"],
        summary: "List tenants",
        description: "Get all tenants (Admin only)",
        responses: {
          "200": {
            description: "List of tenants",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Tenant" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tenants"],
        summary: "Create tenant",
        description: "Create a new tenant (Admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTenantRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Tenant created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Tenant" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/tenants/{id}": {
      get: {
        tags: ["Tenants"],
        summary: "Get tenant",
        description: "Get tenant by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Tenant details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Tenant" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Tenants"],
        summary: "Update tenant",
        description: "Update tenant by ID (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTenantRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Tenant updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Tenant" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Tenants"],
        summary: "Delete tenant",
        description: "Soft delete tenant by ID (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Tenant deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    // Classifications endpoints
    "/classifications": {
      get: {
        tags: ["Classifications"],
        summary: "List classifications",
        description: "Get all process classifications",
        responses: {
          "200": {
            description: "List of classifications",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/ProcessClassification" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Classifications"],
        summary: "Create classification",
        description: "Create a new process classification (Admin only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateClassificationRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Classification created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/ProcessClassification" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/classifications/{id}": {
      get: {
        tags: ["Classifications"],
        summary: "Get classification",
        description: "Get classification by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Classification details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/ProcessClassification" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Classifications"],
        summary: "Update classification",
        description: "Update classification by ID (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateClassificationRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Classification updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/ProcessClassification" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Classifications"],
        summary: "Delete classification",
        description: "Soft delete classification by ID (Admin only)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Classification deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    // Processes endpoints
    "/processes": {
      get: {
        tags: ["Processes"],
        summary: "List processes",
        description: "Get paginated list of processes",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by process number or interested parties" },
          { name: "classificationId", in: "query", schema: { type: "integer" } },
          { name: "isFavorite", in: "query", schema: { type: "boolean" } },
        ],
        responses: {
          "200": {
            description: "List of processes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Processes"],
        summary: "Create process",
        description: "Create a new process",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProcessRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Process created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Process" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/processes/{id}": {
      get: {
        tags: ["Processes"],
        summary: "Get process",
        description: "Get process by ID with all related data",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Process details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Process" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Processes"],
        summary: "Update process",
        description: "Update process by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProcessRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Process updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Process" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Processes"],
        summary: "Delete process",
        description: "Soft delete process by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Process deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    "/processes/{id}/favorite": {
      post: {
        tags: ["Processes"],
        summary: "Toggle favorite",
        description: "Toggle process favorite status",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Favorite toggled",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Process" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/processes/{id}/parties": {
      post: {
        tags: ["Processes"],
        summary: "Add interested party",
        description: "Add an interested party to the process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["party"],
                properties: {
                  party: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Party added",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Process" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Processes"],
        summary: "Remove interested party",
        description: "Remove an interested party from the process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["party"],
                properties: {
                  party: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Party removed",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Process" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/processes/{id}/summary": {
      get: {
        tags: ["Processes"],
        summary: "Get process summary",
        description: "Get the summary for a process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Process summary",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/ProcessSummary" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Processes"],
        summary: "Create/Update process summary",
        description: "Create or update the summary for a process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSummaryRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Summary created/updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/ProcessSummary" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Processes"],
        summary: "Delete process summary",
        description: "Delete the summary for a process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Summary deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    "/processes/{id}/ongoing": {
      get: {
        tags: ["Processes"],
        summary: "List ongoing entries",
        description: "Get all ongoing entries for a process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "List of ongoing entries",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/OnGoingEntry" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Processes"],
        summary: "Add ongoing entry",
        description: "Add a new ongoing entry to a process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOnGoingRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Ongoing entry created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/OnGoingEntry" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/processes/{id}/protocols": {
      get: {
        tags: ["Processes"],
        summary: "List protocols",
        description: "Get all protocols for a process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "List of protocols",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Protocol" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Processes"],
        summary: "Add protocol",
        description: "Add a new protocol to a process",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProtocolRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Protocol created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Protocol" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    // Logs endpoints
    "/logs/interactions": {
      get: {
        tags: ["Logs"],
        summary: "List interaction logs",
        description: "Get paginated list of user interaction logs",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
          { name: "userId", in: "query", schema: { type: "integer" } },
          { name: "interactionType", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "List of interaction logs",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Logs"],
        summary: "Create interaction log",
        description: "Log a user interaction",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateInteractionLogRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Log created",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/UserInteractionLog" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/logs/access": {
      get: {
        tags: ["Logs"],
        summary: "List access logs",
        description: "Get paginated list of user access logs",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
          { name: "userId", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "List of access logs",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" },
              },
            },
          },
        },
      },
    },
    "/logs/bot": {
      get: {
        tags: ["Logs"],
        summary: "List bot logs",
        description: "Get paginated list of daily bot logs",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: {
          "200": {
            description: "List of bot logs",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Logs"],
        summary: "Create/Update bot log",
        description: "Create or update daily bot statistics",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBotLogRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Bot log created/updated",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/DailyBotLog" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
};
