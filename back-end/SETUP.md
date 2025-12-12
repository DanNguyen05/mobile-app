# Quick Setup Guide

## Initial Setup

1. **Install Dependencies**
   ```bash
   cd D:\Codespace\healthy-care-mobile\back-end
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env and set:
   # - DATABASE_URL (PostgreSQL connection string)
   # - GEMINI_API_KEY (get from https://aistudio.google.com/apikey)
   # - GEMINI_MODEL (default: gemini-2.5-flash)
   # - JWT secrets (generate secure random strings)
   ```

3. **Setup Database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Create database and run migrations
   npm run prisma:migrate
   
   # Seed with demo data (optional)
   npm run prisma:seed
   ```

4. **Start the Server**
   ```bash
   # Development mode (auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Setup

### PostgreSQL Installation
If you don't have PostgreSQL installed:

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install and remember your postgres password
- Create a database: `healthy_care_mobile`

**Connection String Format:**
```
DATABASE_URL="postgresql://username:password@localhost:5432/healthy_care_mobile?schema=public"
```

Example:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/healthy_care_mobile?schema=public"
```

## CLOVA API Setup

1. Sign up at https://www.ncloud.com/
2. Navigate to CLOVA Studio
3. Create an API key
4. Copy the key to `.env`:
   ```
   CLOVA_API_KEY=your_api_key_here
   ```

## Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

## Demo Credentials

If you ran the seed script:
- **Email:** demo@healthycare.com
- **Password:** password123

## Troubleshooting

### Port Already in Use
Change the PORT in `.env`:
```
PORT=3002
```

### Database Connection Issues
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Ensure database exists: `healthy_care_mobile`

### Migration Issues
Reset the database:
```bash
npm run prisma:migrate reset
```

### Module Not Found Errors
Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Tools

### Prisma Studio
Open a GUI to view/edit database:
```bash
npm run prisma:studio
```
Opens at http://localhost:5555

### View Logs
The server logs all API requests in development mode.

## Next Steps

1. Configure your mobile app to point to this API
2. Test all endpoints with Postman or similar tool
3. Customize user fields and models as needed
4. Add additional features from the original server

## File Structure Reference

```
back-end/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Business logic
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Main entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.js         # Seed data
│   └── migrations/     # Database migrations
├── .env                # Environment variables (create this)
├── .env.example       # Environment template
├── package.json       # Dependencies
└── README.md         # Full documentation
```
