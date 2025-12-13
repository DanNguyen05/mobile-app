// src/services/aiService.ts
// AI Services for Food Recognition and Health Consulting

import { http } from './http';

export interface FoodRecognitionResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portionSize: string;
  confidence: number;
}

export interface AnalysisResult {
  foodName: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
}

export interface AIExercise {
  name: string;
  duration: string;
  reason: string;
  videoId?: string;
}

export interface AIExercisePlan {
  intensity: 'low' | 'medium' | 'high';
  exercises: AIExercise[];
  totalBurnEstimate: string;
  advice: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserProfileContext {
  age: number;
  weight: number;
  height: number;
  gender: 'Male' | 'Female';
  goal: 'lose' | 'maintain' | 'gain';
  workoutDays: number;
}

/**
 * Nhận diện đồ ăn từ ảnh base64
 */
export const recognizeFoodFromImage = async (
  base64Image: string
): Promise<FoodRecognitionResult> => {
  try {
    const response = await http.request<{ success: boolean; data: FoodRecognitionResult }>(
      '/api/ai/recognize-food',
      {
        method: 'POST',
        json: { base64Image },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Food recognition error:', error);
    throw new Error(error.message || 'Không thể nhận diện đồ ăn');
  }
};

/**
 * Phân tích đồ ăn từ ảnh và tự động lưu vào food log
 */
export const analyzeAndSaveFood = async (
  base64Image: string,
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): Promise<{ analysis: AnalysisResult; foodLogId?: number; error?: string }> => {
  try {
    const response = await http.request<{
      success: boolean;
      data: AnalysisResult;
      foodLog?: { id: number; eatenAt: string; mealType: string };
      message?: string;
    }>(
      '/api/ai/recognize-and-save-food',
      {
        method: 'POST',
        json: { 
          base64Image,
          mealType,
          eatenAt: new Date().toISOString(),
        },
      }
    );
    
    if (!response.success) {
      throw new Error('Failed to recognize and save food');
    }

    return {
      analysis: response.data,
      foodLogId: response.foodLog?.id,
    };
  } catch (error: any) {
    return {
      analysis: {
        foodName: 'Không xác định',
        amount: '100g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
      },
      error: error.message || 'Không thể nhận diện và lưu đồ ăn',
    };
  }
};

/**
 * Phân tích đồ ăn từ ảnh và trả về thông tin dinh dưỡng chi tiết
 */
export const analyzeFood = async (
  base64Image: string
): Promise<{ analysis: AnalysisResult; error?: string }> => {
  try {
    const result = await recognizeFoodFromImage(base64Image);
    
    return {
      analysis: {
        foodName: result.foodName,
        amount: result.portionSize || '100g',
        calories: Math.round(result.calories),
        protein: Math.round(result.protein),
        carbs: Math.round(result.carbs),
        fat: Math.round(result.fats),
        sugar: 0, // Gemini API không trả về sugar, để 0
      },
    };
  } catch (error: any) {
    return {
      analysis: {
        foodName: 'Không xác định',
        amount: '100g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sugar: 0,
      },
      error: error.message,
    };
  }
};

/**
 * Chat với Gemini AI để tư vấn sức khỏe
 */
export const chatWithAI = async (
  message: string,
  history: ChatMessage[] = [],
  userProfile?: UserProfileContext
): Promise<string> => {
  try {
    const response = await http.request<{ reply?: string }>(
      '/api/ai/chat',
      {
        method: 'POST',
        json: {
          message,
          history,
          userProfile,
        },
      }
    );
    
    return response.reply || 'Xin lỗi, tôi không hiểu yêu cầu của bạn.';
  } catch (error: any) {
    console.error('Chat AI error:', error);
    throw new Error(error.message || 'Không thể kết nối với AI');
  }
};

/**
 * Tạo kế hoạch tập luyện bằng AI
 */
export const generateExercisePlan = async (
  todayCalories: number,
  userProfile: UserProfileContext,
  query: string = ''
): Promise<AIExercisePlan> => {
  try {
    const prompt = query || `Gợi ý bài tập phù hợp cho tôi (${userProfile.age} tuổi, ${userProfile.weight}kg, mục tiêu: ${userProfile.goal === 'lose' ? 'giảm cân' : userProfile.goal === 'gain' ? 'tăng cân' : 'duy trì'})`;
    
    const response = await http.request<AIExercisePlan>(
      '/api/ai/exercise-plan',
      {
        method: 'POST',
        json: {
          dailyIntake: todayCalories,
          userQuery: prompt,
        },
      }
    );
    
    return response;
  } catch (error: any) {
    console.error('Exercise plan error:', error);
    // Return default plan if AI fails
    return {
      intensity: 'medium',
      exercises: [
        { name: 'Đi bộ nhanh', duration: '30 phút', reason: 'Tốt cho tim mạch' },
        { name: 'Plank', duration: '3 x 30 giây', reason: 'Tăng cường core' },
        { name: 'Squat', duration: '3 x 15 lần', reason: 'Tăng cường chân' },
      ],
      totalBurnEstimate: '~200-300 kcal',
      advice: 'Hãy khởi động kỹ trước khi tập và uống đủ nước.',
    };
  }
};

/**
 * Format thông tin dinh dưỡng để hiển thị
 */
export const formatNutritionInfo = (nutrition: FoodRecognitionResult): string => {
  const confidencePercent = Math.round(nutrition.confidence * 100);
  
  return `🍽️ ${nutrition.foodName}

📊 Thông tin dinh dưỡng (${nutrition.portionSize}):
• Calories: ${nutrition.calories} kcal
• Protein: ${nutrition.protein}g
• Carbs: ${nutrition.carbs}g
• Fat: ${nutrition.fats}g

Độ chính xác: ${confidencePercent}%`;
};

/**
 * Tính toán dinh dưỡng theo khẩu phần tùy chỉnh
 */
export const calculateNutrition = (
  baseNutrition: FoodRecognitionResult,
  grams: number
): FoodRecognitionResult => {
  const multiplier = grams / 100;
  
  return {
    ...baseNutrition,
    calories: Math.round(baseNutrition.calories * multiplier),
    protein: Math.round(baseNutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * multiplier * 10) / 10,
    fats: Math.round(baseNutrition.fats * multiplier * 10) / 10,
    portionSize: `${grams}g`,
  };
};
