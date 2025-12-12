# Hướng dẫn chạy Backend + Frontend với Expo Go

## Bước 1: Khởi động Backend

```bash
cd D:\Codespace\healthy-care-mobile\back-end
npm run dev
```

Backend sẽ chạy tại: `http://localhost:3001`

## Bước 2: Khởi động Frontend với Expo

```bash
cd D:\Codespace\healthy-care-mobile\front-end
npx expo start
```

Hoặc nếu đã cài Expo CLI:
```bash
expo start
```

## Bước 3: Kết nối với Expo Go

1. **Trên điện thoại**: Cài đặt app **Expo Go** từ:
   - iOS: App Store
   - Android: Google Play Store

2. **Kết nối cùng WiFi**: Đảm bảo máy tính và điện thoại cùng mạng WiFi

3. **Quét QR Code**:
   - iOS: Mở Camera và quét QR code hiện trên terminal
   - Android: Mở app Expo Go và quét QR code

## Cấu hình đã thiết lập

### Backend (.env)
- ✅ CORS đã cho phép tất cả origins trong development
- ✅ Port: 3001
- ✅ Gemini AI: gemini-2.5-flash

### Frontend
- ✅ Auto-detect IP từ Expo dev server
- ✅ Tự động kết nối đến backend qua địa chỉ IP local

## Kiểm tra kết nối

Khi app khởi động, xem console log để kiểm tra:
```
🌐 API Base URL: http://192.168.x.x:3001
📡 HTTP Service initialized with BASE_URL: http://192.168.x.x:3001
```

## Troubleshooting

### Lỗi "Network Error" hoặc không kết nối được:

1. **Kiểm tra Backend đang chạy**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Kiểm tra Firewall**:
   - Cho phép Node.js qua Windows Firewall
   - Port 3001 và 19000-19006 cần được mở

3. **Kiểm tra cùng WiFi**:
   - Máy tính và điện thoại phải cùng mạng WiFi
   - Không dùng WiFi công cộng (có thể chặn peer-to-peer)

4. **Restart cả 2 services**:
   ```bash
   # Stop backend (Ctrl+C)
   # Stop expo (Ctrl+C)
   # Start lại từ đầu
   ```

### IP addresses của máy bạn:
```
- 192.168.44.1
- 192.168.208.1
- 26.145.30.129
- 172.30.224.1
```

Frontend sẽ tự động detect IP phù hợp từ Expo dev server.

## Scripts hữu ích

### Backend
```bash
npm run dev          # Development mode với auto-reload
npm start            # Production mode
npm run prisma:studio # Mở Prisma Studio xem database
```

### Frontend
```bash
expo start           # Bắt đầu dev server
expo start --clear   # Clear cache và restart
expo start --tunnel  # Dùng tunnel nếu không cùng WiFi
```

## Note quan trọng

- 🔒 **Production**: Nhớ thay đổi CORS origins về whitelist cụ thể
- 🔑 **JWT Secrets**: Đổi sang secrets an toàn hơn trong production
- 🔐 **Gemini API Key**: Không commit API key lên Git
