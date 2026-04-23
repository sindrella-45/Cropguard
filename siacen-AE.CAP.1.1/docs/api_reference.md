# API Reference

## Base URL

Development: http://localhost:8000
Production:  https://api.cropguard.ai

## Interactive Docs

Full interactive API documentation is available at:
http://localhost:8000/docs

All endpoints can be tested directly in the browser
without any additional tools.

## Authentication

Most endpoints require a JWT token obtained from
the login or signup endpoints.

Include the token in every request header:
```
Authorization: Bearer <your_token_here>
```

## Endpoints

### Health Check
```
GET /health
```
Check server is running.

Response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "environment": "development"
}
```

---

### Authentication

#### Signup
```
POST /auth/signup
```
Body:
```json
{
  "email": "farmer@example.com",
  "password": "secure123",
  "full_name": "John Farmer"
}
```
Response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user_id": "uuid",
  "email": "farmer@example.com",
  "full_name": "John Farmer"
}
```

#### Login
```
POST /auth/login
```
Body:
```json
{
  "email": "farmer@example.com",
  "password": "secure123"
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>
```

#### Get Profile
```
GET /auth/me
Authorization: Bearer <token>
```

---

### Analysis

#### Analyze Leaf
```
POST /analyze
Authorization: Bearer <token> (optional)
```
Body:
```json
{
  "image_data": "base64_encoded_string",
  "image_type": "image/jpeg",
  "plant_type": "tomato",
  "personality": "friendly",
  "selected_model": "gpt-4o"
}
```
Response:
```json
{
  "diagnosis": {
    "plant_identified": "Tomato",
    "health_status": "diseased",
    "confidence_score": 87.3,
    "diagnosis": {
      "name": "Early Blight",
      "scientific_name": "Alternaria solani",
      "severity": "moderate",
      "description": "Brown spots with yellow halos..."
    },
    "causes": ["Fungal infection"],
    "symptoms": ["Brown spots", "Yellow halos"],
    "treatments": [...],
    "prevention_tips": [...],
    "urgency": "high",
    "farmer_advice": "Act quickly..."
  },
  "sources": [...],
  "tokens_used": 1240,
  "cost_usd": 0.0093,
  "session_id": "uuid",
  "fallback_triggered": false
}
```

---

### History

#### Get History
```
GET /history?limit=10
Authorization: Bearer <token>
```

#### Get Single Diagnosis
```
GET /history/{diagnosis_id}
Authorization: Bearer <token>
```

#### Delete Diagnosis
```
DELETE /history/{diagnosis_id}
Authorization: Bearer <token>
```

---

### Feedback

#### Submit Feedback
```
POST /feedback
Authorization: Bearer <token>
```
Body:
```json
{
  "diagnosis_id": "uuid",
  "user_id": "uuid",
  "rating": 4,
  "comment": "Very accurate",
  "was_accurate": true
}
```

#### Get Feedback Summary
```
GET /feedback/summary
Authorization: Bearer <token>
```

---

### Tokens

#### Get Token Usage
```
GET /tokens/usage
Authorization: Bearer <token>
```

#### Get Available Models
```
GET /tokens/models
```

---

### Plugins

#### Get All Plugins
```
GET /plugins
Authorization: Bearer <token> (optional)
```

#### Toggle Plugin
```
POST /plugins/{plugin_id}/toggle
Authorization: Bearer <token> (optional)
```

---

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error message here"
}
```

Common status codes:
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 500 | Server error |