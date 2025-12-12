import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  defaultUserId: Number(process.env.DEFAULT_USER_ID || 1),
  allowGuestMode: process.env.ALLOW_GUEST_MODE !== 'false',
  
  // JWT
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // CORS - Cho phép tất cả origins trong development để dễ dàng với Expo Go
  corsOrigins: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGINS?.split(',') || [])
    : '*',  // Allow all origins in development for Expo Go
  
  // Gemini API
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  
  // Cookie settings
  cookie: {
    name: 'refreshToken',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
};

// Validate required config
if (!config.gemini.apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY not found in environment variables!');
  console.error('Get your API key from: https://aistudio.google.com/apikey');
  process.exit(1);
}
