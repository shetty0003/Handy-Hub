// app/(tabs)/jobs.tsx - Client Jobs/Bookings Screen
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
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Booking {
  id: string;
  title: string;
  service: string;
  provider: string;
  providerRating: number;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  price: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const tabs = ['All', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'];

export default function ClientJobsScreen() {
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            title,
            service_type,
            date,
            time,
            location,
            status,
            price,
            providers (
              profiles (
                full_name
              ),
              rating
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching bookings:', error);
        } else {
          const formattedBookings = data.map((b: any) => ({
            id: b.id,
            title: b.title,
            service: b.service_type,
            provider: b.providers.profiles.full_name,
            providerRating: b.providers.rating,
            date: new Date(b.date).toLocaleDateString(),
            time: b.time,
            location: b.location,
            status: b.status,
            price: `$${b.price}`,
            icon: 'hammer', // Placeholder
            iconColor: '#8b5cf6', // Placeholder
          }));
          setBookingsData(formattedBookings as any) ;
        }
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'in-progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'upcoming': return '#dbeafe';
      case 'in-progress': return '#ede9fe';
      case 'completed': return '#d1fae5';
      case 'cancelled': return '#fee2e2';
      default: return '#f1f5f9';
    }
  };

  const getStatusText = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredBookings = selectedTab === 'All' 
    ? bookingsData 
    : bookingsData.filter(booking => getStatusText(booking.status) === selectedTab);

  const handleBookingPress = (bookingId: string) => {
    console.log('Booking pressed:', bookingId);
    // Navigate to booking details
  };

  const handleActionPress = (bookingId: string, action: string) => {
    console.log(`Action ${action} for booking:`, bookingId);
    // Handle booking actions
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="calendar-outline" size={24} color="#0d9488" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statsContainer}
            contentContainerStyle={styles.statsContent}
          >
            <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="calendar" size={24} color="#3b82f6" />
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="time" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statValue}>20</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="cash" size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>$2.4k</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </ScrollView>

          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selectedTab === tab && styles.tabActive
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bookings List */}
          {loading ? (
            <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 50 }} />
          ) : filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No bookings found</Text>
              <Text style={styles.emptySubtext}>Book a service to get started</Text>
            </View>
          ) : (
            filteredBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => handleBookingPress(booking.id)}
                activeOpacity={0.7}
              >
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingHeaderLeft}>
                    <View style={[styles.serviceIcon, { backgroundColor: `${booking.iconColor}15` }]}>
                      <Ionicons name={booking.icon} size={24} color={booking.iconColor} />
                    </View>
                    <View style={styles.bookingHeaderInfo}>
                      <Text style={styles.bookingTitle}>{booking.title}</Text>
                      <Text style={styles.serviceType}>{booking.service}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBackground(booking.status) }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(booking.status) }
                    ]}>
                      {getStatusText(booking.status)}
                    </Text>
                  </View>
                </View>

                {/* Provider Info */}
                <View style={styles.providerSection}>
                  <View style={styles.providerAvatar}>
                    <Ionicons name="person" size={20} color="#0d9488" />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{booking.provider}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingText}>{booking.providerRating.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#64748b" />
                    <Text style={styles.detailText}>{booking.date}, {booking.time}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={16} color="#64748b" />
                    <Text style={styles.detailText}>{booking.location}</Text>
                  </View>
                </View>

                <View style={styles.bookingFooter}>
                  <Text style={styles.bookingPrice}>{booking.price}</Text>
                  <View style={styles.bookingActions}>
                    {booking.status === 'upcoming' && (
                      <>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.cancelButton]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleActionPress(booking.id, 'cancel');
                          }}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.rescheduleButton]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleActionPress(booking.id, 'reschedule');
                          }}
                        >
                          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {booking.status === 'in-progress' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.trackButton]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleActionPress(booking.id, 'track');
                        }}
                      >
                        <Ionicons name="navigate" size={16} color="white" />
                        <Text style={styles.trackButtonText}>Track</Text>
                      </TouchableOpacity>
                    )}
                    {booking.status === 'completed' && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.reviewButton]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleActionPress(booking.id, 'review');
                        }}
                      >
                        <Ionicons name="star-outline" size={16} color="#0d9488" />
                        <Text style={styles.reviewButtonText}>Review</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  filterButton: {
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
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    marginBottom: 16,
    maxHeight: 120,
  },
  statsContent: {
    paddingHorizontal: 20,
  },
  statCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  tabsContainer: {
    marginBottom: 16,
    marginTop: 8,
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 20,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: 'white',
  },
  bookingCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingHeaderInfo: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  bookingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rescheduleButton: {
    backgroundColor: '#0d9488',
  },
  rescheduleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#8b5cf6',
  },
  trackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#0d9488',
  },
  reviewButtonText: {
    color: '#0d9488',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
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