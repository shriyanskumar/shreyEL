# Project Requirements & Specifications

## Functional Requirements

### 1. Document Management
- ✅ Upload and store documents securely
- ✅ Assign document metadata (name, category, expiry date)
- ✅ View documents in structured lists
- ✅ Edit document information
- ✅ Delete documents

### 2. Status Tracking
Supported statuses:
- **Submitted** - Initial document submission
- **In Progress** - Document being reviewed
- **Approved** - Document approved by reviewer
- **Expiring** - Document approaching expiration
- **Expired** - Document has expired

Features:
- Visual indicators for each status
- Filter and search by status
- Status change history tracking

### 3. Guides & Procedures
- Step-by-step documentation guides
- Contextual instructions based on document type
- Editable content for future expansion
- Categorized guides (license, certificate, permit, insurance, contract)

### 4. Reminders & Notifications
- Automated reminders for upcoming expirations
- Renewal deadline reminders
- Configurable reminder intervals (days before expiry)
- Email and in-app notifications
- Read/unread status tracking

### 5. AI Summaries & Guidance
- AI-generated summaries of uploaded documents
- Simplified explanations of document purpose
- Key point extraction
- Suggestions for next actions (e.g., renewal steps)
- Document importance assessment
- Readability scoring

### 6. User Management
- User registration and login
- Role-based access control (Admin, User, Reviewer)
- Profile management
- Secure password handling

---

## Non-Functional Requirements

### Performance
- Document retrieval: < 2 seconds
- Search functionality: < 1 second
- API response time: < 500ms
- Support minimum 100 concurrent users

### Security
- JWT-based authentication
- Password encryption (bcryptjs)
- CORS protection
- Input validation and sanitization
- Secure file upload handling
- Role-based access control

### Scalability
- Modular architecture
- Microservice-ready design
- Database indexing for performance
- Stateless API design

### Reliability
- Error handling and logging
- Input validation
- Database transaction support
- Graceful error messages

### Usability
- Responsive UI (desktop-first)
- Intuitive navigation
- Clear status indicators
- Accessible forms and inputs
- Fast load times

### Maintainability
- Clean code structure
- Well-documented APIs
- Clear separation of concerns
- Consistent naming conventions
- Modular components

---

## Technology Stack

### Frontend
- **Framework**: React.js (v18)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3 (Rogue Color Theme)
- **Icons**: React Icons
- **Build Tool**: Create React App

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js (v4)
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **CORS**: cors
- **Environment**: dotenv

### AI Module
- **Language**: Python (v3.8+)
- **Web Framework**: Flask
- **NLP Libraries**: spaCy, Transformers
- **ML Framework**: PyTorch
- **PDF Processing**: PyPDF2
- **Data Science**: NumPy, scikit-learn

### Database
- **Primary**: MongoDB
- **Type**: NoSQL, document-oriented
- **Collections**:
  - Users
  - Documents
  - Reminders
  - Guides
  - Summaries

### DevOps & Tools
- **Version Control**: Git
- **Package Managers**: npm, pip
- **API Testing**: Postman
- **Authentication**: JWT
- **Environment Management**: dotenv

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   User Browser                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   Frontend (React.js)      │
         │ - Components               │
         │ - Routing                  │
         │ - State Management         │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │ Backend API (Express.js)   │
         │ - Authentication           │
         │ - Document Management      │
         │ - Reminder Scheduling      │
         │ - User Management          │
         └──────────────┬──────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼──────┐  ┌───▼────┐  ┌─────▼─────┐
    │ MongoDB   │  │ AI     │  │ Email     │
    │ Database  │  │ Module │  │ Service   │
    │           │  │(Python)│  │           │
    └───────────┘  └────────┘  └───────────┘
```

---

## Data Models

### User
```
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: Enum['admin', 'user', 'reviewer'],
  firstName: String,
  lastName: String,
  department: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Document
```
{
  _id: ObjectId,
  title: String,
  description: String,
  category: Enum['license', 'certificate', 'permit', 'insurance', 'contract', 'other'],
  status: Enum['submitted', 'in-progress', 'approved', 'expiring', 'expired'],
  fileUrl: String,
  fileName: String,
  expiryDate: Date,
  renewalDate: Date,
  owner: ObjectId (ref: User),
  uploadedAt: Date,
  updatedAt: Date,
  tags: Array<String>,
  metadata: {
    issueDate: Date,
    issuer: String,
    referenceNumber: String
  }
}
```

### Reminder
```
{
  _id: ObjectId,
  document: ObjectId (ref: Document),
  user: ObjectId (ref: User),
  reminderType: Enum['expiry', 'renewal', 'review', 'custom'],
  reminderDate: Date,
  daysBeforeExpiry: Number,
  notificationMethod: Enum['email', 'in-app', 'both'],
  sent: Boolean,
  sentAt: Date,
  read: Boolean,
  createdAt: Date
}
```

### Summary
```
{
  _id: ObjectId,
  document: ObjectId (ref: Document),
  summary: String,
  keyPoints: Array<String>,
  suggestedActions: Array<String>,
  importance: Enum['low', 'medium', 'high', 'critical'],
  readabilityScore: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/documents` | Get all documents |
| POST | `/api/documents` | Upload document |
| GET | `/api/documents/:id` | Get document details |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete document |
| GET | `/api/documents/:id/summary` | Get AI summary |
| GET | `/api/reminders` | Get user reminders |
| POST | `/api/reminders` | Create reminder |
| DELETE | `/api/reminders/:id` | Delete reminder |
| POST | `/api/summaries/generate` | Generate summary |

See `docs/API.md` for full API documentation.

---

## UI/UX Theme (Rogue)

### Color Palette
- **Primary Blue**: #1a1f3a
- **Accent Maroon**: #8b0000
- **Text White**: #ffffff
- **Alert Red**: #e63946
- **Light Gray**: #f8f9fa
- **Success Green**: #2d6a4f
- **Warning Orange**: #d4a574

### Design Principles
- Minimal and clean interface
- Dark mode friendly
- Clear visual hierarchy
- Status-driven color coding
- Responsive design (mobile-friendly)
- Fast load times
- Intuitive navigation

---

## Testing Strategy

### Unit Tests
- Backend: Express routes and controllers
- Frontend: React components
- AI Module: Summarization functions

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow

### End-to-End Tests
- User workflows
- Document upload and retrieval
- Reminder generation

### Testing Tools
- Jest (JavaScript)
- pytest (Python)
- Postman (API)

---

## Deployment

### Backend
- Deployment Platform: Heroku / AWS / DigitalOcean
- Database: MongoDB Atlas
- Environment: Node.js

### Frontend
- Deployment Platform: Vercel / Netlify / AWS S3
- Build: npm run build
- Performance: Optimized bundle size

### AI Module
- Deployment Platform: Heroku / AWS Lambda
- Framework: Flask
- Environment: Python

---

## Future Enhancements

1. Mobile application (React Native)
2. Advanced document OCR
3. Machine learning model training
4. Third-party integrations
5. Bulk document operations
6. Advanced analytics dashboard
7. Document signing capabilities
8. Multi-language support
9. Document version control
10. Audit trail and logging
