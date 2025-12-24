import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ServiceCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}
const serviceCategories: ServiceCategory[] = [
  { id: '1', name: 'Plumbing', icon: 'water', color: '#3b82f6' },
  { id: '2', name: 'Electrical', icon: 'flash', color: '#f59e0b' },
  { id: '3', name: 'Carpentry', icon: 'hammer', color: '#8b5cf6' },
  { id: '4', name: 'Cleaning', icon: 'sparkles', color: '#ec4899' },
  { id: '5', name: 'Painting', icon: 'brush', color: '#10b981' },
  { id: '6', name: 'Gardening', icon: 'leaf', color: '#059669' },
  { id: '7', name: 'Moving', icon: 'car', color: '#6366f1' },
  { id: '8', name: 'More', icon: 'grid', color: '#64748b' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const handleServicePress = (serviceName: string) => {
    console.log('Selected service:', serviceName);
    // Navigate to service details or booking screen
  };

  const handleProfilePress = () => {
    console.log('Profile pressed');
  };

  const handleNotificationPress = () => {
    router.push('/notification');
    console.log('Notifications pressed');
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, User!</Text>
              <Text style={styles.subtitle}>What service do you need today?</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleNotificationPress}
              >
                <Ionicons name="notifications-outline" size={24} color="#0d9488" />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleProfilePress}
              >
                <Ionicons name="person-circle-outline" size={28} color="#0d9488" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for services..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color="#0d9488" />
            </TouchableOpacity>
          </View>

          {/* AI Prompt Input */}
          <View style={styles.aiPromptContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#64748b" style={styles.aiIcon} />
            <TextInput
              style={styles.aiPromptInput}
              placeholder="Describe your problem for AI suggestions..."
              placeholderTextColor="#94a3b8"
              value={aiPrompt}
              onChangeText={setAiPrompt}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.aiSubmitButton}>
              <Ionicons name="send" size={20} color="#0d9488" />
            </TouchableOpacity>
          </View>

          {/* Service Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <View style={styles.categoriesGrid}>
              {serviceCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleServicePress(category.name)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon} size={28} color="white" />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Featured Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Providers</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.featuredScroll}
            >
              <View style={styles.featuredCard}>
                <View style={styles.featuredImage}>
                  <Ionicons name="person" size={40} color="#0d9488" />
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredName}>John Doe</Text>
                  <Text style={styles.featuredService}>Plumber</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.ratingText}>4.8 (120)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.featuredCard}>
                <View style={styles.featuredImage}>
                  <Ionicons name="person" size={40} color="#0d9488" />
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredName}>Jane Smith</Text>
                  <Text style={styles.featuredService}>Electrician</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.ratingText}>4.9 (95)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.featuredCard}>
                <View style={styles.featuredImage}>
                  <Ionicons name="person" size={40} color="#0d9488" />
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredName}>Mike Johnson</Text>
                  <Text style={styles.featuredService}>Carpenter</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.ratingText}>4.7 (88)</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Recent Bookings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            
            <View style={styles.bookingCard}>
              <View style={styles.bookingIcon}>
                <Ionicons name="water" size={24} color="#3b82f6" />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingTitle}>Plumbing Service</Text>
                <Text style={styles.bookingDate}>Today, 2:00 PM</Text>
              </View>
              <View style={styles.bookingStatus}>
                <Text style={styles.statusText}>Pending</Text>
              </View>
            </View>

            <View style={styles.bookingCard}>
              <View style={styles.bookingIcon}>
                <Ionicons name="flash" size={24} color="#f59e0b" />
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingTitle}>Electrical Repair</Text>
                <Text style={styles.bookingDate}>Yesterday, 10:00 AM</Text>
              </View>
              <View style={[styles.bookingStatus, styles.completedStatus]}>
                <Text style={[styles.statusText, styles.completedText]}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <LinearGradient
            colors={['#14b8a6', '#0d9488']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 30,    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1e293b',
  },
  filterButton: {
    padding: 8,
  },
  aiPromptContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  aiIcon: {
    marginRight: 10,
    marginTop: 10,
  },
  aiPromptInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 30,
    textAlignVertical: 'top',
  },
  aiSubmitButton: {
    padding: 8,
    marginLeft: 8,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d9488',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  categoryCard: {
    width: (width - 64) / 4,
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuredScroll: {
    paddingLeft: 20,
  },
  featuredCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredImage: {
    width: 128,
    height: 100,
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featuredInfo: {
    alignItems: 'flex-start',
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  featuredService: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: '#64748b',
  },
  bookingStatus: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  completedStatus: {
    backgroundColor: '#d1fae5',
  },
  completedText: {
    color: '#065f46',
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});