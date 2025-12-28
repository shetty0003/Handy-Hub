import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile } from '../../utils/profileHelper';
import { supabase } from '../../utils/supabase';


const { width } = Dimensions.get('window');

interface ServiceCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface Provider {
  id: string;
  business_name: string;
  business_type: string;
  rating: number;
  total_jobs: number;
  profiles: {
    full_name: string;
  } | null;
}

interface Booking {
  id: string;
  service_name: string;
  booking_time: string;
  status: string;
  service_categories: {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  };
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.id);
          setUser(profile);
        }

        // Fetch service categories
        const { data: categories, error: categoriesError } = await supabase
          .from('service_categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          console.error('Error fetching service categories:', categoriesError);
        } else {
          setServiceCategories(categories as ServiceCategory[]);
        }

        // Fetch featured providers
        const { data: providers, error: providersError } = await supabase
          .from('providers')
          .select(`
            id,
            business_name,
            business_type,
            rating,
            total_jobs,
            profiles (
              full_name
            )
          `)
          .order('rating', { ascending: false })
          .limit(5);

        if (providersError) {
          console.error('Error fetching featured providers:', providersError);
        } else {
          setFeaturedProviders(providers as any);
        }

        // Fetch recent bookings - FIXED QUERY
        try {
          const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
              id,
              service_name,
              booking_time,
              status,
              services (
                service_categories (
                  icon,
                  color
                )
              )
            `)
            .eq('user_id', currentUser?.id)
            .order('booking_time', { ascending: false })
            .limit(5);

          if (bookingsError) {
            console.error('Error with Option 1:', bookingsError);
            
            // OPTION 2: If bookings has category_id directly
            const { data: bookings2, error: bookingsError2 } = await supabase
              .from('bookings')
              .select(`
                id,
                service_name,
                booking_time,
                status,
                category_id
              `)
              .eq('user_id', currentUser?.id)
              .order('booking_time', { ascending: false })
              .limit(5);

            if (bookingsError2) {
              console.error('Error with Option 2:', bookingsError2);
              
              // OPTION 3: Just get basic booking data without categories
              const { data: bookings3, error: bookingsError3 } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', currentUser?.id)
                .order('booking_time', { ascending: false })
                .limit(5);

              if (bookingsError3) {
                console.error('Error with Option 3:', bookingsError3);
                setRecentBookings([]);
              } else if (bookings3) {
                // Map bookings with default category icon
                const mappedBookings = bookings3.map(booking => ({
                  id: booking.id,
                  service_name: booking.service_name || 'Service',
                  booking_time: booking.booking_time,
                  status: booking.status || 'Pending',
                  service_categories: {
                    icon: 'construct-outline' as keyof typeof Ionicons.glyphMap,
                    color: '#0d9488'
                  }
                }));
                setRecentBookings(mappedBookings);
              }
            } else if (bookings2) {
              // If we have category_id, fetch categories separately
              const categoryIds = bookings2.map(b => b.category_id).filter(Boolean);
              const categoriesMap: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {};
              
              if (categoryIds.length > 0) {
                const { data: categoriesData } = await supabase
                  .from('service_categories')
                  .select('*')
                  .in('id', categoryIds);
                
                if (categoriesData) {
                  categoriesData.forEach((category: any) => {
                    categoriesMap[category.id] = {
                      icon: category.icon as keyof typeof Ionicons.glyphMap,
                      color: category.color
                    };
                  });
                }
              }
              
              const mappedBookings = bookings2.map(booking => ({
                id: booking.id,
                service_name: booking.service_name || 'Service',
                booking_time: booking.booking_time,
                status: booking.status || 'Pending',
                service_categories: categoriesMap[booking.category_id] || {
                  icon: 'construct-outline' as keyof typeof Ionicons.glyphMap,
                  color: '#0d9488'
                }
              }));
              
              setRecentBookings(mappedBookings);
            }
          } else if (bookings) {
            // Transform data from Option 1
            const transformedBookings = bookings.map(booking => {
              // booking.services might be an array, so get the first service's category
              const serviceCategory = Array.isArray(booking.services) && 
                booking.services.length > 0 && 
                Array.isArray(booking.services[0]?.service_categories) && 
                booking.services[0].service_categories.length > 0
                ? booking.services[0].service_categories[0]
                : booking.services?.[0]?.service_categories?.[0] || {
                    icon: 'construct-outline' as keyof typeof Ionicons.glyphMap,
                    color: '#0d9488'
                  };

              return {
                id: booking.id,
                service_name: booking.service_name || 'Service',
                booking_time: booking.booking_time,
                status: booking.status || 'Pending',
                service_categories: serviceCategory
              };
            });
            
            setRecentBookings(transformedBookings);
          }
        } catch (error) {
          console.error('Error in bookings fetch:', error);
          setRecentBookings([]);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleServicePress = (serviceName: string) => {
    router.push('/serviceselectionscreen');
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleNotificationPress = () => {
    router.push('/notification');
    console.log('Notifications pressed');
  };

  const handleAIButtonPress = () => {
    console.log('AI Prompt:', aiPrompt);
    // TODO: Implement AI suggestion logic
    alert('AI feature coming soon!');
    setAiPrompt('');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <LinearGradient colors={['#f0fdfa', '#ccfbf1', '#ffffff']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.full_name || 'User'}!</Text>
              <Text style={styles.subtitle}>What service do you need today?</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
                <Ionicons name="notifications-outline" size={24} color="#0d9488" />
                <View style={styles.badge} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress}>
                <Ionicons name="person-outline" size={24} color="#0d9488" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#64748b" style={styles.searchIcon} />
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
            <Ionicons name="sparkles" size={20} color="#FFD700" style={styles.aiIcon} />
            <TextInput
              style={styles.aiPromptInput}
              placeholder="Ask AI for service suggestions..."
              placeholderTextColor="#94a3b8"
              value={aiPrompt}
              onChangeText={setAiPrompt}
              multiline
            />
            <TouchableOpacity style={styles.aiSubmitButton} onPress={handleAIButtonPress}>
              <Ionicons name="send" size={20} color="#0d9488" />
            </TouchableOpacity>
          </View>

          {/* Service Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Services</Text>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#0d9488" />
            ) : serviceCategories.length === 0 ? (
              <View style={styles.noDataCard}>
                <Text style={styles.noDataText}>No services available</Text>
              </View>
            ) : (
              <View style={styles.categoriesGrid}>
                {serviceCategories.map((category: ServiceCategory) => (
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
            )}
          </View>

          {/* Featured Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Providers</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/providers' as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#0d9488" />
            ) : featuredProviders.length === 0 ? (
              <View style={styles.noDataCard}>
                <Text style={styles.noDataText}>No providers available</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                {featuredProviders.map((provider: Provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    style={styles.featuredCard}
                    onPress={() =>
                      router.push({
                        pathname: '/provider/[id]',
                        params: { id: provider.id }
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.featuredImage}>
                      <Ionicons name="person" size={40} color="#0d9488" />
                    </View>
                    <View style={styles.featuredInfo}>
                      <Text style={styles.featuredName} numberOfLines={1}>
                        {provider.business_name || provider.profiles?.full_name || 'Provider'}
                      </Text>
                      <Text style={styles.featuredService} numberOfLines={1}>
                        {provider.business_type || 'Service Provider'}
                      </Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={16} color="#fbbf24" />
                        <Text style={styles.ratingText}>
                          {provider.rating?.toFixed(1) || '0.0'} ({provider.total_jobs || 0})
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Recent Bookings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <TouchableOpacity onPress={() => router.push('/bookings' as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#0d9488" />
            ) : recentBookings.length === 0 ? (
              <View style={styles.noBookingCard}>
                <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                <Text style={styles.noDataText}>No recent bookings</Text>
                <TouchableOpacity
                  style={styles.bookNowButton}
                  onPress={() => router.push('/needservice')}
                >
                  <Text style={styles.bookNowText}>Book a Service</Text>
                </TouchableOpacity>
              </View>
            ) : (
              recentBookings.map((booking: Booking) => (
                <TouchableOpacity
                  key={booking.id}
                  style={styles.bookingCard}
                  onPress={() =>
                    router.push({
                      pathname: '/booking/[id]',
                      params: { id: booking.id }
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.bookingIcon,
                      { backgroundColor: booking.service_categories.color }
                    ]}
                  >
                    <Ionicons
                      name={booking.service_categories.icon}
                      size={24}
                      color="white"
                    />
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingTitle}>{booking.service_name}</Text>
                    <Text style={styles.bookingDate}>{formatDate(booking.booking_time)}</Text>
                  </View>
                  <View
                    style={[
                      styles.bookingStatus,
                      booking.status === 'completed' && styles.completedStatus,
                      booking.status === 'cancelled' && styles.cancelledStatus,
                      booking.status === 'in_progress' && styles.inProgressStatus
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        booking.status === 'completed' && styles.completedText,
                        booking.status === 'cancelled' && styles.cancelledText,
                        booking.status === 'in_progress' && styles.inProgressText
                      ]}
                    >
                      {booking.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/needservice')}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#0d9488', '#14b8a6']} style={styles.fabGradient}>
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
    borderRadius: 30,
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
    minHeight: 60,
    textAlignVertical: 'top',
    paddingVertical: 8,
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
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 64) / 4,
    alignItems: 'center',
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
    width: '100%',
    height: 100,
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featuredInfo: {
    width: '100%',
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
  cancelledStatus: {
    backgroundColor: '#fee2e2',
  },
  cancelledText: {
    color: '#991b1b',
  },
  inProgressStatus: {
    backgroundColor: '#dbeafe',
  },
  inProgressText: {
    color: '#1e40af',
  },
  noDataCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noBookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
  bookNowButton: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  bookNowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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