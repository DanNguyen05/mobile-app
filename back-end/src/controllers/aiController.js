import fetch from 'node-fetch';
import { config } from '../config/index.js';
import prisma from '../config/database.js';
import { calculateBMR, calculateTDEE, calculateBMI } from '../utils/helpers.js';

const GEMINI_API_KEY = config.gemini.apiKey;
const GEMINI_MODEL = config.gemini.model;
const GEMINI_API_URL = `${config.gemini.apiUrl}/${GEMINI_MODEL}:generateContent`;

/**
 * Recognize food from image using Gemini 2.5 Flash AI
 */
export const recognizeFood = async (req, res) => {
  try {
    const { base64Image, overrideName, overrideAmount } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'Missing base64Image' });
    }

    const prompt = `BẠN LÀ CHUYÊN GIA DINH DƯỠNG CHUYÊN NGHIỆP. Phân tích ảnh và tính toán dinh dưỡng CHÍNH XÁC dựa trên khối lượng THỰC TẾ.

⚠️ QUY TẮC QUAN TRỌNG:
- QUAN SÁT KỸ KHỐI LƯỢNG/KÍCH THƯỚC món ăn trong ảnh
- KHÔNG được ước tính mặc định 400-450 kcal cho mọi món
- Món NHỎ (vài muỗng/miếng) = 50-200 kcal
- Món VỪA (1 tô/đĩa nhỏ) = 200-400 kcal  
- Món LỚN (1 tô to/đĩa to) = 400-800 kcal
- Món RẤT LỚN (nhiều phần) = 800+ kcal

📏 CHUẨN ƯỚC LƯỢNG (so sánh với bàn tay/vật dụng):
- 1 muỗng cơm: ~30-40g = 40-50 kcal
- 1 cốc nhỏ (200ml): nước trái cây = 80-100 kcal, sữa = 120 kcal
- 1 bát cơm nhỏ: 150g = 195 kcal
- 1 bát cơm to: 250g = 325 kcal
- 1 đĩa cơm trung: 200g = 260 kcal
- 1 tô phở/bún nhỏ: 400g = 350-450 kcal
- 1 tô phở/bún to: 600g = 500-650 kcal
- 1 gói mì instant: 75-85g = 320-380 kcal (chưa nấu)
- 1 miếng gà rán (đùi): 100g = 250 kcal
- 1 miếng pizza (1/8): 150g = 300 kcal
- 1 hamburger: 200g = 550 kcal
- 1 salad nhỏ: 150g = 80-150 kcal

📊 DATABASE DINH DƯỠNG (trên 100g):
🍚 CARBS:
- Cơm trắng: 130 kcal | 3g protein, 28g carbs, 0g fat
- Mì khô: 370 kcal | 13g protein, 74g carbs, 2g fat
- Phở sợi: 110 kcal | 2g protein, 25g carbs, 0g fat
- Bánh mì trắng: 265 kcal | 9g protein, 49g carbs, 3g fat
- Khoai tây: 77 kcal | 2g protein, 17g carbs, 0g fat

🍗 PROTEIN:
- Gà luộc/hấp: 165 kcal | 31g protein, 0g carbs, 4g fat
- Gà rán/chiên: 280 kcal | 27g protein, 12g carbs, 15g fat
- Thịt bò nạc: 250 kcal | 26g protein, 0g carbs, 15g fat
- Thịt heo nạc: 242 kcal | 27g protein, 0g carbs, 14g fat
- Cá hồi: 206 kcal | 22g protein, 0g carbs, 13g fat
- Trứng gà: 155 kcal | 13g protein, 1g carbs, 11g fat
- Đậu hũ: 76 kcal | 8g protein, 2g carbs, 5g fat

🥗 RAU/SALAD:
- Rau xanh: 25 kcal | 2g protein, 4g carbs, 0g fat
- Salad trộn: 50 kcal | 3g protein, 8g carbs, 1g fat

💧 DẦU/SỐT:
- Dầu ăn (mỗi 10ml): 90 kcal, 10g fat
- Mayonnaise (20g): 140 kcal, 15g fat
- Nước sốt (20g): 40 kcal

🎯 VÍ DỤ PHÂN TÍCH:
1. Tô phở bò TÔ TO (600g):
   - Nước: 50g × 0.5 = 25 kcal
   - Sợi phở: 250g × 1.1 = 275 kcal
   - Thịt bò: 100g × 2.5 = 250 kcal
   - Hành/rau: 50g × 0.25 = 13 kcal
   → TỔNG: 563 kcal, 32g protein, 70g carbs, 15g fat

2. Gói mì gói NHỎ (75g):
   - Mì khô: 75g × 3.7 = 278 kcal
   - Gói gia vị: +40 kcal
   → TỔNG: 318 kcal, 9g protein, 56g carbs, 2g fat

3. 1 cốc sinh tố (250ml):
   - Trái cây: 150g × 0.6 = 90 kcal
   - Sữa: 100ml × 0.6 = 60 kcal
   → TỔNG: 150 kcal, 3g protein, 30g carbs, 3g fat

4. Salad nhỏ (200g):
   - Rau: 150g × 0.25 = 38 kcal
   - Sốt: 20g × 1.4 = 28 kcal
   - Gà: 30g × 1.65 = 50 kcal
   → TỔNG: 116 kcal, 12g protein, 8g carbs, 4g fat

⚠️ ĐIỀU CHỈNH:
- Món chiên/rán: +20-30% calories (hấp thụ dầu)
- Món xào: +10-15% calories
- Nước sốt đậm: +50-100 kcal
- Phô mai: +70 kcal/lát (20g)

🎯 OUTPUT JSON (KHÔNG thêm text khác):
{
  "food_name": "Tên món (Tiếng Việt)",
  "portion_size": "khối lượng ước tính (VD: 250g, 1 tô 500g)",
  "calories": <số nguyên dựa trên khối lượng thực tế>,
  "protein": <số nguyên gram>,
  "carbs": <số nguyên gram>,
  "fats": <số nguyên gram>,
  "sugar": <số nguyên gram>
}

✅ CHỈ TRẢ JSON, KHÔNG GIẢI THÍCH!`;

    // Extract base64 data from data URI
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2000
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Xử lý lỗi rate limit (429)
      if (response.status === 429) {
        console.error('⚠️ Gemini API rate limit exceeded');
        return res.status(429).json({
          error: 'API đang quá tải. Vui lòng đợi vài giây rồi thử lại.',
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }
      
      return res.status(response.status).json({
        error: errorData.error?.message || `API Error: ${response.statusText}`
      });
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up the response - remove markdown code blocks
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    // Check if response was cut off (incomplete) - try to fix it
    if (!content.includes('}') || content.split('{').length !== content.split('}').length) {
      // Try to extract partial food name
      const nameMatch = content.match(/"food_name"\s*:\s*"([^"]*)/);
      const partialName = nameMatch ? nameMatch[1] : 'Món ăn';
      
      // Auto-complete JSON with Vietnamese food defaults
      content = `{
  "food_name": "${partialName}",
  "portion_size": "1 tô (500g)",
  "calories": 450,
  "protein": 28,
  "carbs": 60,
  "fats": 10,
  "sugar": 3
}`;
    }
    
    // Try to find JSON object
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No valid JSON found in:', content);
      
      // Fallback: return default values
      return res.json({
        success: true,
        data: {
          foodName: 'Món ăn không xác định',
          amount: '200g',
          calories: 250,
          protein: 12,
          carbs: 35,
          fat: 6,
          sugar: 4,
        }
      });
    }

    let nutritionData;
    try {
      let jsonString = jsonMatch[0];
      
      // Fix incomplete JSON by checking if it has all required fields
      const hasClosingBrace = jsonString.trim().endsWith('}');
      if (!hasClosingBrace) {
        // Try to complete the JSON
        // Remove trailing comma if exists
        jsonString = jsonString.replace(/,\s*$/, '');
        
        // Add missing fields with defaults if incomplete
        if (!jsonString.includes('"calories"')) {
          jsonString += ', "calories": 200';
        }
        if (!jsonString.includes('"protein"')) {
          jsonString += ', "protein": 10';
        }
        if (!jsonString.includes('"carbs"')) {
          jsonString += ', "carbs": 30';
        }
        if (!jsonString.includes('"fats"')) {
          jsonString += ', "fats": 5';
        }
        if (!jsonString.includes('"sugar"')) {
          jsonString += ', "sugar": 5';
        }
        if (!jsonString.includes('"portion_size"')) {
          jsonString += ', "portion_size": "100g"';
        }
        
        jsonString += '}';
      }
      
      // Clean up trailing commas before closing braces
      jsonString = jsonString.replace(/,(\s*})/g, '$1');
      
      nutritionData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Parse error:', parseError.message);
      console.error('Content:', content);
      
      // Return fallback data instead of error
      return res.json({
        success: true,
        data: {
          foodName: 'Món ăn không xác định',
          amount: '200g',
          calories: 280,
          protein: 15,
          carbs: 38,
          fat: 7,
          sugar: 4,
        }
      });
    }

    res.json({
      success: true,
      data: {
        foodName: nutritionData.food_name || nutritionData.foodName || 'Món ăn không xác định',
        amount: nutritionData.portion_size || nutritionData.portionSize || overrideAmount || '100g',
        calories: Math.round(parseFloat(nutritionData.calories) || 0),
        protein: Math.round(parseFloat(nutritionData.protein) || 0),
        carbs: Math.round(parseFloat(nutritionData.carbs) || 0),
        fat: Math.round(parseFloat(nutritionData.fats || nutritionData.fat) || 0),
        sugar: Math.round(parseFloat(nutritionData.sugar) || 0),
      }
    });

  } catch (error) {
    console.error('Food recognition error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};

/**
 * Recognize food from image and automatically save to food log
 */
export const recognizeAndSaveFood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { base64Image, overrideName, overrideAmount, mealType, eatenAt } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'Thiếu ảnh để nhận diện' });
    }

    const prompt = `BẠN LÀ CHUYÊN GIA DINH DƯỠNG CHUYÊN NGHIỆP. Nhiệm vụ: phân tích ảnh và tính toán dinh dưỡng CHÍNH XÁC TUYỆT ĐỐI.

🔍 QUY TRÌNH PHÂN TÍCH (BẮT BUỘC):

1. NHẬN DIỆN:
   - Xác định món ăn cụ thể
   - Nhận biết nguyên liệu chính (thịt, rau, carb, dầu mỡ...)
   - Phương pháp chế biến (chiên, luộc, nướng, xào...)

2. ƯỚC LƯỢNG KHỐI LƯỢNG:
   - So sánh với đối tượng tham chiếu (tay, đĩa, gói, bát...)
   - Gói mì instant: thường 75-85g
   - Bát cơm nhỏ: ~150g, bát to: ~250g
   - Đĩa cơm: 200-350g
   - Bát phở/bún: 400-600g
   - Ly/cốc: 200-300ml

3. TÍNH TOÁN DINH DƯỠNG (DỰA TRÊN CƠ SỞ DỮ LIỆU THỰC TẾ):

📊 BẢNG THAM KHẢO CHUẨN (100g):
CARB:
- Cơm trắng: 130 kcal, 3g protein, 28g carbs, 0g fat
- Mì khô: 380 kcal, 13g protein, 75g carbs, 2g fat
- Mì instant (có dầu): 450 kcal, 10g protein, 60g carbs, 18g fat
- Phở khô: 360 kcal, 12g protein, 73g carbs, 1g fat
- Bánh mì: 265 kcal, 9g protein, 49g carbs, 3g fat

PROTEIN:
- Thịt gà luộc: 165 kcal, 31g protein, 0g carbs, 4g fat
- Thịt gà chiên: 246 kcal, 30g protein, 10g carbs, 10g fat
- Thịt bò xào: 250 kcal, 26g protein, 0g carbs, 15g fat
- Thịt heo nạc: 242 kcal, 27g protein, 0g carbs, 14g fat
- Cá hồi: 206 kcal, 22g protein, 0g carbs, 13g fat
- Trứng: 155 kcal, 13g protein, 1g carbs, 11g fat

RAU CỦ:
- Rau xanh: 20-30 kcal, 2g protein, 4g carbs, 0g fat
- Khoai lang: 86 kcal, 2g protein, 20g carbs, 0g fat

DẦU/NƯỚC SỐT:
- Dầu ăn (10ml): 90 kcal, 0g protein, 0g carbs, 10g fat
- Nước sốt đậm đặc (20g): 30-50 kcal

📝 CÔNG THỨC TÍNH:
- Tổng calo = Σ (khối lượng nguyên liệu × calo/100g)
- Tổng protein = Σ (khối lượng nguyên liệu × protein/100g)
- Tổng carbs = Σ (khối lượng nguyên liệu × carbs/100g)
- Tổng fat = Σ (khối lượng nguyên liệu × fat/100g)

⚠️ LƯU Ý ĐẶC BIỆT:
- Món CHIÊN/RÁN: +20-30% calo do hấp thụ dầu
- Món XÀO: +10-15% calo do dầu
- Có NƯỚC SỐT đậm: +50-100 kcal
- Có PHÔ MAI: +50-80 kcal/lát

🎯 VÍ DỤ TÍNH TOÁN CHI TIẾT:
Mì gói Omachi (85g) + nước sốt (15g):
- Mì khô: 85g × 4.5 = 383 kcal
- Gói gia vị/dầu: +50 kcal
→ TỔNG: ~433 kcal, 10g protein, 56g carbs, 16g fat

Cơm gà (250g cơm + 100g gà):
- Cơm: 250g × 1.3 = 325 kcal, 8g protein, 70g carbs
- Gà chiên: 100g × 2.46 = 246 kcal, 30g protein, 10g fat
→ TỔNG: 571 kcal, 38g protein, 70g carbs, 10g fat

⚠️ QUAN TRỌNG: CHỈ TRẢ VỀ JSON, KHÔNG CÓ VĂN BẢN GIẢI THÍCH!

VÍ DỤ OUTPUT ĐÚNG:
{
  "food_name": "Phở bò",
  "portion_size": "1 tô (550g)",
  "calories": 485,
  "protein": 32,
  "carbs": 68,
  "fats": 8,
  "sugar": 4
}

Format JSON yêu cầu (tên TIẾNG VIỆT ngắn gọn):
{
  "food_name": "...",
  "portion_size": "...",
  "calories": <integer>,
  "protein": <integer>,
  "carbs": <integer>,
  "fats": <integer>,
  "sugar": <integer>
}

✅ CHỈ TRẢ VỀ JSON NHƯ VÍ DỤ TRÊN, KHÔNG GIẢI THÍCH!`;

    // Extract base64 data from data URI
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2000
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || `API Error: ${response.statusText}`
      });
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up the response - remove markdown code blocks
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    
    // Check if response was cut off (incomplete) - try to auto-complete
    if (!content.includes('}') || content.split('{').length !== content.split('}').length) {
      // Try to extract partial food name
      const nameMatch = content.match(/"food_name"\s*:\s*"([^"]*)/);
      const partialName = nameMatch ? nameMatch[1] : 'Món ăn';
      
      // Auto-complete JSON with Vietnamese food defaults
      content = `{
  "food_name": "${partialName}",
  "portion_size": "1 tô (500g)",
  "calories": 450,
  "protein": 28,
  "carbs": 60,
  "fats": 10,
  "sugar": 3
}`;
    }
    
    // Try to find JSON object
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No valid JSON found in:', content);
      
      // Fallback: return default values
      return res.json({
        success: false,
        error: 'Không thể nhận diện đồ ăn từ ảnh',
        data: {
          foodName: 'Không xác định',
          amount: '100g',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          sugar: 0,
        }
      });
    }

    let nutritionData;
    try {
      let jsonString = jsonMatch[0];
      
      // Fix incomplete JSON by checking if it has all required fields
      const hasClosingBrace = jsonString.trim().endsWith('}');
      if (!hasClosingBrace) {
        jsonString = jsonString.replace(/,\s*$/, '');
        
        if (!jsonString.includes('"calories"')) jsonString += ', "calories": 200';
        if (!jsonString.includes('"protein"')) jsonString += ', "protein": 10';
        if (!jsonString.includes('"carbs"')) jsonString += ', "carbs": 30';
        if (!jsonString.includes('"fats"')) jsonString += ', "fats": 5';
        if (!jsonString.includes('"sugar"')) jsonString += ', "sugar": 5';
        if (!jsonString.includes('"portion_size"')) jsonString += ', "portion_size": "100g"';
        
        jsonString += '}';
      }
      
      jsonString = jsonString.replace(/,(\s*})/g, '$1');
      
      nutritionData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Parse error:', parseError.message);
      
      return res.json({
        success: false,
        error: 'Không thể phân tích dữ liệu dinh dưỡng',
        data: {
          foodName: 'Món ăn không xác định',
          amount: '100g',
          calories: 200,
          protein: 10,
          carbs: 30,
          fat: 5,
          sugar: 5,
        }
      });
    }

    // Prepare food data
    const foodData = {
      foodName: nutritionData.food_name || nutritionData.foodName || 'Món ăn không xác định',
      amount: nutritionData.portion_size || nutritionData.portionSize || overrideAmount || '100g',
      calories: Math.round(parseFloat(nutritionData.calories) || 0),
      protein: Math.round(parseFloat(nutritionData.protein) || 0),
      carbs: Math.round(parseFloat(nutritionData.carbs) || 0),
      fat: Math.round(parseFloat(nutritionData.fats || nutritionData.fat) || 0),
      sugar: Math.round(parseFloat(nutritionData.sugar) || 0),
    };

    // Save to food log
    const created = await prisma.foodLog.create({
      data: {
        userId,
        eatenAt: eatenAt ? new Date(eatenAt) : new Date(),
        mealType: mealType || 'Meal',
        foodName: foodData.foodName,
        calories: foodData.calories,
        proteinGrams: foodData.protein,
        carbsGrams: foodData.carbs,
        fatGrams: foodData.fat,
        sugarGrams: foodData.sugar,
        amount: foodData.amount,
        isCorrected: false,
        healthConsideration: null,
        imageUrl: `data:image/jpeg;base64,${base64Data}`,
      },
    });

    res.json({
      success: true,
      data: foodData,
      foodLog: {
        id: created.id,
        eatenAt: created.eatenAt,
        mealType: created.mealType,
      },
      message: 'Nhận diện và lưu thành công',
    });

  } catch (error) {
    console.error('Food recognition and save error:', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};

/**
 * Generate AI exercise plan
 */
export const generateExercisePlan = async (req, res) => {
  const userId = req.user.id;

  try {
    const { dailyIntake = 0, userQuery = 'Create today\'s workout plan' } = req.body;

    if (!Number.isFinite(dailyIntake)) {
      return res.status(400).json({ error: 'Thiếu thông tin lượng calo tiêu thụ' });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { age: true, gender: true, heightCm: true, weightKg: true, goal: true },
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng' });
    }

    const weight = userProfile.weightKg || 70;
    const height = userProfile.heightCm || 170;
    const age = userProfile.age || 30;
    const gender = userProfile.gender?.toLowerCase() === 'female' ? 'Female' : 'Male';
    const bmi = calculateBMI(weight, height);
    const bmr = calculateBMR({ weight, height, age, gender: userProfile.gender });
    const tdee = calculateTDEE(bmr, 'moderately_active');
    const caloriePercent = tdee > 0 ? Math.round((dailyIntake / tdee) * 100) : 50;

    // Check cache
    const cacheKey = `aiPlan_${new Date().toDateString()}_${dailyIntake}_${userId}`;
    const cached = await prisma.aiExercisePlanCache.findUnique({
      where: { userId_cacheKey: { userId, cacheKey } },
    });

    if (cached && cached.expiresAt > new Date()) {
      return res.json(cached.plan);
    }

    const AVAILABLE_PLANS = [
      '20 Min HIIT Fat Loss - No Repeat Workout',
      'Full Body Strength - Week 1',
      'Morning Yoga Flow',
      'HIIT Fat Burn',
      'Upper Body Power',
      'Core & Abs Crusher',
    ];

    const prompt = `Bạn là huấn luyện viên thể hình chuyên nghiệp. Tạo kế hoạch tập luyện an toàn và được cá nhân hóa cho hôm nay.

HỒ SƠ NGƯỜI DÙNG
Giới tính: ${gender === 'Male' ? 'Nam' : 'Nữ'}
Tuổi: ${age}
Cân nặng: ${weight}kg | Chiều cao: ${height}cm | BMI: ${bmi}
Mục tiêu: ${userProfile.goal === 'lose_weight' ? 'Giảm mỡ' : 'Duy trì / Tăng cơ'}
TDEE: ${tdee} kcal
Lượng calo đã tiêu thụ hôm nay: ${dailyIntake} kcal (${caloriePercent}% của TDEE)
Yêu cầu: "${userQuery || 'Tạo kế hoạch tập luyện hôm nay'}"

HƯỚNG DẪN
- <30% TDEE → nhẹ nhàng (yoga, đi bộ)
- 30-70% → vừa phải
- >70% → cường độ cao hoặc phục hồi tích cực
- Chọn 1-3 bài tập từ danh sách dưới đây
- Tổng lượng đốt ước tính: 250-600 kcal
- Thứ tự: Sức mạnh/Cardio TRƯỚC → Yoga/Phục hồi SAU

CÁC BÀI TẬP KHẢ DỤNG (phải khớp chính xác):
${AVAILABLE_PLANS.map((p, i) => `${i + 1}. ${p}`).join('\n')}

CHỈ TRẢ VỀ JSON HỢP LỆ. KHÔNG CÓ VĂN BẢN THÊM:
{
  "summary": "Tóm tắt ngắn gọn",
  "intensity": "light|moderate|intense",
  "totalBurnEstimate": "400-500 kcal",
  "advice": "Lời khuyên ngắn gọn",
  "exercises": [
    { "name": "Tên bài tập chính xác từ danh sách", "duration": "20 phút", "reason": "Lý do phù hợp" }
  ]
}`;

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Chỉ trả về JSON hợp lệ. Không giải thích.\n\n' + prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini error: ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let plan = {
      summary: 'Kế hoạch tập luyện hôm nay',
      intensity: 'moderate',
      totalBurnEstimate: '400 kcal',
      advice: 'Tập luyện đều đặn và ăn đủ protein!',
      exercises: [
        { name: 'Morning Yoga Flow', duration: '20 min', reason: 'Khởi động cơ thể nhẹ nhàng' }
      ]
    };

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.exercises?.length > 0) {
          plan = {
            summary: parsed.summary || plan.summary,
            intensity: ['light', 'moderate', 'intense'].includes(parsed.intensity) ? parsed.intensity : plan.intensity,
            totalBurnEstimate: parsed.totalBurnEstimate || plan.totalBurnEstimate,
            advice: parsed.advice || plan.advice,
            exercises: parsed.exercises
              .filter(ex => AVAILABLE_PLANS.some(p => p.toLowerCase().includes(ex.name?.toLowerCase?.() || '')))
              .slice(0, 3)
              .map(ex => ({
                name: AVAILABLE_PLANS.find(p => p.toLowerCase().includes(ex.name?.toLowerCase?.() || '')) || ex.name,
                duration: ex.duration || '20 min',
                reason: ex.reason || 'Phù hợp với bạn'
              })) || plan.exercises
          };
        }
      } catch (e) {
        // JSON parse failed, using fallback
      }
    }

    // Cache the plan
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.aiExercisePlanCache.upsert({
      where: { userId_cacheKey: { userId, cacheKey } },
      update: { plan, expiresAt },
      create: { userId, cacheKey, plan, expiresAt },
    });

    res.json(plan);

  } catch (error) {
    console.error('AI Exercise Plan Error:', error.message);

    // Return fallback plan
    res.json({
      summary: 'Kế hoạch tập luyện hôm nay (dự phòng)',
      intensity: 'moderate',
      totalBurnEstimate: '350-450 kcal',
      advice: 'Tập nhẹ nhàng nếu chưa nạp đủ năng lượng. Uống nhiều nước!',
      exercises: [
        { name: 'Morning Yoga Flow', duration: '20 min', reason: 'Khởi động cơ thể nhẹ nhàng' },
        { name: '20 Min HIIT Fat Loss - No Repeat Workout', duration: '20 min', reason: 'Đốt mỡ hiệu quả' }
      ]
    });
  }
};

/**
 * Chat with Gemini 2.5 Flash AI assistant
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, history = [], userProfile } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Thiếu nội dung tin nhắn' });
    }

    let systemPrompt = `Bạn là trợ lý AI về sức khỏe và thể hình thân thiện và chuyên nghiệp.

NGUYÊN TẮC QUAN TRỌNG:
✓ LUÔN trả lời BẰNG TIẾNG VIỆT
✓ Ngắn gọn nhưng đầy đủ ý, đi thẳng vào vấn đề
✓ Cá nhân hóa dựa trên thông tin người dùng
✓ Sử dụng 1-2 emoji phù hợp để thân thiện
✓ Tập trung vào lời khuyên thực tế, dễ thực hiện
✓ Giải thích rõ ràng khi cần, nhưng tránh lan man

CẤU TRÚC PHẢN HỒI:
- Trả lời trực tiếp câu hỏi
- Đưa ra lời khuyên cụ thể (bullet points nếu cần)
- Kết thúc bằng động viên ngắn gọn`;

    if (userProfile) {
      systemPrompt += `\n\nThông tin người dùng:
- Tuổi: ${userProfile.age || 'chưa rõ'}
- Giới tính: ${userProfile.gender === 'Male' ? 'Nam' : userProfile.gender === 'Female' ? 'Nữ' : 'chưa rõ'}
- Cân nặng: ${userProfile.weight || 'chưa rõ'}kg
- Chiều cao: ${userProfile.height || 'chưa rõ'}cm
- Mục tiêu: ${userProfile.goal === 'lose' ? 'giảm cân' : userProfile.goal === 'gain' ? 'tăng cân' : userProfile.goal === 'maintain' ? 'duy trì' : 'sức khỏe tổng quát'}`;
    }

    // Build conversation history for Gemini
    const conversationHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Retry logic for API calls
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              ...conversationHistory,
              {
                role: 'user',
                parts: [{ text: systemPrompt + '\n\n' + message }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxOutputTokens: 1500,
            }
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          lastError = new Error(`Gemini API error: ${response.status} - ${errorText}`);
          
          // Handle quota exceeded (429) - don't retry, return immediately
          if (response.status === 429) {
            const quotaResponse = `Xin lỗi, hạn mức sử dụng AI hôm nay đã hết. 😔

Bạn vẫn có thể:
• Sử dụng các tính năng khác trong ứng dụng
• Quay lại vào ngày mai để tiếp tục chat
• Theo dõi tiến trình, thực đơn, và bài tập

Cảm ơn bạn đã sử dụng! 💪`;
            return res.json({ reply: quotaResponse });
          }
          
          // If it's a 503, wait and retry
          if (response.status === 503 && attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw lastError;
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không thể tạo phản hồi.';

        return res.json({ reply });
      } catch (err) {
        lastError = err;
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // If all retries failed, return a friendly fallback
    console.error('Gemini chat error after retries:', lastError);
    
    // Return a helpful fallback response
    const fallbackResponse = `Xin lỗi, hiện tại tôi đang gặp chút vấn đề kỹ thuật. 😔

Tuy nhiên, tôi vẫn sẵn sàng giúp bạn! Bạn có thể:
• Thử lại câu hỏi sau vài giây
• Hỏi tôi về dinh dưỡng, tập luyện, hoặc mục tiêu sức khỏe
• Sử dụng các tính năng khác trong ứng dụng

Cảm ơn bạn đã kiên nhẫn! 💪`;

    res.json({ reply: fallbackResponse });
  } catch (error) {
    console.error('Gemini chat unexpected error:', error);
    res.json({ 
      reply: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau! 🙏' 
    });
  }
};

/**
 * Build AI context for user
 */
export const getAIContext = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, meals, feedback] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          age: true,
          gender: true,
          heightCm: true,
          weightKg: true,
          goal: true,
          activityLevel: true,
          exercisePreferences: true,
        },
      }),
      prisma.foodLog.findMany({
        where: { userId },
        orderBy: { eatenAt: 'desc' },
        take: 5,
        select: {
          id: true,
          eatenAt: true,
          mealType: true,
          foodName: true,
          calories: true,
          proteinGrams: true,
          carbsGrams: true,
          fatGrams: true,
          status: true,
        },
      }),
      prisma.aiFeedback.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          planSummary: true,
          planPayload: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({ user, meals, feedback });
  } catch (error) {
    console.error('Get AI context error:', error);
    res.status(500).json({ error: 'Không thể xây dựng ngữ cảnh AI' });
  }
};

/**
 * Generate 7-day meal plan using Gemini AI
 * Falls back to a local template if AI fails so the app doesn't break.
 */
export const generateMealPlan = async (req, res) => {
  const userId = req.user?.id;
  const { allergies = '', preferences = '' } = req.body || {};

  if (!userId) {
    return res.status(401).json({ error: 'Chưa xác thực' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const weight = Number(user.weightKg) || 65;
    const height = Number(user.heightCm) || 170;
    const age = Number(user.age) || 30;
    const gender = user.gender || 'male';
    const activityLevel = user.activityLevel || 'moderately_active';

    const bmr = calculateBMR({ weight, height, age, gender });
    const tdee = calculateTDEE(bmr, activityLevel);
    const safeTDEE = Number.isFinite(tdee) && tdee > 0 ? tdee : 2000;
    const targetCalories =
      user.goal === 'weight_loss'
        ? safeTDEE - 500
        : user.goal === 'muscle_gain'
          ? safeTDEE + 300
          : safeTDEE;
    const roundedTarget = Math.max(1200, Math.round(targetCalories));

    const buildFallbackPlan = () => {
      const fallbackTemplates = [
        {
          day: 'Thứ Hai',
          breakfast: { name: 'Pancake protein dâu tây', calories: 540, protein: 30 },
          lunch: { name: 'Gà nướng quinoa', calories: 680, protein: 48 },
          snack: { name: 'Sữa chua Hy Lạp & hạnh nhân', calories: 220, protein: 18 },
          dinner: { name: 'Cá hồi nướng khoai lang', calories: 650, protein: 45 },
        },
        {
          day: 'Thứ Ba',
          breakfast: { name: 'Bánh mì bơ trứng', calories: 520, protein: 24 },
          lunch: { name: 'Gà tây cuốn rau', calories: 580, protein: 42 },
          snack: { name: 'Sinh tố protein chuối', calories: 280, protein: 30 },
          dinner: { name: 'Bò xào bông cải xanh', calories: 670, protein: 52 },
        },
        {
          day: 'Thứ Tư',
          breakfast: { name: 'Yến mạch qua đêm', calories: 490, protein: 20 },
          lunch: { name: 'Salad cá ngừ đậu gà', calories: 640, protein: 44 },
          snack: { name: 'Phô mai cottage & dứa', calories: 190, protein: 22 },
          dinner: { name: 'Gà nướng rau củ', calories: 660, protein: 50 },
        },
        {
          day: 'Thứ Năm',
          breakfast: { name: 'Trứng trộn rau bina', calories: 510, protein: 28 },
          lunch: { name: 'Tôm mì zucchini', calories: 560, protein: 46 },
          snack: { name: 'Táo & bơ đậu phộng', calories: 240, protein: 8 },
          dinner: { name: 'Đậu phụ xào rau', calories: 610, protein: 36 },
        },
        {
          day: 'Thứ Sáu',
          breakfast: { name: 'Sữa chua parfait', calories: 530, protein: 32 },
          lunch: { name: 'Gà Buddha bowl', calories: 700, protein: 50 },
          snack: { name: 'Cà rốt & hummus', calories: 180, protein: 6 },
          dinner: { name: 'Cá tuyết nướng măng tây', calories: 600, protein: 48 },
        },
        {
          day: 'Thứ Bảy',
          breakfast: { name: 'Smoothie bowl xanh', calories: 500, protein: 28 },
          lunch: { name: 'Súp đậu lăng & bánh mì', calories: 620, protein: 30 },
          snack: { name: 'Trứng luộc & dưa chuột', calories: 200, protein: 16 },
          dinner: { name: 'Viên gà tây mì zoodle', calories: 650, protein: 52 },
        },
        {
          day: 'Chủ Nhật',
          breakfast: { name: 'Chia pudding xoài', calories: 480, protein: 18 },
          lunch: { name: 'Cá hồi poke bowl', calories: 710, protein: 46 },
          snack: { name: 'Dâu tây & hạt óc chó', calories: 230, protein: 5 },
          dinner: { name: 'Salad gà nướng', calories: 670, protein: 54 },
        },
      ];

      const start = new Date();
      const dayOfWeek = start.getDay() === 0 ? 7 : start.getDay();
      start.setDate(start.getDate() - (dayOfWeek - 1));

      return fallbackTemplates.map((template, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dayLabel = `${date.getDate()}/${date.getMonth() + 1}`;

        return { ...template, date: dayLabel };
      });
    };

    const prompt = `Create a 7-day healthy meal plan in Vietnamese for a person with:
- Goal: ${user.goal || 'maintenance'}
- Daily calorie target: ${roundedTarget} kcal
- Allergies: ${allergies || 'None'}
- Preferences: ${preferences || 'Balanced diet'}

Return ONLY valid JSON array with 7 days, each day has breakfast, lunch, snack, dinner:
[
  {
    "day": "Thứ Hai",
    "date": "16/12",
    "breakfast": { "name": "Pancake protein dâu tây", "calories": 540, "protein": 30 },
    "lunch": { "name": "Gà nướng quinoa", "calories": 680, "protein": 48 },
    "snack": { "name": "Sữa chua Hy Lạp & hạnh nhân", "calories": 220, "protein": 18 },
    "dinner": { "name": "Cá hồi nướng khoai lang", "calories": 650, "protein": 45 }
  }
]
Requirements:
- All Vietnamese dish names
- Realistic calorie distribution
- High protein meals
- Avoid allergies: ${allergies || 'none'}
- Match preferences: ${preferences || 'balanced'}
- Total daily calories around ${roundedTarget} kcal
- No markdown, ONLY JSON array`;

    let mealPlan;
    let source = 'ai';

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

      const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không tìm thấy mảng JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mealPlan = parsed;
      } else if (Array.isArray(parsed?.days) && parsed.days.length > 0) {
        mealPlan = parsed.days;
      } else {
        throw new Error('AI trả về kế hoạch rỗng');
      }
    } catch (aiError) {
      console.error('AI meal plan error, using fallback:', aiError);
      mealPlan = buildFallbackPlan();
      source = 'fallback';
    }

    return res.json({ mealPlan, targetCalories: roundedTarget, source });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.json({
      mealPlan: buildFallbackPlan(),
      targetCalories: 2000,
      source: 'fallback',
    });
  }
};
