import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import { getAverageRating, getProviderReviews } from '../utils/reviewHelpers';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [provider, setProvider] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Error', 'Provider not found');
        return;
      }

      setProvider(data);

      // Get average rating
      const { average } = await getAverageRating(id);
      setAvgRating(average);

      // Get reviews
      const { reviews: providerReviews, error: reviewsError } = await getProviderReviews(id);
      if (!reviewsError) {
        setReviews(providerReviews);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !provider) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f0fdfa', '#ccfbf1']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#0d9488" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Provider</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Provider Card */}
          <View style={styles.card}>
            <View style={styles.providerHeader}>
              <View style={styles.avatar}>
                <Ionicons name="business" size={32} color="white" />
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.businessName}>{provider.business_name}</Text>
                <Text style={styles.businessType}>{provider.business_type}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({provider.total_jobs || 0} jobs)</Text>
                </View>
              </View>
            </View>

            {provider.service_categories && provider.service_categories.length > 0 && (
              <View style={styles.categoriesContainer}>
                {provider.service_categories.map((cat: string, i: number) => (
                  <View key={i} style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{cat}</Text>
                  </View>
                ))}
              </View>
            )}

            {provider.service_areas && provider.service_areas.length > 0 && (
              <View style={styles.areasContainer}>
                <Text style={styles.areasLabel}>Service Areas:</Text>
                <Text style={styles.areasText}>{provider.service_areas.join(', ')}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Provider</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            {reviews.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="star-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No reviews yet</Text>
              </View>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        <Ionicons name="person" size={20} color="#0d9488" />
                      </View>
                      <Text style={styles.reviewerName}>Customer</Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingBadgeText}>{review.rating}</Text>
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  businessType: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#0d9488',
  },
  reviewCount: {
    fontSize: 14,
    color: '#64748b',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  categoryText: {
    fontSize: 12,
    color: '#0d9488',
    fontWeight: '500',
  },
  areasContainer: {
    marginBottom: 16,
  },
  areasLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  areasText: {
    fontSize: 14,
    color: '#1e293b',
  },
  contactButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  reviewCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  reviewComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
