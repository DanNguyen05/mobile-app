# 🚀 Hướng dẫn Deploy Production - Healthy Care Mobile

## 📋 Tổng quan
Deploy backend lên Railway → Build app với EAS → Submit lên Google Play Store

---

## 🔧 BƯỚC 1: Chuẩn bị Backend cho Production

### 1.1. Kiểm tra file cần thiết

Đảm bảo có các file sau trong `back-end/`:
- ✅ `package.json` - Dependencies
- ✅ `prisma/schema.prisma` - Database schema  
- ✅ `.gitignore` - Đã ignore `.env`
- ✅ `src/server.js` - Entry point

### 1.2. Thêm scripts cho Railway

Mở `back-end/package.json`, đảm bảo có:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "build": "prisma generate",
    "postinstall": "prisma generate",
    "prisma:migrate": "prisma migrate deploy"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.3. Tạo file `railway.json` (optional nhưng nên có)

```bash
cd back-end
```

Tạo file `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## ☁️ BƯỚC 2: Deploy Backend lên Railway

### 2.1. Tạo tài khoản Railway

1. Truy cập: https://railway.app
2. Click **"Start a New Project"**
3. Login bằng GitHub
4. Railway sẽ tự động có quyền access repos của bạn

### 2.2. Tạo Project mới

1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Tìm và chọn repo: `nichikei/healthy-care-mobile`
4. Railway sẽ hỏi:
   - **Root Directory**: Nhập `back-end`
   - **Start Command**: `npm start` (hoặc để mặc định)

### 2.3. Add PostgreSQL Database

1. Trong project Railway vừa tạo, click **"+ New"**
2. Chọn **"Database"** → **"Add PostgreSQL"**
3. Railway sẽ tự động tạo database và set biến `DATABASE_URL`

### 2.4. Configure Environment Variables

Click vào service backend → **Variables** tab → Add từng biến:

```bash
# Database (tự động có rồi)
DATABASE_URL=postgresql://...

# App Config
NODE_ENV=production
PORT=3001

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Gemini AI
GEMINI_API_KEY=AIzaSyC... # Lấy từ https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models

# CORS (cho phép mọi origin trong dev, sau sẽ giới hạn)
CORS_ORIGINS=*

# JWT Expiry
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# Guest mode (tắt trong production)
ALLOW_GUEST_MODE=false
```

**Lưu ý:** Generate JWT secrets bằng:
```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 2.5. Run Database Migrations

Sau khi deploy xong, Railway sẽ tự chạy:
1. `npm install`
2. `prisma generate` (từ postinstall script)

Nhưng phải chạy migrations thủ công:

**Option A: Qua Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migration
railway run npm run prisma:migrate
```

**Option B: Qua Railway Dashboard**
1. Vào service backend
2. Tab **"Deployments"** → Click vào deployment mới nhất
3. Tab **"Deploy Logs"** → Tìm **"View Logs"**
4. Trong Settings → **Command** → Run one-off command:
   ```
   npx prisma migrate deploy
   ```

### 2.6. Lấy Production URL

1. Trong Railway dashboard, click vào service backend
2. Tab **"Settings"** → Section **"Networking"**
3. Click **"Generate Domain"**
4. Railway sẽ tạo URL: `https://healthy-care-mobile-production.up.railway.app`
5. **Copy URL này** - sẽ dùng cho frontend

### 2.7. Test Backend Production

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Response mong đợi:
{
  "status": "OK",
  "message": "Healthy Care Mobile API is running",
  "timestamp": "2025-12-16T..."
}
```

---

## 📱 BƯỚC 3: Build Frontend với EAS

### 3.1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 3.2. Login vào Expo

```bash
cd front-end
eas login
```

Nhập email/password Expo account (đăng ký tại https://expo.dev nếu chưa có)

### 3.3. Create .env file

Tạo file `front-end/.env`:

```env
# Production API URL từ Railway
EXPO_PUBLIC_API_URL=https://your-backend-url.railway.app

# Expo Project ID (sẽ có sau khi chạy eas build:configure)
EXPO_PUBLIC_PROJECT_ID=
```

### 3.4. Configure EAS Build

```bash
eas build:configure
```

Chọn:
- Platform: **Android**
- Bundle identifier: `com.ceres.health` (đã có trong app.json)

EAS sẽ tạo:
- File `eas.json` (đã có rồi)
- Expo project ID → Copy và paste vào `.env` ở trên

### 3.5. Build Production AAB

```bash
# Build production (Android App Bundle cho Google Play)
eas build --platform android --profile production
```

Quá trình:
1. EAS upload code lên cloud
2. Build trên server của Expo (mất 10-20 phút)
3. Nhận link download file `.aab`

**Lưu ý:** Lần đầu tiên EAS sẽ hỏi:
- **Generate new keystore?** → Chọn **Yes** (EAS tự quản lý)
- EAS sẽ tự động tạo và lưu keystore cho bạn

### 3.6. Download AAB file

Sau khi build xong:
1. EAS sẽ in ra link download
2. Hoặc vào https://expo.dev → Your project → Builds
3. Download file `.aab` về máy

---

## 🏪 BƯỚC 4: Submit lên Google Play Store

### 4.1. Tạo Google Play Console account

1. Truy cập: https://play.google.com/console
2. Đăng ký tài khoản Developer ($25 one-time fee)
3. Hoàn thành profile và payment

### 4.2. Tạo App mới

1. Trong Play Console → **"Create app"**
2. Điền thông tin:
   - **App name**: Ceres Health
   - **Default language**: Vietnamese
   - **App or game**: App
   - **Free or paid**: Free
3. Complete declarations và tick các checkbox

### 4.3. Setup App Information

**Store Listing:**
- Short description (max 80 chars):
  ```
  Theo dõi dinh dưỡng, luyện tập và sức khỏe với AI - Ceres Health
  ```
  
- Full description (max 4000 chars):
  ```
  🌟 Ceres Health - Trợ lý sức khỏe thông minh của bạn

  Theo dõi dinh dưỡng, calories, bài tập và tiến trình sức khỏe một cách dễ dàng với sự hỗ trợ của AI.

  ✨ TÍNH NĂNG NỔI BẬT:
  
  📸 Nhận diện món ăn bằng AI
  - Chụp ảnh đồ ăn → AI tự động tính calories và dinh dưỡng
  - Hỗ trợ món Việt Nam và quốc tế
  - Chính xác và nhanh chóng
  
  🍽️ Nhật ký dinh dưỡng
  - Theo dõi bữa sáng, trưa, tối, snack
  - Thống kê protein, carbs, fat tự động
  - Biểu đồ trực quan theo ngày/tuần
  
  💪 Quản lý bài tập
  - 22+ video bài tập HD miễn phí
  - HIIT, Yoga, Cardio, Strength training
  - Theo dõi calories đốt cháy
  
  🤖 AI Trợ lý sức khỏe
  - Chat với AI về dinh dưỡng, tập luyện
  - Gợi ý thực đơn cá nhân hóa
  - Kế hoạch tập 7 ngày
  
  📊 Thống kê & Tiến trình
  - Dashboard trực quan
  - Biểu đồ calories, macro nutrients
  - Theo dõi cân nặng, số đo
  
  🎯 Mục tiêu cá nhân
  - Giảm cân / Tăng cơ / Duy trì
  - Tính toán TDEE tự động
  - Nhắc nhở uống nước
  
  🗓️ Lịch sức khỏe
  - Lưu sự kiện quan trọng
  - Nhắc nhở khám bác sĩ
  - Ghi chú tiến trình
  
  🍴 Thực đơn healthy
  - 50+ công thức món ăn healthy
  - Video hướng dẫn nấu
  - Calories và dinh dưỡng chi tiết
  
  📚 Kiến thức sức khỏe
  - 40+ bài viết về dinh dưỡng, wellness, fitness
  - Tips & tricks hữu ích
  - Cập nhật thường xuyên
  
  ⚡ ĐẶC ĐIỂM NỔI BẬT:
  - Giao diện đẹp, dễ sử dụng
  - Hoạt động offline
  - Không thu thập dữ liệu cá nhân
  - Miễn phí 100%
  - Hỗ trợ tiếng Việt
  
  🔒 QUYỀN RIÊNG TƯ:
  - Dữ liệu lưu an toàn trên thiết bị
  - Không bán thông tin người dùng
  - Tuân thủ GDPR
  
  💡 PHÁT TRIỂN BỞI:
  Ceres Health được phát triển bởi đội ngũ đam mê sức khỏe cộng đồng.
  
  📧 LIÊN HỆ:
  Email: support@ceres-health.com
  
  🌟 TẢI NGAY ĐỂ BẮT ĐẦU HÀNH TRÌNH KHỎE MẠNH!
  ```

- App icon: Upload từ `front-end/assets/icon.png` (512x512px)
- Feature graphic: Cần tạo (1024x500px) - dùng Canva hoặc Figma
- Screenshots: Cần chụp (2-8 ảnh, nhiều màn hình khác nhau)
  - Chụp từ app: Dashboard, Food Diary, Exercises, AI Chat, Progress
  - Khuyên dùng: Android 6.5" phone screenshots

**Categorization:**
- **App category**: Health & Fitness
- **Tags**: health, fitness, nutrition, calories, diet, workout

**Contact details:**
- Email: your-email@gmail.com
- Website: (optional)
- Phone: (optional)

**Privacy Policy:**
- URL: https://ceres-health.com/privacy (cần tạo - xem mẫu bên dưới)

### 4.4. Content Rating

1. Go to **"Content rating"**
2. Fill questionnaire (all "No" for health app)
3. Get PEGI 3 / Everyone rating

### 4.5. Setup Release

1. Go to **"Production"** → **"Create new release"**
2. Upload `.aab` file từ EAS
3. Release name: `1.0.0 (1)` - Build number 1
4. Release notes:
   ```
   🎉 Phiên bản đầu tiên của Ceres Health!
   
   ✨ Tính năng:
   - Nhận diện món ăn bằng AI
   - Theo dõi dinh dưỡng và calories
   - 22+ video bài tập miễn phí
   - AI trợ lý sức khỏe
   - Thống kê trực quan
   - Kế hoạch thực đơn 7 ngày
   
   Cảm ơn bạn đã sử dụng Ceres Health!
   ```
5. Click **"Save"** → **"Review release"** → **"Start rollout to Production"**

### 4.6. Testing (Internal/Closed)

**Khuyến nghị:** Test trước với Internal Testing:
1. Go to **"Internal testing"** tab
2. Create release → Upload AAB
3. Add test users (email addresses)
4. Share testing link với team
5. Test 1-2 ngày
6. Fix bugs nếu có
7. Mới promote lên Production

---

## 🔐 BƯỚC 5: Privacy Policy (bắt buộc)

Google Play yêu cầu Privacy Policy. Tạo file tại GitHub Pages hoặc website:

**Mẫu Privacy Policy:**

```markdown
# Privacy Policy - Ceres Health

Last updated: December 16, 2025

## Introduction
Ceres Health ("we", "our", "us") respects your privacy and is committed to protecting your personal data.

## Information We Collect
- Account information (email, name)
- Health data you input (weight, height, age, calories, workouts)
- Images you upload for food recognition (processed by AI, not stored permanently)

## How We Use Your Information
- To provide and improve our services
- To calculate personalized nutrition recommendations
- To provide AI-powered features (food recognition, health advice)

## Data Storage
- Your data is stored securely on our servers
- We use industry-standard encryption
- Food images are processed in real-time and not stored

## Third-Party Services
- Google Gemini AI: For food recognition and health advice
- Railway: For backend hosting
- Expo: For app distribution

## Your Rights
- Access your data
- Delete your account and data
- Export your data

## Contact Us
Email: support@ceres-health.com

## Changes to This Policy
We may update this policy. Changes will be posted on this page.
```

Host tại:
- GitHub Pages: https://your-username.github.io/ceres-health/privacy
- Netlify: Deploy static page
- Railway: Serve static HTML

---

## ✅ BƯỚC 6: Submit & Wait

1. **Submit for review**: Click "Send for review"
2. **Google reviews**: Mất 1-7 ngày (thường 1-2 ngày)
3. **Receive email**: Google thông báo approved hoặc rejected
4. **If approved**: App lên Play Store! 🎉
5. **If rejected**: Fix issues → Submit lại

---

## 📊 BƯỚC 7: Monitor & Update

### 7.1. Monitor Backend

Railway dashboard:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time logs
- **Uptime**: 99.9% với Railway Pro (free tier có giới hạn 500h/month)

### 7.2. Monitor App

Google Play Console:
- **Installs**: Số lượt cài đặt
- **Crashes**: Báo cáo lỗi
- **Ratings**: Đánh giá người dùng
- **ANRs**: App Not Responding reports

### 7.3. Update App

Khi cần update:

```bash
cd front-end

# Bump version in app.config.js
# version: "1.0.1"

# Build new version
eas build --platform android --profile production

# Auto submit
eas submit --platform android --latest
```

---

## 🆘 Troubleshooting

### Backend deployment fails
- Kiểm tra logs trong Railway
- Đảm bảo `GEMINI_API_KEY` đúng
- Check `DATABASE_URL` có tồn tại

### Build fails trên EAS
```bash
# Clear cache
eas build --platform android --profile production --clear-cache
```

### App rejected by Google
- **Common reasons:**
  - Thiếu Privacy Policy
  - Thiếu screenshots
  - Icon không đúng kích thước
  - Content rating chưa hoàn thành

### Rate limiting too strict
Railway free tier:
- 500h/month (~16h/day)
- Nếu vượt → nâng cấp lên Hobby ($5/month)

---

## 💰 Chi phí

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | 500h/month + $5 credit | $5/month (Hobby) |
| PostgreSQL (Railway) | 1GB included | Scale as needed |
| Expo EAS | 30 builds/month | $29/month (unlimited) |
| Google Play | One-time $25 | - |

**Tổng chi phí khởi đầu:** ~$25 (Play Store only)
**Chi phí hàng tháng:** $0 (free tier) hoặc $5-10 (nếu cần scale)

---

## 🎉 Done!

Sau khi làm theo hướng dẫn này:
- ✅ Backend đang chạy production tại Railway
- ✅ App đã build thành công
- ✅ App đã submit lên Google Play Store
- ✅ Đang chờ Google review

**Congratulations! 🚀**

---

## 📞 Cần hỗ trợ?

- Railway: https://railway.app/help
- EAS: https://docs.expo.dev/eas
- Google Play: https://support.google.com/googleplay/android-developer
