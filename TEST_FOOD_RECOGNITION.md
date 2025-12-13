# 🧪 Hướng dẫn Test Chức năng Nhận diện Đồ ăn

## ✅ Backend đã sẵn sàng
- ✓ Server: http://localhost:3001
- ✓ Endpoint: `/api/ai/recognize-and-save-food`

---

## 📱 **Cách 1: Test qua App (Khuyến nghị)**

### Bước 1: Khởi động Frontend
```bash
cd d:\Codespace\healthy-care-mobile\front-end
npm start
# Hoặc: npx expo start
```

### Bước 2: Mở App trên thiết bị
- Scan QR code bằng Expo Go (Android/iOS)
- Hoặc press `a` để mở Android Emulator
- Hoặc press `i` để mở iOS Simulator

### Bước 3: Test chức năng
1. **Login vào app** với tài khoản test
2. Vào tab **"AI Chat"** (Trợ lý sức khỏe AI)
3. Nhấn nút **camera icon** ở góc dưới bên phải
4. Chọn:
   - **"📷 Chụp ảnh"** → Chụp ảnh đồ ăn
   - **"🖼️ Chọn từ thư viện"** → Chọn ảnh có sẵn
5. Chờ AI nhận diện (3-5 giây)
6. Kiểm tra kết quả:
   - ✅ Hiển thị tên món ăn
   - ✅ Hiển thị calories, protein, carbs, fat
   - ✅ Thông báo "Đã lưu vào nhật ký ăn uống! (ID: xxx)"
7. **Xác nhận đã lưu**: Vào tab **"Ăn uống"** → Xem food log vừa thêm

---

## 🔧 **Cách 2: Test bằng Postman/Thunder Client**

### Endpoint
```
POST http://localhost:3001/api/ai/recognize-and-save-food
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

### Body (JSON)
```json
{
  "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "mealType": "lunch",
  "eatenAt": "2025-12-13T12:30:00.000Z"
}
```

### Lấy Access Token:
1. Login trước qua endpoint:
```bash
POST http://localhost:3001/api/auth/login
Body: {"email": "test@example.com", "password": "password123"}
```
2. Copy `accessToken` từ response

### Lấy Base64 Image:
**Option A - Từ file ảnh:**
```powershell
$bytes = [System.IO.File]::ReadAllBytes("C:\path\to\food.jpg")
$base64 = [Convert]::ToBase64String($bytes)
"data:image/jpeg;base64,$base64" | Set-Clipboard
```

**Option B - Dùng ảnh test online:**
- Google "food base64 image" hoặc dùng: https://www.base64-image.de/
- Upload ảnh đồ ăn → Copy base64 string

### Response mong đợi:
```json
{
  "success": true,
  "data": {
    "foodName": "Phở bò",
    "amount": "1 tô lớn (500g)",
    "calories": 450,
    "protein": 28,
    "carbs": 62,
    "fat": 8,
    "sugar": 3
  },
  "foodLog": {
    "id": 123,
    "eatenAt": "2025-12-13T12:30:00.000Z",
    "mealType": "lunch"
  },
  "message": "Food recognized and saved successfully"
}
```

---

## 🖥️ **Cách 3: Test bằng PowerShell Script**

### Script test nhanh:
```powershell
# 1. Login để lấy token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"password123"}'

$token = $loginResponse.accessToken
Write-Host "✓ Logged in. Token: $($token.Substring(0,20))..." -ForegroundColor Green

# 2. Đọc ảnh và convert sang base64
$imagePath = "C:\path\to\food.jpg"  # Thay đường dẫn ảnh của bạn
$bytes = [System.IO.File]::ReadAllBytes($imagePath)
$base64 = [Convert]::ToBase64String($bytes)
$base64Image = "data:image/jpeg;base64,$base64"
Write-Host "✓ Image converted to base64" -ForegroundColor Green

# 3. Gọi API nhận diện và lưu
$body = @{
  base64Image = $base64Image
  mealType = "lunch"
  eatenAt = (Get-Date).ToString("o")
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/ai/recognize-and-save-food" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization = "Bearer $token"} `
  -Body $body

# 4. Hiển thị kết quả
Write-Host "`n🍽️  Kết quả nhận diện:" -ForegroundColor Cyan
Write-Host "   Tên món: $($response.data.foodName)" -ForegroundColor Yellow
Write-Host "   Khẩu phần: $($response.data.amount)" -ForegroundColor Yellow
Write-Host "   Calories: $($response.data.calories) kcal" -ForegroundColor Yellow
Write-Host "   Protein: $($response.data.protein)g" -ForegroundColor Yellow
Write-Host "   Carbs: $($response.data.carbs)g" -ForegroundColor Yellow
Write-Host "   Fat: $($response.data.fat)g" -ForegroundColor Yellow
Write-Host "`n✅ Đã lưu vào food log với ID: $($response.foodLog.id)" -ForegroundColor Green
```

---

## 🐛 **Xử lý lỗi thường gặp**

### Lỗi 401 Unauthorized
```
Error: User authentication required
```
**Fix**: Đảm bảo đã login và gửi đúng Bearer token

### Lỗi 400 Bad Request
```
Error: Missing base64Image
```
**Fix**: Kiểm tra base64Image có trong request body

### Lỗi 500 Internal Server Error
```
Error: Gemini API key not configured
```
**Fix**: Kiểm tra file `.env` có `GEMINI_API_KEY=...`

### Không nhận diện được đồ ăn
```
success: false, error: "Could not recognize food from image"
```
**Fix**: 
- Dùng ảnh rõ nét hơn
- Đảm bảo đồ ăn ở trung tâm ảnh
- Thử ảnh khác

---

## ✅ **Checklist Test**

- [ ] Backend đang chạy (port 3001)
- [ ] Frontend đang chạy (Expo)
- [ ] Đã login thành công
- [ ] Camera permission đã được cấp
- [ ] Chụp/chọn ảnh đồ ăn
- [ ] AI nhận diện thành công
- [ ] Hiển thị đầy đủ thông tin dinh dưỡng
- [ ] Thông báo "Đã lưu vào nhật ký"
- [ ] Kiểm tra tab "Ăn uống" thấy food log mới
- [ ] Kiểm tra tab "Tiến trình" thấy calo tăng

---

## 📊 **Kiểm tra Database**

Xem food log vừa tạo:
```sql
SELECT * FROM FoodLog 
ORDER BY createdAt DESC 
LIMIT 5;
```

Hoặc qua API:
```bash
GET http://localhost:3001/api/food-log
Authorization: Bearer <token>
```
