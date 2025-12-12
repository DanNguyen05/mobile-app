// src/screens/messages/MessagesScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { api } from '../../services/api';
import { chatWithAI, analyzeFood, generateExercisePlan, type AIExercisePlan, type UserProfileContext } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius } from '../../context/ThemeContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  imageUri?: string;
  nutritionData?: {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  exercisePlan?: AIExercisePlan;
}

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_REPLIES = [
  '🍽️ Phân tích đồ ăn',
  '🔥 Hôm nay tôi ăn bao nhiêu calo?',
  '💪 Gợi ý bài tập',
  '📊 Tiến trình của tôi',
  '🥗 Gợi ý thực đơn healthy',
];

export default function MessagesScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý AI sức khỏe của bạn. Tôi có thể:\n\n📸 Nhận diện đồ ăn từ ảnh\n💪 Gợi ý bài tập phù hợp\n🍽️ Tư vấn dinh dưỡng\n📊 Theo dõi tiến trình\n\nBạn cần giúp gì hôm nay?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // User profile for AI context
  const userProfile: UserProfileContext = {
    age: user?.age || 30,
    weight: user?.weight_kg || 70,
    height: user?.height_cm || 170,
    gender: (user?.gender === 'female' ? 'Female' : 'Male') as 'Male' | 'Female',
    goal: (user?.goal as 'lose' | 'maintain' | 'gain') || 'maintain',
    workoutDays: 3,
  };

  // Auto scroll to bottom
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Counter for unique IDs
  const idCounterRef = useRef(0);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    idCounterRef.current += 1;
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${idCounterRef.current}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || loading) return;

    // Add user message
    addMessage({ text: messageText, isUser: true });
    setInputText('');
    setLoading(true);

    // Update chat history
    const newHistory = [...chatHistory, { role: 'user' as const, content: messageText }];
    setChatHistory(newHistory);

    // Add loading message
    const loadingId = addMessage({ text: '...', isUser: false, isLoading: true });

    try {
      // Check for workout/exercise intent
      const lowerText = messageText.toLowerCase();
      const isWorkoutQuery = 
        lowerText.includes('tập') || 
        lowerText.includes('workout') || 
        lowerText.includes('exercise') ||
        lowerText.includes('bài tập') ||
        lowerText.includes('gợi ý bài');

      if (isWorkoutQuery) {
        // Generate exercise plan
        const plan = await generateExercisePlan(0, userProfile, messageText);
        
        const exerciseList = plan.exercises
          .map((ex) => `• ${ex.name} - ${ex.duration}\n  ${ex.reason}`)
          .join('\n\n');
        
        const responseText = `💪 **Kế hoạch tập luyện (${plan.intensity})**\n\n${exerciseList}\n\n🔥 Đốt cháy: ${plan.totalBurnEstimate}\n\n💡 ${plan.advice}`;

        updateMessage(loadingId, {
          text: responseText,
          isLoading: false,
          exercisePlan: plan,
        });
      } else {
        // Regular AI chat
        const aiResponse = await chatWithAI(messageText, newHistory.slice(-10), userProfile);
        
        updateMessage(loadingId, {
          text: aiResponse,
          isLoading: false,
        });

        setChatHistory([...newHistory, { role: 'assistant', content: aiResponse }]);
      }
    } catch (error: any) {
      console.error('AI chat error:', error);
      updateMessage(loadingId, {
        text: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau. 🙏',
        isLoading: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh đồ ăn');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Add user message with image
        addMessage({
          text: '📸 Đang phân tích đồ ăn...',
          isUser: true,
          imageUri: asset.uri,
        });

        setLoading(true);
        const loadingId = addMessage({ text: 'Đang nhận diện đồ ăn...', isUser: false, isLoading: true });

        try {
          // Analyze food from image
          const { analysis, error } = await analyzeFood(asset.base64 || '');

          if (error || !analysis.foodName || analysis.foodName === 'Không xác định') {
            updateMessage(loadingId, {
              text: `❌ Không thể nhận diện đồ ăn\n\n${error || 'Hình ảnh không rõ hoặc không phải đồ ăn.'}\n\n💡 Gợi ý:\n• Chụp ảnh rõ nét hơn\n• Đảm bảo đồ ăn ở trung tâm\n• Có đủ ánh sáng`,
              isLoading: false,
            });
          } else {
            // Save to food diary
            try {
              const now = new Date();
              const hour = now.getHours();
              const mealType = 
                hour >= 5 && hour < 11 ? 'breakfast' :
                hour >= 11 && hour < 14 ? 'lunch' :
                hour >= 18 && hour < 22 ? 'dinner' : 'snack';

              await api.addFoodLog({
                foodName: analysis.foodName,
                calories: analysis.calories,
                protein: analysis.protein,
                carbs: analysis.carbs,
                fat: analysis.fat,
                mealType,
                eatenAt: now.toISOString(),
                amount: analysis.amount,
              });

              updateMessage(loadingId, {
                text: `✅ **${analysis.foodName}** - ${analysis.amount}\n\n📊 Thông tin dinh dưỡng:\n• Calories: ${analysis.calories} kcal\n• Protein: ${analysis.protein}g\n• Carbs: ${analysis.carbs}g\n• Fat: ${analysis.fat}g\n\n✅ Đã lưu vào nhật ký ăn uống!`,
                isLoading: false,
                nutritionData: {
                  foodName: analysis.foodName,
                  calories: analysis.calories,
                  protein: analysis.protein,
                  carbs: analysis.carbs,
                  fat: analysis.fat,
                },
              });
            } catch (saveError) {
              updateMessage(loadingId, {
                text: `✅ **${analysis.foodName}** - ${analysis.amount}\n\n📊 Thông tin dinh dưỡng:\n• Calories: ${analysis.calories} kcal\n• Protein: ${analysis.protein}g\n• Carbs: ${analysis.carbs}g\n• Fat: ${analysis.fat}g\n\n⚠️ Không thể lưu vào nhật ký (kiểm tra kết nối)`,
                isLoading: false,
                nutritionData: {
                  foodName: analysis.foodName,
                  calories: analysis.calories,
                  protein: analysis.protein,
                  carbs: analysis.carbs,
                  fat: analysis.fat,
                },
              });
            }
          }
        } catch (analysisError: any) {
          console.error('Food analysis error:', analysisError);
          updateMessage(loadingId, {
            text: `❌ Lỗi phân tích: ${analysisError.message || 'Không thể kết nối server'}`,
            isLoading: false,
          });
        }

        setLoading(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Lỗi', 'Không thể mở camera');
    }
  };

  const handleGalleryPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        addMessage({
          text: '📸 Đang phân tích đồ ăn...',
          isUser: true,
          imageUri: asset.uri,
        });

        setLoading(true);
        const loadingId = addMessage({ text: 'Đang nhận diện đồ ăn...', isUser: false, isLoading: true });

        try {
          const { analysis, error } = await analyzeFood(asset.base64 || '');

          if (error || !analysis.foodName || analysis.foodName === 'Không xác định') {
            updateMessage(loadingId, {
              text: `❌ Không thể nhận diện đồ ăn\n\n${error || 'Hình ảnh không rõ.'}\n\n💡 Thử chọn ảnh khác rõ nét hơn.`,
              isLoading: false,
            });
          } else {
            updateMessage(loadingId, {
              text: `✅ **${analysis.foodName}** - ${analysis.amount}\n\n📊 Thông tin dinh dưỡng:\n• Calories: ${analysis.calories} kcal\n• Protein: ${analysis.protein}g\n• Carbs: ${analysis.carbs}g\n• Fat: ${analysis.fat}g`,
              isLoading: false,
              nutritionData: {
                foodName: analysis.foodName,
                calories: analysis.calories,
                protein: analysis.protein,
                carbs: analysis.carbs,
                fat: analysis.fat,
              },
            });
          }
        } catch (analysisError: any) {
          updateMessage(loadingId, {
            text: `❌ Lỗi: ${analysisError.message}`,
            isLoading: false,
          });
        }

        setLoading(false);
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
    }
  };

  const handleQuickReply = (reply: string) => {
    if (reply.includes('Phân tích đồ ăn')) {
      Alert.alert(
        'Phân tích đồ ăn',
        'Chọn nguồn ảnh',
        [
          { text: '📷 Chụp ảnh', onPress: handleImagePick },
          { text: '🖼️ Thư viện', onPress: handleGalleryPick },
          { text: 'Hủy', style: 'cancel' },
        ]
      );
    } else {
      handleSend(reply);
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Xóa lịch sử chat',
      'Bạn có chắc muốn xóa toàn bộ lịch sử chat?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: '1',
                text: 'Xin chào! Tôi là trợ lý AI sức khỏe của bạn. Bạn cần giúp gì?',
                isUser: false,
                timestamp: new Date(),
              },
            ]);
            setChatHistory([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'Đang xử lý...' : 'Online'}
            </Text>
          </View>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isUser ? styles.userWrapper : styles.aiWrapper,
              ]}
            >
              {!message.isUser && (
                <View style={styles.messageAvatar}>
                  <Text>🤖</Text>
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {message.imageUri && (
                  <Image
                    source={{ uri: message.imageUri }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                )}
                
                {message.isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Đang xử lý...</Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userText : styles.aiText,
                    ]}
                  >
                    {message.text}
                  </Text>
                )}

                {/* Nutrition Card */}
                {message.nutritionData && (
                  <View style={styles.nutritionCard}>
                    <View style={styles.nutritionRow}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>
                          {message.nutritionData.calories}
                        </Text>
                        <Text style={styles.nutritionLabel}>kcal</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>
                          {message.nutritionData.protein}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>
                          {message.nutritionData.carbs}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>
                          {message.nutritionData.fat}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Exercise Plan Card */}
                {message.exercisePlan && (
                  <View style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseIntensity}>
                        {message.exercisePlan.intensity.toUpperCase()}
                      </Text>
                      <Text style={styles.exerciseBurn}>
                        🔥 {message.exercisePlan.totalBurnEstimate}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Quick Replies */}
          {messages.length <= 2 && !loading && (
            <View style={styles.quickRepliesContainer}>
              <Text style={styles.quickRepliesTitle}>Gợi ý nhanh:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.quickReplies}>
                  {QUICK_REPLIES.map((reply, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickReplyButton}
                      onPress={() => handleQuickReply(reply)}
                    >
                      <Text style={styles.quickReplyText}>{reply}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleImagePick}
            disabled={loading}
          >
            <Ionicons name="camera" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleGalleryPick}
            disabled={loading}
          >
            <Ionicons name="image" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={colors.textLight}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !loading ? colors.surface : colors.textLight}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.primary,
  },
  clearButton: {
    padding: spacing.sm,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: 100, // Extra space to avoid tab bar
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  aiWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: colors.surface,
  },
  aiText: {
    color: colors.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.textSecondary,
    fontSize: 14,
  },
  nutritionCard: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  nutritionLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  exerciseCard: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseIntensity: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FDE68A',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  exerciseBurn: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '600',
  },
  quickRepliesContainer: {
    marginTop: spacing.lg,
  },
  quickRepliesTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickReplies: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  quickReplyButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickReplyText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
    marginHorizontal: spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
