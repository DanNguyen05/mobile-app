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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

const CATEGORIES = [
  { key: 'All', label: 'Tất cả' },
  { key: 'Breakfast', label: 'Sáng' },
  { key: 'Lunch', label: 'Trưa' },
  { key: 'Snack', label: 'Phụ' },
  { key: 'Dinner', label: 'Tối' }
];

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
  {
    id: 'breakfast-4',
    name: 'Bánh protein chuối',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
    category: 'Breakfast',
    calories: 340,
    protein: 20,
    carbs: 42,
    fat: 10,
    time: 25,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 267,
    ingredients: [
      '2 quả chuối chín',
      '2 quả trứng',
      '1 scoop protein',
      '50g bột yến mạch',
      'Bột nở',
      'Quế'
    ],
    instructions: [
      'Nghiền chuối và trộn với trứng',
      'Thêm protein, yến mạch, bột nở',
      'Đổ vào khuôn bánh',
      'Nướng 180°C trong 20 phút'
    ]
  },
  {
    id: 'breakfast-5',
    name: 'Trứng scrambled với rau củ',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    category: 'Breakfast',
    calories: 295,
    protein: 24,
    carbs: 18,
    fat: 14,
    time: 12,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 198,
    ingredients: [
      '3 quả trứng',
      'Cà chua',
      'Hành tây',
      'Ớt chuông',
      'Rau bina',
      'Phô mai'
    ],
    instructions: [
      'Đánh trứng đều',
      'Xào rau củ',
      'Thêm trứng và khuấy đều',
      'Rắc phô mai trước khi tắt bếp'
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
  {
    id: 'lunch-4',
    name: 'Pasta nguyên cám với tôm',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
    category: 'Lunch',
    calories: 580,
    protein: 35,
    carbs: 62,
    fat: 18,
    time: 25,
    difficulty: 'Medium',
    rating: 4.7,
    reviews: 412,
    ingredients: [
      '100g pasta nguyên cám',
      '150g tôm',
      'Cà chua bi',
      'Tỏi',
      'Húng quế',
      'Dầu ô liu'
    ],
    instructions: [
      'Luộc pasta theo hướng dẫn',
      'Xào tỏi thơm',
      'Thêm tôm và cà chua',
      'Trộn pasta với hỗn hợp, rắc húng quế'
    ]
  },
  {
    id: 'lunch-5',
    name: 'Cơm gạo lứt với thịt gà xào',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    category: 'Lunch',
    calories: 640,
    protein: 42,
    carbs: 68,
    fat: 16,
    time: 35,
    difficulty: 'Easy',
    rating: 4.5,
    reviews: 356,
    ingredients: [
      '100g gạo lứt',
      '150g ức gà',
      'Rau củ xào',
      'Nấm',
      'Nước tương',
      'Gừng'
    ],
    instructions: [
      'Nấu cơm gạo lứt',
      'Ướp gà với nước tương và gừng',
      'Xào gà với rau củ và nấm',
      'Ăn kèm với cơm'
    ]
  },
  {
    id: 'lunch-6',
    name: 'Phở gà healthy',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    category: 'Lunch',
    calories: 480,
    protein: 38,
    carbs: 55,
    fat: 10,
    time: 45,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 678,
    ingredients: [
      'Xương gà',
      'Bánh phở',
      'Ức gà',
      'Rau thơm',
      'Hành tây',
      'Gia vị'
    ],
    instructions: [
      'Ninh nước dùng từ xương gà',
      'Luộc bánh phở',
      'Luộc ức gà',
      'Bày bánh phở, gà và chan nước dùng'
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
  {
    id: 'snack-3',
    name: 'Energy balls chocolate',
    image: 'https://images.unsplash.com/photo-1569288063643-5d29ad64df09?w=400',
    category: 'Snack',
    calories: 240,
    protein: 10,
    carbs: 28,
    fat: 10,
    time: 15,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 321,
    ingredients: [
      '100g chà là',
      '50g hạnh nhân',
      '2 tbsp bột ca cao',
      '2 tbsp mật ong',
      'Bột yến mạch',
      'Dừa nạo'
    ],
    instructions: [
      'Xay nhuyễn chà là và hạnh nhân',
      'Trộn với ca cao, mật ong, yến mạch',
      'Vo thành từng viên nhỏ',
      'Lăn qua dừa nạo và bảo quản lạnh'
    ]
  },
  {
    id: 'snack-4',
    name: 'Khoai lang nướng',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
    category: 'Snack',
    calories: 180,
    protein: 4,
    carbs: 38,
    fat: 2,
    time: 40,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 245,
    ingredients: [
      '1 củ khoai lang',
      'Dầu ô liu',
      'Muối',
      'Quế'
    ],
    instructions: [
      'Rửa sạch khoai lang',
      'Bọc giấy bạc',
      'Nướng 200°C trong 35-40 phút',
      'Rắc quế khi ăn'
    ]
  },
  {
    id: 'snack-5',
    name: 'Hummus với rau củ sống',
    image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400',
    category: 'Snack',
    calories: 210,
    protein: 8,
    carbs: 24,
    fat: 9,
    time: 10,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 189,
    ingredients: [
      '200g đậu chickpea',
      'Tahini',
      'Chanh',
      'Tỏi',
      'Cà rốt',
      'Dưa chuột'
    ],
    instructions: [
      'Xay nhuyễn đậu chickpea với tahini, chanh, tỏi',
      'Thêm gia vị',
      'Cắt rau củ thành que',
      'Chấm với hummus'
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
  {
    id: 'dinner-4',
    name: 'Canh rau củ với đậu',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    category: 'Dinner',
    calories: 380,
    protein: 18,
    carbs: 52,
    fat: 10,
    time: 30,
    difficulty: 'Easy',
    rating: 4.5,
    reviews: 278,
    ingredients: [
      'Đậu tổng hợp',
      'Cà rốt',
      'Cần tây',
      'Hành tây',
      'Cà chua',
      'Nước dùng'
    ],
    instructions: [
      'Ngâm đậu qua đêm',
      'Xào hành tây thơm',
      'Thêm rau củ và đậu',
      'Nấu nhỏ lửa 25-30 phút'
    ]
  },
  {
    id: 'dinner-5',
    name: 'Cá nướng sốt chanh dây',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
    category: 'Dinner',
    calories: 540,
    protein: 46,
    carbs: 35,
    fat: 20,
    time: 30,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 534,
    ingredients: [
      '200g phi lê cá',
      'Chanh dây',
      'Mật ong',
      'Tỏi',
      'Rau củ nướng',
      'Thảo mộc'
    ],
    instructions: [
      'Ướp cá với tỏi và thảo mộc',
      'Làm sốt chanh dây với mật ong',
      'Nướng cá và rau củ',
      'Rưới sốt lên cá khi ăn'
    ]
  },
  {
    id: 'dinner-6',
    name: 'Thịt gà sốt nấm',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    category: 'Dinner',
    calories: 610,
    protein: 48,
    carbs: 40,
    fat: 24,
    time: 35,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 467,
    ingredients: [
      '200g ức gà',
      'Nấm tổng hợp',
      'Kem tươi',
      'Tỏi',
      'Hành tây',
      'Thảo mộc'
    ],
    instructions: [
      'Áp chảo gà đến vàng',
      'Xào tỏi và hành tây',
      'Thêm nấm và xào chín',
      'Cho kem tươi và thảo mộc, nêm gia vị'
    ]
  },
  {
    id: 'dinner-7',
    name: 'Bún chả chay',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400',
    category: 'Dinner',
    calories: 490,
    protein: 22,
    carbs: 68,
    fat: 14,
    time: 40,
    difficulty: 'Medium',
    rating: 4.7,
    reviews: 389,
    ingredients: [
      'Bún tươi',
      'Đậu hũ',
      'Nấm',
      'Rau sống',
      'Nước mắm chay',
      'Gia vị'
    ],
    instructions: [
      'Ướp đậu hũ với gia vị',
      'Nướng đậu hũ và nấm',
      'Luộc bún',
      'Bày bún, rau sống, đậu hũ và chan nước mắm'
    ]
  },
];

export default function HealthyMenuScreen() {
  const navigation = useNavigation();
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Thực đơn healthy</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.key && styles.categoryTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  headerRight: {
    width: 40,
  },
  categoriesWrapper: {
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    paddingBottom: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  recipesGrid: {
    padding: spacing.sm,
    paddingBottom: 100,
  },
  recipeCard: {
    flex: 1,
    margin: spacing.xs,
    maxWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    minHeight: 38,
    lineHeight: 19,
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
