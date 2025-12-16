# Railway Deployment Guide

## Quick Deploy Steps

### 1. Đẩy code lên GitHub (nếu chưa làm)
```bash
git add .
git commit -m "Add Railway deployment config"
git push
```

### 2. Deploy trên Railway Dashboard

1. **Truy cập:** https://railway.app
2. **Login** bằng GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Chọn repo:** `DanNguyen05/mobile-app`
5. **Configure:**
   - **Root Directory:** `back-end`
   - **Build Command:** `npm run build` (tự động từ railway.json)
   - **Start Command:** `npm start` (tự động từ railway.json)

### 3. Add PostgreSQL Database

1. Trong project → **+ New** → **Database** → **Add PostgreSQL**
2. Railway tự động tạo biến `DATABASE_URL`

### 4. Set Environment Variables

Click vào service backend → **Variables** tab → Add:

```env
# Database (tự động có)
DATABASE_URL=postgresql://...

# App
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=super-secret-jwt-key-change-this-production-2024
JWT_REFRESH_SECRET=super-secret-refresh-key-change-this-production-2024
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# Gemini AI
GEMINI_API_KEY=AIzaSyC... # Get from https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models

# CORS
CORS_ORIGINS=*

# Guest Mode
ALLOW_GUEST_MODE=false
```

### 5. Deploy

1. Railway tự động build và deploy
2. Chờ 5-10 phút
3. Check logs: **Deployments** tab → **View Logs**

### 6. Run Migrations

**Option A: Railway CLI**
```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run npm run prisma:migrate:deploy
```

**Option B: Railway Dashboard**
1. **Settings** → **Deploy** → Trigger manual deploy
2. Migrations sẽ chạy tự động từ start.sh

### 7. Get Production URL

1. Service backend → **Settings** → **Networking**
2. **Generate Domain**
3. Copy URL: `https://your-app-name.up.railway.app`

### 8. Test

```bash
curl https://your-app-name.up.railway.app/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Healthy Care Mobile API is running"
}
```

---

## Files Added

✅ `railway.json` - Railway configuration
✅ `nixpacks.toml` - Nixpacks build config
✅ `Procfile` - Process definition
✅ `start.sh` - Deployment script
✅ `package.json` - Updated with build scripts

---

## Troubleshooting

### Build fails
- Check logs: Deployments → View Logs
- Verify `GEMINI_API_KEY` is set
- Ensure `DATABASE_URL` exists

### Database connection error
- Check PostgreSQL service is running
- Verify `DATABASE_URL` format

### Migrations not running
```bash
railway run npm run prisma:migrate:deploy
```

---

## Cost

- **Free Tier:** $5 credit/month (~500 hours)
- **Hobby Plan:** $5/month (unlimited hours)
- **PostgreSQL:** 1GB included

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
