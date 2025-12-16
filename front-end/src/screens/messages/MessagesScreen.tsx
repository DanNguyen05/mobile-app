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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { chatWithAI, generateExercisePlan, type AIExercisePlan, type UserProfileContext } from '../../services/aiService';
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

// Typing indicator component
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
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
      );
    };

    const anim1 = animate(dot1, 0);
    const anim2 = animate(dot2, 200);
    const anim3 = animate(dot3, 400);
    
    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
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
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Load chat history from storage
  useEffect(() => {
    if (user?.user_id) {
      loadChatHistory();
    }
  }, [user?.user_id]);

  const loadChatHistory = async () => {
    try {
      if (!user?.user_id) return;
      
      const messagesKey = `chatMessages_${user.user_id}`;
      const historyKey = `chatHistory_${user.user_id}`;
      
      const savedMessages = await AsyncStorage.getItem(messagesKey);
      const savedHistory = await AsyncStorage.getItem(historyKey);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (msgs: Message[], history: ChatHistoryItem[]) => {
    try {
      if (!user?.user_id) return;
      
      const messagesKey = `chatMessages_${user.user_id}`;
      const historyKey = `chatHistory_${user.user_id}`;
      
      await AsyncStorage.setItem(messagesKey, JSON.stringify(msgs));
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Save chat history whenever messages or chatHistory change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages, chatHistory);
    }
  }, [messages, chatHistory]);

  // Counter for unique IDs
  const idCounterRef = useRef(0);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    idCounterRef.current += 1;
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${idCounterRef.current}`,
      timestamp: new Date(),
    };
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      return updated;
    });
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

  const clearChat = async () => {
    Alert.alert(
      'Xóa lịch sử chat',
      'Bạn có chắc muốn xóa toàn bộ lịch sử chat?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setMessages([]);
            setChatHistory([]);
            try {
              if (user?.user_id) {
                await AsyncStorage.removeItem(`chatMessages_${user.user_id}`);
                await AsyncStorage.removeItem(`chatHistory_${user.user_id}`);
              }
            } catch (error) {
              console.error('Error clearing chat:', error);
            }
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
        <Text style={styles.title}>Chat AI</Text>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
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
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyStateText}>Tôi có thể giúp gì cho bạn?</Text>
            </View>
          )}

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
        </ScrollView>

        {/* Input Container */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhắn tin cho Chat AI..."
              placeholderTextColor={colors.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!loading}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || loading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="arrow-up" size={20} color="#fff" />
              )}
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
    backgroundColor: '#fff',
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
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
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
    padding: spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  messageWrapper: {
    marginBottom: spacing.lg,
    maxWidth: '80%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  aiBubble: {
    backgroundColor: '#F7F7F8',
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
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F7F7F8',
    borderRadius: borderRadius.full,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    minHeight: 24,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
