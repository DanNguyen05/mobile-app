# Healthy Care Mobile - Backend API

A complete backend API server for the Healthy Care Mobile application, providing health tracking, AI-powered nutrition analysis, and personalized workout recommendations.

## 🚀 Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Food Tracking**: Log meals, analyze nutrition from images using CLOVA AI
- **Workout Logging**: Track exercises and calories burned
- **AI Services** (powered by Google Gemini 2.5 Flash): 
  - Food recognition from images
  - Personalized exercise plan generation
  - AI chat assistant for health advice
- **Statistics**: Daily and weekly health statistics
- **Progress Tracking**: Body measurements and progress photos

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/apikey))

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd D:\Codespace\healthy-care-mobile\back-end
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GEMINI_API_KEY`: Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
   - `GEMINI_MODEL`: Model name (default: gemini-2.0-flash-exp)
   - `JWT_SECRET` and `JWT_REFRESH_SECRET`: Secure random strings
   - Other configuration as needed

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # (Optional) Seed database
   npm run prisma:seed
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3001` (or the port specified in `.env`)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `PUT /api/users/me/measurements` - Update body measurements

### Food Logs
- `GET /api/food-log` - Get food logs (with date filters)
- `POST /api/food-log` - Create food log
- `PUT /api/food-log/:id` - Update food log
- `DELETE /api/food-log/:id` - Delete food log
- `POST /api/food-log/batch-delete` - Delete multiple food logs

### Workout Logs
- `GET /api/workout-log` - Get workout logs (with date filters)
- `POST /api/workout-log` - Create workout log
- `PUT /api/workout-log/:id` - Update workout log
- `DELETE /api/workout-log/:id` - Delete workout log

### AI Services
- `POST /api/ai/recognize-food` - Recognize food from image
- `POST /api/ai/exercise-plan` - Generate personalized exercise plan
- `POST /api/ai/chat` - Chat with AI health assistant
- `GET /api/ai/context` - Get AI context for user

### Statistics
- `GET /api/statistics/daily?date=YYYY-MM-DD` - Get daily statistics
- `GET /api/statistics/weekly?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get weekly statistics

### Health Check
- `GET /health` - Server health check

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register or Login** to get access token and refresh token
2. **Include access token** in Authorization header:
   ```
   Authorization: Bearer <access_token>
   ```
3. **Refresh tokens** when access token expires using `/api/auth/refresh`

Refresh tokens are also stored in HTTP-only cookies for additional security.

## 📝 Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "goal": "lose_weight",
  "activityLevel": "moderately_active"
}
```

### Recognize Food from Image
```bash
POST /api/ai/recognize-food
Authorization: Bearer <token>
Content-Type: application/json

{
  "base64Image": "data:image/jpeg;base64,...",
  "overrideName": "Grilled chicken with rice",
  "overrideAmount": "300g"
}
```

### Get Daily Statistics
```bash
GET /api/statistics/daily?date=2024-12-12
Authorization: Bearer <token>
```

## 🗄️ Database Schema

The backend uses Prisma ORM with PostgreSQL. Key models include:

- **User**: User accounts and profiles
- **FoodLog**: Meal tracking records
- **WorkoutLog**: Exercise tracking records
- **CalendarEvent**: Calendar events and reminders
- **AiSuggestion**: AI-generated suggestions
- **DailyStatistics**: Aggregated daily stats
- **AiFeedback**: User feedback on AI plans
- **ChatMessage**: Chat history with AI
- **BodyMeasurement**: Body measurement history
- **ProgressPhoto**: Progress photo tracking
- **AiExercisePlanCache**: Cached exercise plans
- **AiMealPlanCache**: Cached meal plans

## 🛠️ Development

### Project Structure
```
back-end/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── index.js          # App configuration
│   │   └── database.js       # Prisma client
│   ├── controllers/          # Business logic
│   ├── middleware/           # Express middleware
│   ├── routes/              # API routes
│   ├── utils/               # Helper functions
│   └── server.js            # Main server file
├── .env                     # Environment variables
├── .env.example            # Environment template
├── package.json            # Dependencies
└── README.md              # This file
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

### Environment Variables
See `.env.example` for all available configuration options.

## 🔧 Configuration

### CORS
Configure allowed origins in `.env`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:19006
```

### JWT Tokens
- Access token expires in 30 minutes (configurable)
- Refresh token expires in 7 days (configurable)

### Guest Mode
Guest mode allows unauthenticated access for testing:
```
ALLOW_GUEST_MODE=true
DEFAULT_USER_ID=1
```

## 🤖 AI Features

### CLOVA AI Integration
The backend integrates with NAVER CLOVA Studio for:
- **Food Recognition**: Analyzes food images and estimates nutrition
- **Exercise Planning**: Generates personalized workout plans
- **Health Chat**: Conversational AI for health advice

### API Key Setup
1. Get API key from [NAVER CLOVA Studio](https://www.ncloud.com/product/aiService/clovaStudio)
2. Add to `.env`:
   ```
   CLOVA_API_KEY=your_api_key_here
   ```

## 📱 Mobile App Integration

This backend is designed for the Healthy Care Mobile React Native app. The API supports:
- Image upload for food recognition
- Real-time statistics
- Offline-first architecture (mobile handles caching)
- Push notifications (via mobile app)

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- HTTP-only cookies for refresh tokens
- CORS protection
- Input validation with express-validator
- SQL injection protection via Prisma ORM

## 📄 License

MIT

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- NAVER CLOVA Studio for AI capabilities
- Prisma for excellent ORM
- Express.js community
