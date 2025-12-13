// src/screens/healthInsights/HealthInsightsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius } from '../../context/ThemeContext';

export type ArticleCategory = 'all' | 'nutrition' | 'wellness' | 'fitness';

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  image: string;
  author: string;
  readTime: number; // minutes
  excerpt: string;
  content: string;
  tags: string[];
  isFeatured?: boolean;
  publishedDate: string;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Chế độ ăn Địa Trung Hải: Bí quyết sống lâu và khỏe mạnh',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    author: 'Dr. Nguyễn Minh',
    readTime: 8,
    excerpt: 'Tìm hiểu về chế độ ăn được khoa học công nhận là tốt nhất cho sức khỏe tim mạch và tuổi thọ.',
    content: 'Chế độ ăn Địa Trung Hải là một trong những chế độ ăn uống được nghiên cứu nhiều nhất và được khoa học chứng minh là có lợi cho sức khỏe. Đặc trưng bởi việc tiêu thụ nhiều trái cây, rau củ, ngũ cốc nguyên hạt, các loại hạt, dầu ô liu, và cá. Chế độ ăn này giúp giảm nguy cơ mắc bệnh tim mạch, tiểu đường type 2, và các bệnh mãn tính khác.',
    tags: ['dinh dưỡng', 'tim mạch', 'tuổi thọ'],
    isFeatured: true,
    publishedDate: '10/12/2025',
  },
  {
    id: '2',
    title: 'Lợi ích của việc tập Yoga mỗi ngày',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    author: 'Lê Thu Hà',
    readTime: 6,
    excerpt: 'Khám phá những lợi ích tuyệt vời mà Yoga mang lại cho cả thể chất và tinh thần.',
    content: 'Yoga không chỉ là bài tập thể dục đơn thuần mà còn là nghệ thuật kết hợp giữa cơ thể và tâm trí. Thực hành yoga đều đặn giúp cải thiện sự linh hoạt, tăng cường sức mạnh cơ bắp, giảm stress và lo âu, cải thiện giấc ngủ, và tăng cường sức khỏe tim mạch.',
    tags: ['yoga', 'thư giãn', 'sức khỏe tâm thần'],
    isFeatured: true,
    publishedDate: '09/12/2025',
  },
  {
    id: '3',
    title: 'Protein: Nên ăn bao nhiêu mỗi ngày?',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
    author: 'BS. Trần Văn Hùng',
    readTime: 5,
    excerpt: 'Hướng dẫn chi tiết về lượng protein cần thiết cho từng đối tượng và mục tiêu sức khỏe.',
    content: 'Protein là dưỡng chất thiết yếu cho cơ thể. Lượng protein khuyến nghị hàng ngày thay đổi tùy theo tuổi tác, giới tính, và mức độ hoạt động. Người trưởng thành nên tiêu thụ khoảng 0.8-1g protein/kg trọng lượng cơ thể. Vận động viên và người tập gym có thể cần 1.6-2.2g/kg.',
    tags: ['protein', 'dinh dưỡng', 'cơ bắp'],
    publishedDate: '08/12/2025',
  },
  {
    id: '4',
    title: 'HIIT vs Cardio: Phương pháp nào tốt hơn?',
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    author: 'HLV Phạm Đức',
    readTime: 7,
    excerpt: 'So sánh chi tiết giữa tập luyện cường độ cao và cardio truyền thống.',
    content: 'HIIT (High-Intensity Interval Training) và Cardio đều có ưu điểm riêng. HIIT giúp đốt cháy mỡ nhanh hơn, tăng cường chuyển hóa sau tập, và tiết kiệm thời gian. Cardio truyền thống phù hợp cho người mới bắt đầu, ít áp lực lên khớp, và cải thiện sức bền tim mạch lâu dài.',
    tags: ['HIIT', 'cardio', 'giảm cân'],
    isFeatured: true,
    publishedDate: '07/12/2025',
  },
  {
    id: '5',
    title: 'Giấc ngủ và sức khỏe: Mối liên hệ quan trọng',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800',
    author: 'Dr. Hoàng Mai',
    readTime: 9,
    excerpt: 'Tại sao giấc ngủ chất lượng là chìa khóa cho sức khỏe tổng thể.',
    content: 'Giấc ngủ đóng vai trò quan trọng trong việc phục hồi cơ thể, tăng cường trí nhớ, điều hòa hormone, và tăng cường hệ miễn dịch. Người trưởng thành nên ngủ 7-9 tiếng mỗi đêm. Thiếu ngủ mãn tính có thể dẫn đến béo phì, tiểu đường, bệnh tim, và suy giảm nhận thức.',
    tags: ['giấc ngủ', 'sức khỏe', 'phục hồi'],
    publishedDate: '06/12/2025',
  },
  {
    id: '6',
    title: 'Thực phẩm siêu dinh dưỡng bạn nên ăn hàng ngày',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    author: 'Chuyên gia Lê Anh',
    readTime: 6,
    excerpt: 'Danh sách các siêu thực phẩm giàu chất dinh dưỡng và chống oxy hóa.',
    content: 'Các siêu thực phẩm như blueberry, kale, quinoa, cá hồi, hạt chia, và bơ chứa hàm lượng cao vitamin, khoáng chất, chất chống oxy hóa, và omega-3. Bổ sung những thực phẩm này vào chế độ ăn hàng ngày giúp tăng cường miễn dịch, chống lão hóa, và giảm nguy cơ bệnh mãn tính.',
    tags: ['superfood', 'dinh dưỡng', 'chống oxy hóa'],
    publishedDate: '05/12/2025',
  },
  {
    id: '7',
    title: 'Cách xây dựng thói quen tập luyện bền vững',
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    author: 'HLV Nguyễn Tuấn',
    readTime: 8,
    excerpt: 'Bí quyết để duy trì động lực tập luyện lâu dài.',
    content: 'Xây dựng thói quen tập luyện bền vững đòi hỏi sự kiên nhẫn và chiến lược đúng đắn. Bắt đầu với mục tiêu nhỏ, chọn hoạt động bạn thích, tạo lịch tập cố định, tìm bạn tập cùng, và theo dõi tiến độ. Quan trọng nhất là không quá khắt khe với bản thân và cho phép những ngày nghỉ ngơi.',
    tags: ['thói quen', 'động lực', 'tập luyện'],
    publishedDate: '04/12/2025',
  },
  {
    id: '8',
    title: 'Stress và cách quản lý hiệu quả',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    author: 'Tâm lý học Phạm Lan',
    readTime: 10,
    excerpt: 'Các kỹ thuật khoa học để giảm stress và cải thiện chất lượng cuộc sống.',
    content: 'Stress mãn tính ảnh hưởng tiêu cực đến sức khỏe thể chất và tinh thần. Các phương pháp quản lý stress hiệu quả bao gồm: thiền định, hít thở sâu, tập thể dục đều đặn, dành thời gian cho sở thích, kết nối xã hội, ngủ đủ giấc, và tìm kiếm sự hỗ trợ chuyên nghiệp khi cần thiết.',
    tags: ['stress', 'sức khỏe tâm thần', 'thiền'],
    publishedDate: '03/12/2025',
  },
  {
    id: '9',
    title: 'Intermittent Fasting: Có phù hợp với bạn?',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800',
    author: 'BS. Vũ Thu',
    readTime: 7,
    excerpt: 'Tìm hiểu về phương pháp ăn kiêng ngắt quãng và ai nên/không nên áp dụng.',
    content: 'Intermittent Fasting (IF) là phương pháp luân phiên giữa giai đoạn ăn và nhịn. Các phương pháp phổ biến: 16:8, 5:2, Eat-Stop-Eat. IF có thể giúp giảm cân, cải thiện insulin sensitivity, giảm viêm. Tuy nhiên, không phù hợp với phụ nữ mang thai, người có tiền sử rối loạn ăn uống, hoặc bệnh mãn tính.',
    tags: ['intermittent fasting', 'giảm cân', 'chuyển hóa'],
    publishedDate: '02/12/2025',
  },
  {
    id: '10',
    title: 'Stretching: Tại sao bạn cần làm mỗi ngày',
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    author: 'HLV Đỗ Hải',
    readTime: 5,
    excerpt: 'Lợi ích của việc kéo giãn cơ và cách thực hiện đúng cách.',
    content: 'Stretching (kéo giãn) cải thiện độ linh hoạt, giảm nguy cơ chấn thương, tăng lưu lượng máu đến cơ, giảm đau nhức, và cải thiện tư thế. Nên kéo giãn sau khi khởi động hoặc sau tập luyện khi cơ đã ấm. Giữ mỗi động tác 15-30 giây, thở đều, không nhảy lò cò.',
    tags: ['stretching', 'linh hoạt', 'phòng chấn thương'],
    publishedDate: '01/12/2025',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: 'grid-outline', color: colors.primary },
  { id: 'nutrition', name: 'Dinh dưỡng', icon: 'nutrition-outline', color: '#FF6B6B' },
  { id: 'wellness', name: 'Sức khỏe', icon: 'heart-outline', color: '#4ECDC4' },
  { id: 'fitness', name: 'Thể hình', icon: 'barbell-outline', color: '#95E1D3' },
];

const TRENDING_TAGS = ['protein', 'giảm cân', 'yoga', 'HIIT', 'giấc ngủ', 'dinh dưỡng', 'tim mạch'];

export default function HealthInsightsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);

  const filteredArticles = selectedCategory === 'all' 
    ? ARTICLES 
    : ARTICLES.filter(article => article.category === selectedCategory);

  const featuredArticles = ARTICLES.filter(article => article.isFeatured);

  const getCategoryColor = (category: ArticleCategory) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat?.color || colors.primary;
  };

  const handleArticlePress = (article: Article) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  const renderFeaturedSection = () => {
    if (selectedCategory !== 'all') return null;

    return (
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Nổi bật</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {featuredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.featuredCard}
              onPress={() => handleArticlePress(article)}
            >
              <Image source={{ uri: article.image }} style={styles.featuredImage} />
              <View style={styles.featuredOverlay}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.category) }]}>
                  <Text style={styles.categoryBadgeText}>
                    {CATEGORIES.find(c => c.id === article.category)?.name}
                  </Text>
                </View>
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <View style={styles.featuredMeta}>
                  <Ionicons name="person-circle-outline" size={16} color="#fff" />
                  <Text style={styles.featuredAuthor}>{article.author}</Text>
                  <Text style={styles.featuredDot}>•</Text>
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <Text style={styles.featuredReadTime}>{article.readTime} phút</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTrendingTags = () => {
    if (selectedCategory !== 'all') return null;

    return (
      <View style={styles.trendingSection}>
        <Text style={styles.sectionTitle}>Xu hướng</Text>
        <View style={styles.tagsContainer}>
          {TRENDING_TAGS.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Ionicons name="trending-up" size={14} color={colors.primary} />
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderArticlesList = () => {
    return (
      <View style={styles.articlesSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? 'Tất cả bài viết' : `Bài viết về ${CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
        </Text>
        {filteredArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => handleArticlePress(article)}
          >
            <Image source={{ uri: article.image }} style={styles.articleImage} />
            <View style={styles.articleContent}>
              <View style={[styles.articleCategoryBadge, { backgroundColor: getCategoryColor(article.category) + '20' }]}>
                <Text style={[styles.articleCategoryText, { color: getCategoryColor(article.category) }]}>
                  {CATEGORIES.find(c => c.id === article.category)?.name}
                </Text>
              </View>
              <Text style={styles.articleTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <Text style={styles.articleExcerpt} numberOfLines={2}>
                {article.excerpt}
              </Text>
              <View style={styles.articleMeta}>
                <Text style={styles.articleAuthor}>{article.author}</Text>
                <Text style={styles.articleDot}>•</Text>
                <Text style={styles.articleReadTime}>{article.readTime} phút đọc</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderArticleModal = () => {
    if (!selectedArticle) return null;

    return (
      <Modal
        visible={showArticleModal}
        animationType="slide"
        onRequestClose={() => setShowArticleModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowArticleModal(false)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookmarkButton}>
              <Ionicons name="bookmark-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedArticle.image }} style={styles.modalImage} />
            
            <View style={styles.modalBody}>
              <View style={[styles.modalCategoryBadge, { backgroundColor: getCategoryColor(selectedArticle.category) }]}>
                <Text style={styles.modalCategoryText}>
                  {CATEGORIES.find(c => c.id === selectedArticle.category)?.name}
                </Text>
              </View>

              <Text style={styles.modalTitle}>{selectedArticle.title}</Text>

              <View style={styles.modalMeta}>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="person-circle" size={20} color={colors.textSecondary} />
                  <Text style={styles.modalMetaText}>{selectedArticle.author}</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.modalMetaText}>{selectedArticle.publishedDate}</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.modalMetaText}>{selectedArticle.readTime} phút</Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalExcerpt}>{selectedArticle.excerpt}</Text>
              <Text style={styles.modalContentText}>{selectedArticle.content}</Text>

              <View style={styles.modalTags}>
                {selectedArticle.tags.map((tag, index) => (
                  <View key={index} style={styles.modalTag}>
                    <Text style={styles.modalTagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kiến thức sức khỏe</Text>
        <Text style={styles.headerSubtitle}>Cập nhật thông tin mới nhất</Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && { backgroundColor: category.color },
            ]}
            onPress={() => setSelectedCategory(category.id as ArticleCategory)}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={selectedCategory === category.id ? '#fff' : category.color}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {renderFeaturedSection()}
        {renderTrendingTags()}
        {renderArticlesList()}
      </ScrollView>

      {/* Article Detail Modal */}
      {renderArticleModal()}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  
  // Categories
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#fff',
  },

  // Main Content
  mainContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Featured Section
  featuredSection: {
    paddingVertical: spacing.md,
  },
  featuredScroll: {
    paddingHorizontal: spacing.md,
  },
  featuredCard: {
    width: 280,
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredAuthor: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  featuredDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  featuredReadTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },

  // Trending Tags
  trendingSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // Articles List
  articlesSection: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  articleImage: {
    width: 120,
    height: 120,
  },
  articleContent: {
    flex: 1,
    padding: spacing.md,
  },
  articleCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  articleCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  articleExcerpt: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  articleAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  articleDot: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  articleReadTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Article Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
  },
  bookmarkButton: {
    padding: spacing.xs,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  modalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  modalExcerpt: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  modalContentText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
