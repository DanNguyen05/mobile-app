# API Testing Guide

Quick reference for testing all API endpoints.

## Base URL
```
http://localhost:3001
```

## 1. Health Check

### Check Server Status
```bash
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Healthy Care Mobile API is running",
  "timestamp": "2024-12-12T10:30:00.000Z"
}
```

## 2. Authentication

### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "goal": "lose_weight",
  "activityLevel": "moderately_active"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "user_id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    ...
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Get Profile
```bash
GET /api/users/me
Authorization: Bearer {accessToken}
```

### Update Profile
```bash
PUT /api/users/me
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Updated",
  "weight": 68,
  "goal": "maintain_weight"
}
```

### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Logout
```bash
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

## 3. Food Logs

### Get Food Logs
```bash
# All food logs
GET /api/food-log
Authorization: Bearer {accessToken}

# With date filter
GET /api/food-log?start=2024-12-01&end=2024-12-31
Authorization: Bearer {accessToken}
```

### Create Food Log
```bash
POST /api/food-log
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "eatenAt": "2024-12-12T12:00:00Z",
  "mealType": "Lunch",
  "foodName": "Grilled Chicken Salad",
  "calories": 450,
  "protein": 35,
  "carbs": 30,
  "fat": 18,
  "amount": "350g"
}
```

### Update Food Log
```bash
PUT /api/food-log/1
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "calories": 500,
  "protein": 40
}
```

### Delete Food Log
```bash
DELETE /api/food-log/1
Authorization: Bearer {accessToken}
```

### Batch Delete Food Logs
```bash
POST /api/food-log/batch-delete
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

## 4. Workout Logs

### Get Workout Logs
```bash
# All workout logs
GET /api/workout-log
Authorization: Bearer {accessToken}

# With date filter
GET /api/workout-log?start=2024-12-01&end=2024-12-31
Authorization: Bearer {accessToken}
```

### Create Workout Log
```bash
POST /api/workout-log
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "completedAt": "2024-12-12T07:00:00Z",
  "exerciseName": "Morning Run",
  "durationMinutes": 30,
  "caloriesBurnedEstimated": 250,
  "isAiSuggested": false
}
```

### Update Workout Log
```bash
PUT /api/workout-log/1
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "durationMinutes": 35,
  "caloriesBurnedEstimated": 280
}
```

### Delete Workout Log
```bash
DELETE /api/workout-log/1
Authorization: Bearer {accessToken}
```

## 5. AI Services

### Recognize Food from Image
```bash
POST /api/ai/recognize-food
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "overrideName": "Chicken Rice",
  "overrideAmount": "300g"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "foodName": "Grilled Chicken with Rice",
    "amount": "300g",
    "calories": 520,
    "protein": 42,
    "carbs": 58,
    "fat": 15,
    "sugar": 3,
    "breakdown": [
      {
        "name": "Grilled Chicken",
        "amount": "150g",
        "calories": 240,
        "protein": 36,
        "carbs": 0,
        "fats": 8,
        "sugar": 0
      },
      {
        "name": "Steamed Rice",
        "amount": "150g",
        "calories": 280,
        "protein": 6,
        "carbs": 58,
        "fats": 7,
        "sugar": 3
      }
    ]
  }
}
```

### Generate Exercise Plan
```bash
POST /api/ai/exercise-plan
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "dailyIntake": 1800,
  "userQuery": "I want to lose weight and build muscle"
}
```

**Response:**
```json
{
  "summary": "Balanced workout for fat loss and muscle building",
  "intensity": "moderate",
  "totalBurnEstimate": "450-500 kcal",
  "advice": "Focus on compound movements and maintain good form",
  "exercises": [
    {
      "name": "Full Body Strength - Week 1",
      "duration": "30 min",
      "reason": "Builds muscle while burning calories"
    },
    {
      "name": "HIIT Fat Burn",
      "duration": "20 min",
      "reason": "Maximizes calorie burn in short time"
    }
  ]
}
```

### Chat with AI
```bash
POST /api/ai/chat
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "message": "How much protein should I eat daily?",
  "history": [
    {
      "role": "user",
      "content": "Hi, I want to lose weight"
    },
    {
      "role": "assistant",
      "content": "Hello! I can help you with that. What's your current weight and goal?"
    }
  ],
  "userProfile": {
    "age": 30,
    "gender": "male",
    "weight": 70,
    "height": 175,
    "goal": "lose_weight"
  }
}
```

**Response:**
```json
{
  "reply": "For your profile, aim for 1.6-2.2g of protein per kg of body weight. That's about 112-154g daily to support muscle maintenance during weight loss."
}
```

### Get AI Context
```bash
GET /api/ai/context
Authorization: Bearer {accessToken}
```

## 6. Statistics

### Get Daily Statistics
```bash
GET /api/statistics/daily?date=2024-12-12
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "date": "2024-12-12",
  "total_calories": 1850,
  "total_protein": 125,
  "total_carbs": 180,
  "total_fat": 65,
  "calories_burned": 450,
  "exercise_duration": 60,
  "meals_count": 3,
  "workouts_count": 2
}
```

### Get Weekly Statistics
```bash
GET /api/statistics/weekly?startDate=2024-12-01&endDate=2024-12-07
Authorization: Bearer {accessToken}
```

**Response:**
```json
[
  {
    "date": "2024-12-01",
    "total_calories": 1900,
    "total_protein": 130,
    "total_carbs": 190,
    "total_fat": 70,
    "calories_burned": 400,
    "exercise_duration": 50,
    "meals_count": 3,
    "workouts_count": 1
  },
  ...
]
```

## Testing with cURL

Save your access token:
```bash
TOKEN="your_access_token_here"
```

Then use it in requests:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/users/me
```

## Testing with Postman

1. Import these endpoints as a collection
2. Create an environment variable `accessToken`
3. After login, save the token: `pm.environment.set("accessToken", pm.response.json().accessToken)`
4. Use `{{accessToken}}` in Authorization headers

## Common Issues

### 401 Unauthorized
- Token expired → Use refresh endpoint
- Invalid token → Login again
- Missing Authorization header → Add `Authorization: Bearer {token}`

### 400 Bad Request
- Check request body format
- Verify all required fields are present
- Validate data types

### 404 Not Found
- Verify endpoint URL
- Check if resource exists (correct ID)

### 500 Internal Server Error
- Check server logs
- Verify database connection
- Check CLOVA API key is valid
