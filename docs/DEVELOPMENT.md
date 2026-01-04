# Development Guide

## Code Structure

### Backend Organization

```
backend/src/
├── server.js              # Entry point
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── documents.js      # Document CRUD routes
│   ├── users.js          # User management routes
│   ├── reminders.js      # Reminder routes
│   └── summaries.js      # Summary routes
├── controllers/
│   ├── authController.js
│   ├── documentController.js
│   ├── userController.js
│   ├── reminderController.js
│   └── summaryController.js
├── models/
│   ├── User.js
│   ├── Document.js
│   ├── Reminder.js
│   ├── Guide.js
│   └── Summary.js
├── middleware/
│   ├── auth.js           # JWT verification
│   ├── errorHandler.js   # Error handling
│   └── validation.js     # Input validation
└── utils/
    ├── emailService.js   # Email sending
    ├── constants.js      # App constants
    └── helpers.js        # Helper functions
```

### Frontend Organization

```
frontend/src/
├── App.js               # Main component
├── index.js            # React entry point
├── components/
│   ├── Header.js       # Navigation header
│   ├── Sidebar.js      # Navigation sidebar
│   ├── DocumentCard.js # Document display
│   ├── ReminderList.js # Reminders display
│   └── StatusBadge.js  # Status indicator
├── pages/
│   ├── Dashboard.js    # Main dashboard
│   ├── Documents.js    # Documents page
│   ├── Reminders.js    # Reminders page
│   ├── Guides.js       # Guides page
│   └── Login.js        # Login page
├── utils/
│   ├── api.js          # API client
│   ├── auth.js         # Auth helpers
│   └── constants.js    # App constants
└── styles/
    ├── globals.css     # Global styles
    ├── layout.css      # Layout styles
    └── theme.css       # Theme colors
```

### AI Module Organization

```
ai-module/
├── app.py             # Flask app entry point
├── summarizer.py      # Core summarization logic
├── models/            # Pre-trained models
├── scripts/
│   ├── train.py       # Model training
│   └── evaluate.py    # Model evaluation
├── data/              # Training/test data
├── requirements.txt   # Python dependencies
└── .env.example       # Environment template
```

---

## Coding Standards

### JavaScript/React

#### Naming Conventions
```javascript
// Components: PascalCase
const UserProfile = () => { };

// Functions: camelCase
function getUserData() { }

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10485760;

// Variables: camelCase
let documentTitle = 'License';

// Private methods: _camelCase
const _validateEmail = (email) => { };
```

#### Code Organization
```javascript
// 1. Imports
import React from 'react';
import axios from 'axios';

// 2. Constants
const API_URL = process.env.REACT_APP_API_URL;

// 3. Component
const Component = () => {
  // State
  const [data, setData] = React.useState(null);
  
  // Effects
  React.useEffect(() => {
    // initialization
  }, []);
  
  // Handlers
  const handleClick = () => { };
  
  // Render
  return <div>Component</div>;
};

// 4. Export
export default Component;
```

#### Comments
```javascript
/**
 * Fetch all documents for the current user
 * @param {string} status - Filter by status
 * @returns {Promise<Array>} List of documents
 */
const getDocuments = async (status) => {
  // Implementation
};
```

### Python

#### Naming Conventions
```python
# Classes: PascalCase
class DocumentProcessor:
    pass

# Functions: snake_case
def process_document(content):
    pass

# Constants: UPPER_SNAKE_CASE
MAX_SUMMARY_SENTENCES = 5

# Variables: snake_case
document_title = 'License'

# Private methods: _snake_case
def _validate_email(email):
    pass
```

#### Docstrings
```python
def process_document(content: str, category: str = 'other') -> dict:
    """
    Process a document and generate analysis.
    
    Args:
        content (str): Document text content
        category (str): Document category (default: 'other')
        
    Returns:
        dict: Dictionary containing summary, key points, and actions
        
    Raises:
        ValueError: If content is empty
    """
    pass
```

---

## Best Practices

### Backend

1. **Error Handling**
```javascript
try {
  const document = await Document.findById(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
} catch (error) {
  console.error('Error fetching document:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
```

2. **Validation**
```javascript
const { body, validationResult } = require('express-validator');

router.post('/documents', [
  body('title').notEmpty().trim(),
  body('category').isIn(['license', 'certificate', ...]),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
});
```

3. **Middleware**
```javascript
// Authentication middleware
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // Verify and set req.user
  next();
};
```

### Frontend

1. **Component Structure**
```javascript
const DocumentList = ({ documents }) => {
  // State and Effects
  const [filter, setFilter] = React.useState('all');
  
  // Computed values
  const filtered = documents.filter(d => 
    filter === 'all' ? true : d.status === filter
  );
  
  // Render
  return (
    <div className="document-list">
      {filtered.map(doc => 
        <DocumentCard key={doc.id} document={doc} />
      )}
    </div>
  );
};
```

2. **API Calls**
```javascript
// utils/api.js
const api = {
  documents: {
    getAll: () => axios.get('/api/documents'),
    getById: (id) => axios.get(`/api/documents/${id}`),
    create: (data) => axios.post('/api/documents', data),
    update: (id, data) => axios.put(`/api/documents/${id}`, data),
    delete: (id) => axios.delete(`/api/documents/${id}`)
  }
};
```

3. **Error Handling**
```javascript
const [error, setError] = React.useState(null);

const fetchDocuments = async () => {
  try {
    const response = await api.documents.getAll();
    setDocuments(response.data);
  } catch (err) {
    setError(err.response?.data?.error || 'Error fetching documents');
  }
};
```

### AI Module

1. **Type Hints**
```python
from typing import List, Dict, Tuple, Optional

def extract_key_points(
    text: str, 
    num_points: int = 5
) -> List[str]:
    """Extract key points from text."""
    pass
```

2. **Error Handling**
```python
try:
    result = process_document(content)
except ValueError as e:
    logger.error(f'Processing error: {e}')
    return {'error': str(e)}, 400
except Exception as e:
    logger.error(f'Unexpected error: {e}')
    return {'error': 'Processing failed'}, 500
```

---

## Testing

### Backend Testing
```javascript
// tests/documents.test.js
const request = require('supertest');
const app = require('../src/server');

describe('GET /api/documents', () => {
  it('should return all documents', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.documents)).toBe(true);
  });
});
```

### Frontend Testing
```javascript
// tests/DocumentCard.test.js
import { render, screen } from '@testing-library/react';
import DocumentCard from '../components/DocumentCard';

test('renders document title', () => {
  render(<DocumentCard document={{ title: 'License' }} />);
  expect(screen.getByText('License')).toBeInTheDocument();
});
```

### AI Module Testing
```python
# tests/test_summarizer.py
import unittest
from summarizer import process_document

class TestSummarizer(unittest.TestCase):
    def test_process_document(self):
        result = process_document('Sample text content')
        self.assertIn('summary', result)
        self.assertIn('key_points', result)
```

---

## Performance Tips

1. **Frontend**
   - Use React.memo for expensive components
   - Implement code splitting with React.lazy()
   - Optimize bundle size
   - Use efficient state management

2. **Backend**
   - Index frequently queried fields
   - Use pagination for large datasets
   - Implement caching strategies
   - Optimize database queries

3. **AI Module**
   - Cache model predictions
   - Batch process documents
   - Optimize NLP pipeline

---

## Security Checklist

- [ ] Validate all user inputs
- [ ] Sanitize data before storage
- [ ] Use HTTPS in production
- [ ] Hash passwords with bcryptjs
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Implement CORS properly
- [ ] Use JWT with expiration
- [ ] Validate file uploads
- [ ] Implement SQL/NoSQL injection protection

---

## Debugging

### Backend Debugging
```javascript
// Enable debug logging
const debug = require('debug')('app:*');
debug('Important message');

// Run with debug:
// DEBUG=app:* npm run dev
```

### Frontend Debugging
```javascript
// React DevTools browser extension
// Redux DevTools for state inspection
// Browser console for logs
console.log('Debug:', variable);
```

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check CORS configuration in backend |
| 401 Unauthorized | Verify JWT token is valid |
| 404 Not Found | Check endpoint URL and route |
| Database connection failed | Verify MongoDB URI and connection |
| Module not found | Run npm install or pip install -r requirements.txt |

