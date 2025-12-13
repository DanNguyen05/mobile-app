// src/screens/healthyMenu/HealthyMenuScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius } from '../../context/ThemeContext';

interface Recipe {
  id: string;
  name: string;
  image: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  rating: number;
  reviews: number;
}

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner'];

const RECIPES: Recipe[] = [
  // BREAKFAST
  {
    id: 'breakfast-1',
    name: 'Bột yến mạch với bơ hạnh nhân và chuối',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400',
    category: 'Breakfast',
    calories: 380,
    protein: 15,
    carbs: 52,
    fat: 12,
    time: 10,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 342,
    ingredients: [
      '50g yến mạch',
      '200ml sữa hạnh nhân',
      '1 tbsp bơ hạnh nhân',
      '1 quả chuối',
      '1 tsp hạt chia',
      'Bột quế'
    ],
    instructions: [
      'Nấu yến mạch với sữa cho đến khi mịn',
      'Thêm chuối thái lát',
      'Cho bơ hạnh nhân và hạt chia',
      'Rắc bột quế'
    ]
  },
  {
    id: 'breakfast-2',
    name: 'Sữa chua Hy Lạp với trái cây',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    category: 'Breakfast',
    calories: 320,
    protein: 22,
    carbs: 38,
    fat: 10,
    time: 5,
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 289,
    ingredients: [
      '200g sữa chua Hy Lạp',
      'Trái cây tổng hợp',
      '30g granola',
      '1 tsp mật ong'
    ],
    instructions: [
      'Cho sữa chua vào ly',
      'Thêm trái cây và granola',
      'Rưới mật ong'
    ]
  },
  {
    id: 'breakfast-3',
    name: 'Bánh mì bơ với trứng chần',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
    category: 'Breakfast',
    calories: 410,
    protein: 18,
    carbs: 35,
    fat: 22,
    time: 15,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 456,
    ingredients: [
      '2 lát bánh mì nguyên cám',
      '1 quả bơ',
      '2 quả trứng',
      'Cà chua bi',
      'Muối, tiêu'
    ],
    instructions: [
      'Nướng bánh mì',
      'Nghiền bơ và phết lên bánh',
      'Chần trứng và đặt lên trên',
      'Thêm cà chua, nêm gia vị'
    ]
  },
  // LUNCH
  {
    id: 'lunch-1',
    name: 'Gà nướng với quinoa và rau củ',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    category: 'Lunch',
    calories: 680,
    protein: 48,
    carbs: 55,
    fat: 22,
    time: 30,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 523,
    ingredients: [
      '200g ức gà',
      '100g quinoa',
      'Rau củ tổng hợp',
      'Dầu ô liu',
      'Gia vị'
    ],
    instructions: [
      'Ướp và nướng gà',
      'Nấu quinoa',
      'Xào rau củ',
      'Trộn tất cả vào tô'
    ]
  },
  {
    id: 'lunch-2',
    name: 'Cá hồi nướng với khoai lang',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    category: 'Lunch',
    calories: 650,
    protein: 45,
    carbs: 48,
    fat: 24,
    time: 35,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 612,
    ingredients: [
      '200g cá hồi',
      '1 củ khoai lang',
      'Măng tây',
      'Chanh',
      'Thảo mộc'
    ],
    instructions: [
      'Ướp cá với chanh và thảo mộc',
      'Nướng khoai lang',
      'Nướng cá và măng tây',
      'Bày đĩa và trang trí'
    ]
  },
  {
    id: 'lunch-3',
    name: 'Salad gà với rau xanh',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    category: 'Lunch',
    calories: 420,
    protein: 38,
    carbs: 28,
    fat: 18,
    time: 20,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 389,
    ingredients: [
      '150g ức gà',
      'Rau xà lách',
      'Cà chua',
      'Dưa chuột',
      'Sốt dầu giấm'
    ],
    instructions: [
      'Luộc hoặc nướng gà',
      'Cắt rau thành miếng vừa ăn',
      'Xắt gà thành lát mỏng',
      'Trộn đều với sốt'
    ]
  },
  // SNACK
  {
    id: 'snack-1',
    name: 'Sinh tố protein xanh',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
    category: 'Snack',
    calories: 280,
    protein: 30,
    carbs: 32,
    fat: 6,
    time: 5,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 234,
    ingredients: [
      '1 scoop protein',
      '1 quả chuối',
      'Rau bina',
      'Sữa hạnh nhân',
      'Đá'
    ],
    instructions: [
      'Cho tất cả nguyên liệu vào máy xay',
      'Xay đến mịn',
      'Rót ra ly và thưởng thức'
    ]
  },
  {
    id: 'snack-2',
    name: 'Hạnh nhân và trái cây khô',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
    category: 'Snack',
    calories: 220,
    protein: 8,
    carbs: 24,
    fat: 12,
    time: 2,
    difficulty: 'Easy',
    rating: 4.5,
    reviews: 156,
    ingredients: [
      '30g hạnh nhân',
      '20g nho khô',
      '10g hạt chia'
    ],
    instructions: [
      'Trộn tất cả nguyên liệu',
      'Chia thành túi nhỏ để mang theo'
    ]
  },
  // DINNER
  {
    id: 'dinner-1',
    name: 'Bò xào với bông cải xanh',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    category: 'Dinner',
    calories: 670,
    protein: 52,
    carbs: 42,
    fat: 28,
    time: 25,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 445,
    ingredients: [
      '200g thịt bò',
      'Bông cải xanh',
      'Tỏi',
      'Nước tương',
      'Gừng'
    ],
    instructions: [
      'Ướp thịt bò',
      'Xào tỏi và gừng thơm',
      'Xào thịt bò',
      'Thêm bông cải và xào chín'
    ]
  },
  {
    id: 'dinner-2',
    name: 'Đậu phụ xào rau củ',
    image: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400',
    category: 'Dinner',
    calories: 520,
    protein: 28,
    carbs: 45,
    fat: 22,
    time: 20,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 312,
    ingredients: [
      '200g đậu phụ',
      'Rau củ tổng hợp',
      'Tỏi',
      'Nước tương',
      'Dầu mè'
    ],
    instructions: [
      'Cắt đậu phụ thành miếng vuông',
      'Chiên đậu phụ vàng',
      'Xào rau củ',
      'Trộn đậu phụ với rau củ'
    ]
  },
  {
    id: 'dinner-3',
    name: 'Gà nướng với rau củ nướng',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    category: 'Dinner',
    calories: 660,
    protein: 50,
    carbs: 38,
    fat: 26,
    time: 40,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 589,
    ingredients: [
      '200g ức gà',
      'Khoai tây',
      'Cà rót',
      'Ớt chuông',
      'Thảo mộc'
    ],
    instructions: [
      'Ướp gà với thảo mộc',
      'Cắt rau củ',
      'Nướng gà và rau củ trong lò',
      'Nướng 30-35 phút ở 200°C'
    ]
  },
];

export default function HealthyMenuScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = selectedCategory === 'All'
    ? RECIPES
    : RECIPES.filter(recipe => recipe.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return colors.success;
      case 'Medium': return colors.warning;
      case 'Hard': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => setSelectedRecipe(item)}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.recipeStats}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={14} color={colors.warning} />
            <Text style={styles.statText}>{item.calories} kcal</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{item.time} phút</Text>
          </View>
        </View>

        <View style={styles.recipeFooter}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FFB84D" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewText}>({item.reviews})</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
              {item.difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Thực đơn lành mạnh</Text>
        <Text style={styles.subtitle}>{filteredRecipes.length} công thức</Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipes Grid */}
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.recipesGrid}
        showsVerticalScrollIndicator={false}
      />

      {/* Recipe Detail Modal */}
      <Modal
        visible={selectedRecipe !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRecipe && (
                <>
                  <Image source={{ uri: selectedRecipe.image }} style={styles.modalImage} />
                  
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedRecipe(null)}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>

                  <View style={styles.modalBody}>
                    <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>

                    <View style={styles.modalStats}>
                      <View style={styles.modalStatItem}>
                        <Ionicons name="flame" size={20} color={colors.warning} />
                        <Text style={styles.modalStatValue}>{selectedRecipe.calories}</Text>
                        <Text style={styles.modalStatLabel}>Calories</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Ionicons name="fitness" size={20} color={colors.protein} />
                        <Text style={styles.modalStatValue}>{selectedRecipe.protein}g</Text>
                        <Text style={styles.modalStatLabel}>Protein</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Ionicons name="nutrition" size={20} color={colors.carbs} />
                        <Text style={styles.modalStatValue}>{selectedRecipe.carbs}g</Text>
                        <Text style={styles.modalStatLabel}>Carbs</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Ionicons name="water" size={20} color={colors.fat} />
                        <Text style={styles.modalStatValue}>{selectedRecipe.fat}g</Text>
                        <Text style={styles.modalStatLabel}>Fat</Text>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Nguyên liệu</Text>
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientItem}>
                          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                          <Text style={styles.ingredientText}>{ingredient}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Hướng dẫn</Text>
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <View key={index} style={styles.instructionItem}>
                          <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.instructionText}>{instruction}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryTextActive: {
    color: '#fff',
  },
  recipesGrid: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  recipeCard: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipeImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  recipeInfo: {
    padding: spacing.sm,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  recipeStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recipeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  reviewText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ingredientText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  instructionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
});
