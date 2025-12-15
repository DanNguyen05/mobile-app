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
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

import { api } from '../../services/api';
import { chatWithAI, analyzeFood, analyzeAndSaveFood, generateExercisePlan, type AIExercisePlan, type UserProfileContext } from '../../services/aiService';
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
  { text: '📸 Phân tích đồ ăn', icon: 'camera-outline' },
  { text: '🔥 Hôm nay ăn bao nhiêu calo?', icon: 'flame-outline' },
  { text: '💪 Gợi ý bài tập', icon: 'barbell-outline' },
  { text: '📊 Tiến trình của tôi', icon: 'stats-chart-outline' },
  { text: '🥗 Gợi ý thực đơn healthy', icon: 'restaurant-outline' },
];

// Typing indicator component
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  const animatedStyle = (dot: Animated.Value) => ({
    opacity: dot,
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
    ],
  });

  return (
    <View style={styles.typingIndicator}>
      <Animated.View style={[styles.typingDot, animatedStyle(dot1)]} />
      <Animated.View style={[styles.typingDot, animatedStyle(dot2)]} />
      <Animated.View style={[styles.typingDot, animatedStyle(dot3)]} />
    </View>
  );
};

export default function MessagesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! 👋 Tôi là trợ lý AI sức khỏe.\n\nTôi có thể hỗ trợ bạn:\n\n📸 Nhận diện món ăn qua ảnh\n💪 Tư vấn bài tập phù hợp\n🥗 Gợi ý thực đơn healthy\n📊 Phân tích tiến trình\n\nHãy hỏi tôi bất cứ điều gì! 😊',
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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
    const loadingId = addMessage({ text: '', isUser: false, isLoading: true });

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
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại! 🙏',
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
          // Analyze food from image and save automatically
          const now = new Date();
          const hour = now.getHours();
          const mealType = 
            hour >= 5 && hour < 11 ? 'breakfast' :
            hour >= 11 && hour < 14 ? 'lunch' :
            hour >= 18 && hour < 22 ? 'dinner' : 'snack';

          const { analysis, foodLogId, error } = await analyzeAndSaveFood(asset.base64 || '', mealType);

          if (error || !analysis.foodName || analysis.foodName === 'Không xác định') {
            updateMessage(loadingId, {
              text: `❌ Không thể nhận diện đồ ăn\n\n${error || 'Hình ảnh không rõ hoặc không phải đồ ăn.'}\n\n💡 Gợi ý:\n• Chụp ảnh rõ nét hơn\n• Đảm bảo đồ ăn ở trung tâm\n• Có đủ ánh sáng`,
              isLoading: false,
            });
          } else {
            updateMessage(loadingId, {
              text: `✅ **${analysis.foodName}** - ${analysis.amount}\n\n📊 Thông tin dinh dưỡng:\n• Calories: ${analysis.calories} kcal\n• Protein: ${analysis.protein}g\n• Carbs: ${analysis.carbs}g\n• Fat: ${analysis.fat}g\n\n✅ Đã lưu vào nhật ký ăn uống! (ID: ${foodLogId})`,
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
          // Analyze food from gallery image and save automatically
          const now = new Date();
          const hour = now.getHours();
          const mealType = 
            hour >= 5 && hour < 11 ? 'breakfast' :
            hour >= 11 && hour < 14 ? 'lunch' :
            hour >= 18 && hour < 22 ? 'dinner' : 'snack';

          const { analysis, foodLogId, error } = await analyzeAndSaveFood(asset.base64 || '', mealType);

          if (error || !analysis.foodName || analysis.foodName === 'Không xác định') {
            updateMessage(loadingId, {
              text: `❌ Không thể nhận diện đồ ăn\n\n${error || 'Hình ảnh không rõ.'}\n\n💡 Thử chọn ảnh khác rõ nét hơn.`,
              isLoading: false,
            });
          } else {
            updateMessage(loadingId, {
              text: `✅ **${analysis.foodName}** - ${analysis.amount}\n\n📊 Thông tin dinh dưỡng:\n• Calories: ${analysis.calories} kcal\n• Protein: ${analysis.protein}g\n• Carbs: ${analysis.carbs}g\n• Fat: ${analysis.fat}g\n\n✅ Đã lưu vào nhật ký ăn uống! (ID: ${foodLogId})`,
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

  const handleQuickReply = (reply: { text: string; icon: string }) => {
    if (reply.text.includes('Phân tích đồ ăn')) {
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
      handleSend(reply.text);
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
                text: 'Xin chào! 👋 Tôi là trợ lý AI sức khỏe.\n\nTôi có thể hỗ trợ bạn:\n\n📸 Nhận diện món ăn qua ảnh\n💪 Tư vấn bài tập phù hợp\n🥗 Gợi ý thực đơn healthy\n📊 Phân tích tiến trình\n\nHãy hỏi tôi bất cứ điều gì! 😊',
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Trợ lý AI</Text>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isUser ? styles.userWrapper : styles.aiWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {message.imageUri && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: message.imageUri }}
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
                
                {message.isLoading ? (
                  <View style={styles.loadingContainer}>
                    <TypingIndicator />
                  </View>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.messageText,
                        message.isUser ? styles.userText : styles.aiText,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text style={[
                      styles.timestamp,
                      message.isUser ? styles.timestampUser : styles.timestampAI
                    ]}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </>
                )}

                {/* Enhanced Nutrition Card */}
                {message.nutritionData && (
                  <View style={styles.nutritionCard}>
                    <View style={styles.nutritionHeader}>
                      <Ionicons name="nutrition-outline" size={16} color={colors.primary} />
                      <Text style={styles.nutritionHeaderText}>Thông tin dinh dưỡng</Text>
                    </View>
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <View style={[styles.nutritionIconBg, { backgroundColor: '#FEF3C7' }]}>
                          <Ionicons name="flame" size={18} color="#F59E0B" />
                        </View>
                        <Text style={styles.nutritionValue}>
                          {message.nutritionData.calories}
                        </Text>
                        <Text style={styles.nutritionLabel}>kcal</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <View style={[styles.nutritionIconBg, { backgroundColor: colors.primaryLight }]}>
                          <Ionicons name="barbell" size={18} color={colors.primary} />
                        </View>
                        <Text style={styles.nutritionValue}>
                          {message.nutritionData.protein}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <View style={[styles.nutritionIconBg, { backgroundColor: '#FECACA' }]}>
                          <Ionicons name="fast-food" size={18} color="#EF4444" />
                        </View>
                        <Text style={styles.nutritionValue}>
                          {message.nutritionData.carbs}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <View style={[styles.nutritionIconBg, { backgroundColor: '#E0E7FF' }]}>
                          <Ionicons name="water" size={18} color="#6366F1" />
                        </View>
                        <Text style={styles.nutritionValue}>
                          {message.nutritionData.fat}g
                        </Text>
                        <Text style={styles.nutritionLabel}>Béo</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Enhanced Exercise Plan Card */}
                {message.exercisePlan && (
                  <View style={styles.exerciseCard}>
                    <View style={styles.exerciseCardHeader}>
                      <View style={styles.exerciseTitleRow}>
                        <Ionicons name="barbell" size={18} color={colors.primary} />
                        <Text style={styles.exerciseCardTitle}>Kế hoạch tập luyện</Text>
                      </View>
                      <View style={styles.exerciseBadge}>
                        <Text style={styles.exerciseIntensity}>
                          {message.exercisePlan.intensity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.exerciseBurnContainer}>
                      <Ionicons name="flame" size={16} color="#EF4444" />
                      <Text style={styles.exerciseBurn}>
                        {message.exercisePlan.totalBurnEstimate}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Enhanced Quick Replies */}
          {messages.length <= 2 && !loading && (
            <View style={styles.quickRepliesContainer}>
              <Text style={styles.quickRepliesTitle}>💡 Gợi ý nhanh cho bạn</Text>
              {QUICK_REPLIES.slice(0, 2).map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleQuickReply(reply)}
                  activeOpacity={0.7}
                  style={styles.quickReplyCard}
                >
                  <View style={styles.quickReplyIconContainer}>
                    <Ionicons name={reply.icon as any} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.quickReplyText}>{reply.text}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
              <View style={styles.quickRepliesRow}>
                {QUICK_REPLIES.slice(2).map((reply, index) => (
                  <TouchableOpacity
                    key={index + 2}
                    onPress={() => handleQuickReply(reply)}
                    activeOpacity={0.7}
                    style={styles.quickReplySmallCard}
                  >
                    <Ionicons name={reply.icon as any} size={20} color={colors.primary} />
                    <Text style={styles.quickReplySmallText} numberOfLines={2}>{reply.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Enhanced Input Container */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.iconButton, loading && styles.iconButtonDisabled]}
              onPress={handleImagePick}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="camera" 
                size={22} 
                color={loading ? colors.textLight : colors.primary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconButton, loading && styles.iconButtonDisabled]}
              onPress={handleGalleryPick}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="image" 
                size={22} 
                color={loading ? colors.textLight : colors.primary} 
              />
            </TouchableOpacity>

            <View style={styles.inputBox}>
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
            </View>
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || loading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || loading}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
    marginRight: -40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
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
    paddingBottom: 100,
  },
  messageWrapper: {
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
  },
  imageContainer: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  messageImage: {
    width: 220,
    height: 165,
    borderRadius: borderRadius.md,
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
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  timestampAI: {
    color: colors.textLight,
  },
  loadingContainer: {
    paddingVertical: spacing.sm,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  nutritionCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 6,
  },
  nutritionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  nutritionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  nutritionLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  exerciseCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  exerciseBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  exerciseIntensity: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  exerciseBurnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.xs,
  },
  exerciseBurn: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  quickRepliesContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  quickRepliesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickReplyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    gap: spacing.md,
  },
  quickReplyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickReplyText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  quickRepliesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickReplySmallCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  quickReplySmallText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.3,
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
