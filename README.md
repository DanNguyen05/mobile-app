# 🏥 Healthy Care Mobile

Mobile health tracking application with AI-powered food recognition and personalized workout recommendations.

## ✨ Features

- 📸 **AI Food Recognition** - Analyze meals using Google Gemini 2.5 Flash
- 💬 **AI Health Assistant** - Chat with AI for nutrition advice
- 🍽️ **Food Diary** - Track meals and daily nutrition
- 💪 **Exercise Tracking** - Log workouts and calories burned
- 📊 **Progress Dashboard** - Monitor health metrics and statistics
- 🎯 **Personalized Plans** - Get custom workout recommendations

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v24.11
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini 2.5 Flash API
- **Authentication**: JWT

### Frontend
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State**: Context API
- **Camera**: expo-camera, expo-image-picker

## 📋 Prerequisites

- Node.js 24.x or higher
- PostgreSQL 15.x or higher
- npm or yarn
- Expo CLI (for mobile development)
- Android/iOS device with Expo Go app

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/nichikei/healthy-care-mobile.git
cd healthy-care-mobile
```

### 2. Backend Setup

```bash
cd back-end

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Add your environment variables:
# - DATABASE_URL
# - GEMINI_API_KEY
# - JWT_ACCESS_SECRET
# - JWT_REFRESH_SECRET

# Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd front-end

# Install dependencies
npm install

# Update API_BASE_URL in src/services/http.ts with your backend URL

# Start Expo
npx expo start
```

Scan QR code with Expo Go app to launch

### 4. Demo Account

```
Email: demo@healthycare.com
Password: password123
```

## 📱 Screenshots

[Add screenshots here]

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5433/healthy_care_mobile
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development
```

#### Frontend
Update `API_BASE_URL` in `src/services/http.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:3001'; // For Expo Go
```

## 📖 API Documentation

See [back-end/API_TESTING.md](back-end/API_TESTING.md) for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is private and not licensed for public use.

## 👤 Author

**nichikei**

- GitHub: [@nichikei](https://github.com/nichikei)

## 🙏 Acknowledgments

- Google Gemini AI for food recognition
- Expo team for React Native framework
- Prisma for database toolkit

---

Made with ❤️ by nichikei
