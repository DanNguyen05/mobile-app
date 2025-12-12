# HealthyCare Mobile App

Ứng dụng React Native mobile cho HealthyCare - theo dõi sức khỏe và dinh dưỡng.

## Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app trên điện thoại (iOS/Android)

### Bước 1: Cài đặt dependencies

```bash
cd healthy-care-mobile
npm install
```

### Bước 2: Cấu hình API

Mở file `src/services/http.ts` và cập nhật `BASE_URL` với URL của backend API:

```typescript
const BASE_URL = 'http://your-api-url.com'; // Thay đổi URL này
```

**Lưu ý cho development local:**
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Thiết bị thật: Sử dụng IP của máy tính (ví dụ: `http://192.168.1.100:3000`)

### Bước 3: Chạy ứng dụng

```bash
# Khởi động Expo development server
npm start

# Hoặc chạy trực tiếp trên Android
npm run android

# Hoặc chạy trực tiếp trên iOS
npm run ios
```

## Cấu trúc dự án

```
src/
├── App.tsx                 # Entry point
├── navigation/
│   └── AppNavigator.tsx    # Navigation configuration
├── context/
│   ├── AuthContext.tsx     # Authentication state
│   └── ThemeContext.tsx    # Theme & styling
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── onboarding/
│   │   └── OnboardingScreen.tsx
│   ├── dashboard/
│   │   └── DashboardScreen.tsx
│   ├── foodDiary/
│   │   └── FoodDiaryScreen.tsx
│   ├── exercises/
│   │   └── ExercisesScreen.tsx
│   ├── progress/
│   │   └── ProgressScreen.tsx
│   ├── messages/
│   │   └── MessagesScreen.tsx
│   └── settings/
│       └── SettingsScreen.tsx
├── components/
│   ├── StatCard.tsx
│   ├── NutritionChart.tsx
│   └── MealCard.tsx
├── services/
│   ├── api.ts              # API functions
│   └── http.ts             # HTTP client with auth
├── hooks/
│   └── useToast.tsx
└── utils/
    └── helpers.ts
```

## Tính năng

### ✅ Đã hoàn thành
- [x] Đăng nhập / Đăng ký
- [x] Onboarding (nhập thông tin cá nhân)
- [x] Dashboard với thống kê sức khỏe
- [x] Theo dõi bữa ăn (Food Diary)
- [x] Theo dõi bài tập (Exercises)
- [x] Tiến trình & biểu đồ (Progress)
- [x] Chat AI (Messages)
- [x] Cài đặt & chỉnh sửa profile

### 📋 Có thể mở rộng
- [ ] Quét barcode thực phẩm
- [ ] Camera nhận diện đồ ăn
- [ ] Nhắc nhở uống nước
- [ ] Đồng bộ với Apple Health / Google Fit
- [ ] Dark mode
- [ ] Đa ngôn ngữ

## API Endpoints

Ứng dụng sử dụng các endpoints từ backend HealthyCare:

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/users/me` - Lấy thông tin user
- `PUT /api/users/me` - Cập nhật profile
- `GET /api/food-log` - Lấy danh sách bữa ăn
- `POST /api/food-log` - Thêm bữa ăn
- `GET /api/workout-log` - Lấy danh sách bài tập
- `POST /api/workout-log` - Thêm bài tập
- `GET /api/statistics/daily` - Thống kê ngày
- `GET /api/statistics/weekly` - Thống kê tuần
- `GET /api/body-measurements` - Số đo cơ thể
- `POST /api/chat` - Chat với AI

## Scripts

```bash
npm start       # Khởi động Expo
npm run android # Chạy trên Android
npm run ios     # Chạy trên iOS
npm run web     # Chạy trên web
npm run lint    # Kiểm tra linting
```

## Lưu ý

1. **Secure Store**: Tokens được lưu bảo mật bằng `expo-secure-store`
2. **Charts**: Sử dụng `react-native-chart-kit` và `react-native-svg`
3. **Navigation**: Sử dụng `@react-navigation` v6
4. **Icons**: Sử dụng `@expo/vector-icons` (Ionicons)

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra BASE_URL trong `src/services/http.ts`
- Đảm bảo backend đang chạy
- Kiểm tra firewall và network

### Lỗi build
```bash
# Clear cache
expo start -c

# Reset dependencies
rm -rf node_modules
npm install
```

### Lỗi trên Android
- Kiểm tra đã cài Android Studio
- Kiểm tra biến môi trường ANDROID_HOME

## License

MIT
