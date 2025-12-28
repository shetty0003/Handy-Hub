// app/(tabs)/explore.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import {
  ActivityIndicator,
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

interface ServiceProvider {
  id: string;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  hourlyRate: string;
  distance: string;
  available: boolean;
}

const categories = ['All', 'Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'Gardener'];

export default function ExploreScreen() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      let query = supabase.from('providers').select(`
        id,
        business_name,
        business_type,
        rating,
        total_jobs,
        is_available,
        profiles (
          full_name
        )
      `);

      if (selectedCategory !== 'All') {
        query = query.eq('business_type', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching providers:', error);
      } else {
        const formattedProviders = data.map((p: any) => ({
          id: p.id,
          name: p.profiles.full_name,
          service: p.business_type,
          rating: p.rating,
          reviews: p.total_jobs,
          hourlyRate: '$50', // Placeholder
          distance: '3.0 km', // Placeholder
          available: p.is_available,
        }));
        setProviders(formattedProviders);
      }
      setLoading(false);
    };

    fetchProviders();
  }, [selectedCategory]);

  const handleProviderPress = (providerId: string) => {
    console.log('Provider pressed:', providerId);
    // Navigate to provider detail screen
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Services</Text>
          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="map-outline" size={24} color="#0d9488" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
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

        {/* Providers List */}
        <ScrollView 
          style={styles.providersList}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filteredProviders.length} providers found
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="swap-vertical" size={16} color="#0d9488" />
              <Text style={styles.sortText}>Sort by</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 50 }} />
          ) : filteredProviders.length === 0 ? (
            <Text style={styles.noResultsText}>No providers found.</Text>
          ) : (
            filteredProviders.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={styles.providerCard}
                onPress={() => handleProviderPress(provider.id)}
                activeOpacity={0.7}
              >
                <View style={styles.providerLeft}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={32} color="#0d9488" />
                    {provider.available && <View style={styles.onlineBadge} />}
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerService}>{provider.service}</Text>
                    <View style={styles.providerMeta}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#f59e0b" />
                        <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
                        <Text style={styles.reviewsText}>({provider.reviews})</Text>
                      </View>
                      <View style={styles.distanceContainer}>
                        <Ionicons name="location-outline" size={14} color="#64748b" />
                        <Text style={styles.distanceText}>{provider.distance}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.providerRight}>
                  <Text style={styles.hourlyRate}>{provider.hourlyRate}</Text>
                  <Text style={styles.perHour}>/hr</Text>
                  <TouchableOpacity style={styles.bookButton}>
                    <Ionicons name="calendar-outline" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
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
  categoriesContainer: {
     marginTop: 12,
     marginBottom: 16,
    marginHorizontal: 8,
    minHeight: 10,
    maxHeight: 40,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryTextActive: {
    color: 'white',
  },
  providersList: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  noResultsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 50,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '600',
  },
  providerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  providerLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: 'white',
  },
  providerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  providerService: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  providerMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewsText: {
    fontSize: 13,
    color: '#64748b',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    color: '#64748b',
  },
  providerRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  hourlyRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  perHour: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  bookButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});