# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require a JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Response:** `201 Created`
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

---

## Document Endpoints

### 1. Get All Documents
**GET** `/documents`

**Query Parameters:**
- `status` - Filter by status (submitted, in-progress, approved, expiring, expired)
- `category` - Filter by category
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:** `200 OK`
```json
{
  "documents": [
    {
      "id": "string",
      "title": "string",
      "status": "string",
      "category": "string",
      "expiryDate": "ISO_DATE",
      "fileUrl": "string"
    }
  ],
  "total": "number",
  "page": "number"
}
```

---

### 2. Get Document by ID
**GET** `/documents/:id`

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "category": "string",
  "expiryDate": "ISO_DATE",
  "uploadedAt": "ISO_DATE",
  "fileUrl": "string"
}
```

---

### 3. Upload/Create Document
**POST** `/documents`

**Request Body:** (multipart/form-data)
- `title` - Document title
- `description` - Document description
- `category` - Document category
- `file` - File to upload (binary)
- `expiryDate` - (Optional) Expiry date (ISO format)

**Response:** `201 Created`
```json
{
  "id": "string",
  "title": "string",
  "fileUrl": "string",
  "status": "submitted"
}
```

---

### 4. Update Document
**PUT** `/documents/:id`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "expiryDate": "ISO_DATE"
}
```

**Response:** `200 OK`
```json
{
  "message": "Document updated successfully",
  "document": {}
}
```

---

### 5. Delete Document
**DELETE** `/documents/:id`

**Response:** `200 OK`
```json
{
  "message": "Document deleted successfully"
}
```

---

### 6. Get Document Summary
**GET** `/documents/:id/summary`

**Response:** `200 OK`
```json
{
  "summary": "string",
  "keyPoints": ["string"],
  "suggestedActions": ["string"],
  "importance": "low|medium|high|critical"
}
```

---

## Reminder Endpoints

### 1. Get All Reminders
**GET** `/reminders`

**Query Parameters:**
- `read` - Filter by read status (true/false)
- `type` - Filter by reminder type (expiry, renewal, review, custom)

**Response:** `200 OK`
```json
{
  "reminders": [
    {
      "id": "string",
      "document": "string",
      "reminderType": "string",
      "reminderDate": "ISO_DATE",
      "read": "boolean"
    }
  ]
}
```

---

### 2. Create Reminder
**POST** `/reminders`

**Request Body:**
```json
{
  "documentId": "string",
  "reminderType": "expiry|renewal|review|custom",
  "reminderDate": "ISO_DATE",
  "daysBeforeExpiry": "number",
  "notificationMethod": "email|in-app|both"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "message": "Reminder created successfully"
}
```

---

### 3. Mark Reminder as Read
**PUT** `/reminders/:id/read`

**Response:** `200 OK`
```json
{
  "message": "Reminder marked as read"
}
```

---

### 4. Delete Reminder
**DELETE** `/reminders/:id`

**Response:** `200 OK`
```json
{
  "message": "Reminder deleted successfully"
}
```

---

## Summary Endpoints

### 1. Generate Summary
**POST** `/summaries/generate`

**Request Body:**
```json
{
  "documentId": "string"
}
```

**Response:** `201 Created`
```json
{
  "summary": "string",
  "keyPoints": ["string"],
  "suggestedActions": ["string"],
  "readabilityScore": "number",
  "importance": "string"
}
```

---

## User Endpoints

### 1. Get Profile
**GET** `/users/profile`

**Response:** `200 OK`
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string"
}
```

---

### 2. Update Profile
**PUT** `/users/profile`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "department": "string"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication token required or invalid"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error occurred"
}
```

---

## Status Codes
- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
