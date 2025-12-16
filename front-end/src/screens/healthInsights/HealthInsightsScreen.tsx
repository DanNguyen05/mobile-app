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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  {
    id: '11',
    title: 'Uống nước đúng cách: Bao nhiêu là đủ?',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    author: 'BS. Nguyễn Lan',
    readTime: 4,
    excerpt: 'Tầm quan trọng của việc hydrate đúng cách và dấu hiệu thiếu nước.',
    content: 'Cơ thể cần khoảng 2-3 lít nước mỗi ngày, tùy thuộc vào cân nặng, hoạt động và thời tiết. Nước giúp điều hòa nhiệt độ cơ thể, vận chuyển chất dinh dưỡng, đào thải độc tố. Dấu hiệu thiếu nước: môi khô, nước tiểu vàng đậm, mệt mỏi, đau đầu. Uống nước đều đặn trong ngày, không đợi khát mới uống.',
    tags: ['hydration', 'nước', 'sức khỏe'],
    publishedDate: '30/11/2025',
  },
  {
    id: '12',
    title: 'Chạy bộ đúng tư thế: Tránh chấn thương',
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    author: 'HLV Minh Tuấn',
    readTime: 6,
    excerpt: 'Hướng dẫn kỹ thuật chạy bộ an toàn và hiệu quả.',
    content: 'Tư thế chạy đúng giúp tránh chấn thương và tăng hiệu suất. Lưu ý: thân người nghiêng nhẹ về phía trước, vai thư giãn, tay swing tự nhiên, chân đáp nhẹ xuống giữa bàn chân, không gót chân. Tăng cường độ từ từ, không vượt quá 10% mỗi tuần. Đầu tư giày chạy phù hợp với form chân.',
    tags: ['chạy bộ', 'kỹ thuật', 'an toàn'],
    isFeatured: true,
    publishedDate: '29/11/2025',
  },
  {
    id: '13',
    title: 'Vitamin D: Nguồn năng lượng mặt trời',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    author: 'Chuyên gia Hoàng Anh',
    readTime: 5,
    excerpt: 'Tại sao Vitamin D quan trọng và cách bổ sung hiệu quả.',
    content: 'Vitamin D cần thiết cho xương khỏe, hệ miễn dịch, và sức khỏe tâm thần. Cơ thể tổng hợp Vitamin D từ ánh nắng mặt trời. Thiếu Vitamin D phổ biến ở người ít ra ngoài, người da tối, và vùng ít nắng. Nguồn cung cấp: ánh nắng sớm 15-20 phút/ngày, cá béo (cá hồi, cá thu), trứng, sữa fortified, hoặc bổ sung viên uống.',
    tags: ['vitamin D', 'xương', 'miễn dịch'],
    publishedDate: '28/11/2025',
  },
  {
    id: '14',
    title: 'Thiền định cho người mới bắt đầu',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800',
    author: 'Giáo viên Thanh Hà',
    readTime: 7,
    excerpt: 'Hướng dẫn từng bước để bắt đầu thực hành thiền định.',
    content: 'Thiền định giúp giảm stress, tăng tập trung, cải thiện sức khỏe tâm thần. Cách bắt đầu: Chọn không gian yên tĩnh, ngồi thoải mái, nhắm mắt hoặc nhìn điểm cố định, tập trung vào hơi thở. Bắt đầu với 5 phút mỗi ngày, tăng dần. Khi tâm trí lang thang, nhẹ nhàng đưa về hơi thở. Không kỳ vọng hoàn hảo, quan trọng là thực hành đều đặn.',
    tags: ['thiền', 'mindfulness', 'thư giãn'],
    publishedDate: '27/11/2025',
  },
  {
    id: '15',
    title: 'Chất béo lành mạnh: Không phải kẻ thù',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800',
    author: 'Dinh dưỡng viên Mai Linh',
    readTime: 6,
    excerpt: 'Phân biệt chất béo tốt và xấu cho sức khỏe.',
    content: 'Chất béo không bão hòa (omega-3, omega-6) tốt cho tim mạch, não bộ, giảm viêm. Nguồn: cá béo, bơ, các loại hạt, dầu ô liu. Chất béo bão hòa và trans fat nên hạn chế: thịt mỡ, bơ động vật, thức ăn chiên rán, đồ ăn chế biến sẵn. Cân bằng là chìa khóa: 20-35% năng lượng từ chất béo lành mạnh.',
    tags: ['chất béo', 'omega-3', 'tim mạch'],
    publishedDate: '26/11/2025',
  },
  {
    id: '16',
    title: 'Plank: Bài tập core tối ưu',
    category: 'fitness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    author: 'PT Quang Minh',
    readTime: 5,
    excerpt: 'Cách thực hiện plank đúng kỹ thuật và biến thể.',
    content: 'Plank là bài tập đẳng trường tuyệt vời cho core, vai, lưng. Kỹ thuật: Tì khuỷu tay xuống sàn, cơ thể thẳng từ đầu đến chân, core strained, không hạ hoặc nâng mông. Giữ 30-60 giây, nghỉ, lặp lại. Biến thể: side plank, plank with leg lift, plank to push-up. Tránh: võng lưng, nín thở, vai nhún lên.',
    tags: ['plank', 'core', 'abs'],
    publishedDate: '25/11/2025',
  },
  {
    id: '17',
    title: 'Tác hại của đường và cách giảm thiểu',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=800',
    author: 'BS. Tuấn Anh',
    readTime: 8,
    excerpt: 'Hiểu về đường tinh luyện và chiến lược giảm tiêu thụ.',
    content: 'Tiêu thụ đường quá mức dẫn đến béo phì, tiểu đường type 2, sâu răng, bệnh tim. WHO khuyến nghị dưới 25g đường/ngày. Đường ẩn trong: nước ngọt, nước trái cây đóng chai, sốt, yogurt có hương vị, đồ ăn chế biến sẵn. Mẹo giảm đường: đọc nhãn dinh dưỡng, chọn nguyên liệu tự nhiên, thay nước ngọt bằng nước lọc/trà không đường, ăn trái cây thay vì uống nước ép.',
    tags: ['đường', 'tiểu đường', 'giảm cân'],
    publishedDate: '24/11/2025',
  },
  {
    id: '18',
    title: 'Sức mạnh của tư thế: Posture và sức khỏe',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    author: 'Chuyên gia Vật lý trị liệu Hải Yến',
    readTime: 6,
    excerpt: 'Tầm quan trọng của tư thế đúng trong cuộc sống hàng ngày.',
    content: 'Tư thế xấu gây đau lưng, cổ, vai, đau đầu, giảm năng lượng. Nguyên nhân: ngồi lâu, thiết bị điện tử, stress, cơ yếu. Cải thiện tư thế: điều chỉnh ghế và màn hình máy tính, nghỉ giải lao 30 phút/lần, tập stretching, tăng cường cơ core và lưng, nhận thức về tư thế trong mọi hoạt động.',
    tags: ['tư thế', 'đau lưng', 'ergonomics'],
    publishedDate: '23/11/2025',
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
  const navigation = useNavigation();
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
        <View style={styles.sectionHeader}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.sectionTitle}>Nổi bật</Text>
        </View>
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
              activeOpacity={0.9}
            >
              <Image source={{ uri: article.image }} style={styles.featuredImage} />
              <View style={styles.featuredGradient}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.category) }]}>
                  <Text style={styles.categoryBadgeText}>
                    {CATEGORIES.find(c => c.id === article.category)?.name}
                  </Text>
                </View>
                <Text style={styles.featuredTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <View style={styles.featuredMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featuredAuthor}>{article.author}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featuredReadTime}>{article.readTime} phút</Text>
                  </View>
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
        <View style={styles.sectionHeader}>
          <Ionicons name="flame" size={20} color="#FF6B6B" />
          <Text style={styles.sectionTitle}>Xu hướng</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScroll}
        >
          {TRENDING_TAGS.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag} activeOpacity={0.7}>
              <Ionicons name="trending-up" size={14} color={colors.primary} />
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderArticlesList = () => {
    return (
      <View style={styles.articlesSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'Tất cả bài viết' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </Text>
        </View>
        {filteredArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => handleArticlePress(article)}
            activeOpacity={0.95}
          >
            <Image source={{ uri: article.image }} style={styles.articleImage} />
            <View style={styles.articleContent}>
              <View style={[styles.articleCategoryBadge, { backgroundColor: getCategoryColor(article.category) }]}>
                <Text style={styles.articleCategoryText}>
                  {CATEGORIES.find(c => c.id === article.category)?.name}
                </Text>
              </View>
              <Text style={styles.articleTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <Text style={styles.articleExcerpt} numberOfLines={2}>
                {article.excerpt}
              </Text>
              <View style={styles.articleFooter}>
                <View style={styles.articleMeta}>
                  <Ionicons name="person" size={14} color={colors.textSecondary} />
                  <Text style={styles.articleAuthor}>{article.author}</Text>
                </View>
                <View style={styles.articleReadTime}>
                  <Ionicons name="time" size={14} color={colors.textSecondary} />
                  <Text style={styles.articleReadTimeText}>{article.readTime} phút</Text>
                </View>
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
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: selectedArticle.image }} style={styles.modalImage} />
            
            {/* Floating Back Button */}
            <TouchableOpacity 
              onPress={() => setShowArticleModal(false)} 
              style={styles.modalBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.modalBody}>
              <View style={[styles.modalCategoryBadge, { backgroundColor: getCategoryColor(selectedArticle.category) }]}>
                <Text style={styles.modalCategoryText}>
                  {CATEGORIES.find(c => c.id === selectedArticle.category)?.name}
                </Text>
              </View>

              <Text style={styles.modalTitle}>{selectedArticle.title}</Text>

              <View style={styles.modalMeta}>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="person" size={18} color={colors.textSecondary} />
                  <Text style={styles.modalMetaText}>{selectedArticle.author}</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                  <Text style={styles.modalMetaText}>{selectedArticle.publishedDate}</Text>
                </View>
                <View style={styles.modalMetaItem}>
                  <Ionicons name="time" size={18} color={colors.textSecondary} />
                  <Text style={styles.modalMetaText}>{selectedArticle.readTime} phút</Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalExcerpt}>{selectedArticle.excerpt}</Text>
              <Text style={styles.modalContentText}>{selectedArticle.content}</Text>

              <View style={styles.modalTags}>
                {selectedArticle.tags.map((tag, index) => (
                  <View key={index} style={styles.modalTag}>
                    <Ionicons name="pricetag" size={14} color={colors.primary} />
                    <Text style={styles.modalTagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiến thức sức khỏe</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && { 
                  backgroundColor: category.color,
                  borderColor: category.color,
                },
              ]}
              onPress={() => setSelectedCategory(category.id as ArticleCategory)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
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
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderFeaturedSection()}
        {renderTrendingTags()}
        {renderArticlesList()}
      </ScrollView>

      {/* Article Detail Modal */}
      {renderArticleModal()}
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
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  
  // Categories
  categoriesWrapper: {
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Main Content
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  // Featured Section
  featuredSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
  },
  featuredScroll: {
    paddingRight: spacing.md,
  },
  featuredCard: {
    width: 300,
    height: 220,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: spacing.sm,
  },
  featuredAuthor: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
  },
  featuredReadTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
  },

  // Trending Tags
  trendingSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: '#F9FAFB',
  },
  tagsScroll: {
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.primary + '30',
    marginRight: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Articles List
  articlesSection: {
    padding: spacing.md,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  articleImage: {
    width: 130,
    height: 160,
  },
  articleContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  articleCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  articleCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    lineHeight: 21,
  },
  articleExcerpt: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  articleReadTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleReadTimeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Article Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalBackButton: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalBody: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  modalCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 34,
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
    fontWeight: '500',
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
    marginBottom: spacing.lg,
    lineHeight: 26,
    fontStyle: 'italic',
    padding: spacing.md,
    backgroundColor: colors.primary + '08',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  modalContentText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  modalTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
