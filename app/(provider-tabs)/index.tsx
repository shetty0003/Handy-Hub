import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { acceptJobRequest, getJobRequests, getUserProfile, updateProviderAvailability } from '../../utils/profileHelper';
import { supabase } from '../../utils/supabase';

const { width } = Dimensions.get('window');

interface JobRequest {
  id: string;
  title: string;
  client: string;
  location: string;
  time: string;
  price: number;
  distance: string;
  urgent: boolean;
  status: string;
}

interface DashboardStats {
  activeJobs: number;
  weeklyEarnings: number;
  rating: number;
  completedJobs: number;
  pendingRequests: number;
  availableBalance: number;
}

export default function ProviderDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    weeklyEarnings: 0,
    rating: 4.5,
    completedJobs: 0,
    pendingRequests: 0,
    availableBalance: 0
  });
  const [providerName, setProviderName] = useState<string>('Provider');
  const [providerId, setProviderId] = useState<string>('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      setProviderId(user.id);

      // Load provider data
      const { profile, provider } = await getUserProfile(user.id);
      
      if (profile) {
        setProviderName(provider?.business_name || profile.full_name || 'Provider');
      }
      
      if (provider) {
        setStats({
          activeJobs: provider.active_jobs || 0,
          weeklyEarnings: provider.weekly_earnings || 0,
          rating: provider.rating || 4.5,
          completedJobs: provider.completed_jobs || 0,
          pendingRequests: 0, // Will be updated below
          availableBalance: provider.available_balance || 0
        });
        
        setIsAvailable(provider.is_available || true);
      }

      // Load pending job requests
      const { data: requests } = await getJobRequests();
      
      if (requests) {
        // Filter pending requests and limit to 3
        const pendingRequests = requests
          .filter(req => req.status === 'pending')
          .slice(0, 3);
        
        const formattedRequests: JobRequest[] = pendingRequests.map(request => ({
          id: request.id,
          title: request.title || 'Service Request',
          client: request.profiles?.full_name || 'Client',
          location: request.location || 'Not specified',
          time: request.preferred_time || 'Flexible',
          price: request.estimated_price || 0,
          distance: `${Math.floor(Math.random() * 10) + 1} km`,
          urgent: request.priority === 'urgent',
          status: request.status
        }));
        
        setJobRequests(formattedRequests);
        setStats(prev => ({ ...prev, pendingRequests: formattedRequests.length }));
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleAvailability = async (value: boolean) => {
    try {
      setIsAvailable(value);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await updateProviderAvailability(user.id, value);

      if (error) throw error;

      Alert.alert(
        value ? 'Available for Jobs' : 'Unavailable',
        value 
          ? 'You are now available to receive job requests!'
          : 'You will not receive new job requests.'
      );
    } catch (error) {
      console.error('Toggle availability error:', error);
      setIsAvailable(!value);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      Alert.alert(
        'Accept Job',
        'Are you sure you want to accept this job?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            style: 'default',
            onPress: async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await acceptJobRequest(jobId, user.id);

              if (error) throw error;

              Alert.alert('Success', 'Job accepted successfully!');
              fetchDashboardData();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Accept job error:', error);
      Alert.alert('Error', 'Failed to accept job');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscription for job requests
    const channel = supabase
      .channel('job-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_requests'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0d9488']}
              tintColor="#0d9488"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome Back!</Text>
              <Text style={styles.subtitle}>{providerName}</Text>
            </View>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notification')}
            >
              <Ionicons name="notifications-outline" size={24} color="#0d9488" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          {/* Availability Toggle */}
          <View style={styles.availabilityCard}>
            <LinearGradient
              colors={isAvailable ? ['#14b8a6', '#0d9488'] : ['#94a3b8', '#64748b']}
              style={styles.availabilityGradient}
            >
              <View style={styles.availabilityContent}>
                <View style={styles.availabilityLeft}>
                  <Ionicons 
                    name={isAvailable ? 'checkmark-circle' : 'close-circle'} 
                    size={32} 
                    color="white" 
                  />
                  <View style={styles.availabilityText}>
                    <Text style={styles.availabilityTitle}>
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </Text>
                    <Text style={styles.availabilitySubtitle}>
                      {isAvailable ? 'You can receive job requests' : 'You won\'t receive requests'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isAvailable}
                  onValueChange={handleToggleAvailability}
                  trackColor={{ false: '#cbd5e1', true: 'rgba(255,255,255,0.3)' }}
                  thumbColor="white"
                />
              </View>
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d9488" />
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.statCard, { backgroundColor: '#dbeafe' }]}
                  onPress={() => router.push('/(provider-tabs)/requests?status=accepted')}
                >
                  <Ionicons name="briefcase" size={28} color="#3b82f6" />
                  <Text style={styles.statValue}>{stats.activeJobs}</Text>
                  <Text style={styles.statLabel}>Active Jobs</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statCard, { backgroundColor: '#d1fae5' }]}
                  onPress={() => router.push('/(provider-tabs)/earnings')}
                >
                  <Ionicons name="cash" size={28} color="#10b981" />
                  <Text style={styles.statValue}>${stats.weeklyEarnings}</Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </TouchableOpacity>
                
                <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="star" size={28} color="#f59e0b" />
                  <Text style={styles.statValue}>{stats.rating.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.statCard, { backgroundColor: '#ede9fe' }]}
                  onPress={() => router.push('/(provider-tabs)/requests')}
                >
                  <Ionicons name="time-outline" size={28} color="#8b5cf6" />
                  <Text style={styles.statValue}>{stats.pendingRequests}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Balance Card */}
          {!loading && stats.availableBalance > 0 && (
            <TouchableOpacity 
              style={styles.balanceCard}
              onPress={() => router.push('/(provider-tabs)/earnings')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#14b8a6', '#0d9488', '#0f766e']}
                style={styles.balanceGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.balanceContent}>
                  <View>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceAmount}>${stats.availableBalance.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.withdrawButton}
                    onPress={() => router.push('/(provider-tabs)/earnings?action=withdraw')}
                  >
                    <Text style={styles.withdrawText}>Withdraw</Text>
                    <Ionicons name="arrow-forward" size={16} color="#0d9488" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* New Job Requests */}
          {jobRequests.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>New Requests</Text>
                <TouchableOpacity onPress={() => router.push('/(provider-tabs)/requests')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {jobRequests.map((job: JobRequest) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() => router.push(`/provider/job/${job.id}`)}
                  activeOpacity={0.7}
                >
                  {job.urgent && (
                    <View style={styles.urgentBadge}>
                      <Ionicons name="flash" size={12} color="white" />
                      <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                  )}
                  
                  <View style={styles.jobHeader}>
                    <View style={styles.jobHeaderLeft}>
                      <View style={styles.clientAvatar}>
                        <Ionicons name="person" size={24} color="#0d9488" />
                      </View>
                      <View style={styles.jobInfo}>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <Text style={styles.clientName}>{job.client}</Text>
                      </View>
                    </View>
                    <Text style={styles.jobPrice}>${job.price.toFixed(2)}</Text>
                  </View>

                  <View style={styles.jobDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={16} color="#64748b" />
                      <Text style={styles.detailText}>{job.time}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="location-outline" size={16} color="#64748b" />
                      <Text style={styles.detailText}>{job.location}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="navigate-outline" size={16} color="#64748b" />
                      <Text style={styles.detailText}>{job.distance} away</Text>
                    </View>
                  </View>

                  <View style={styles.jobActions}>
                    <TouchableOpacity 
                      style={styles.declineButton}
                      onPress={(e: any) => {
                        e.stopPropagation();
                        Alert.alert('Decline', 'This feature is coming soon!');
                      }}
                    >
                      <Text style={styles.declineText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.acceptButton}
                      onPress={(e: any) => {
                        e.stopPropagation();
                        handleAcceptJob(job.id);
                      }}
                    >
                      <LinearGradient
                        colors={['#14b8a6', '#0d9488']}
                        style={styles.acceptGradient}
                      >
                        <Text style={styles.acceptText}>Accept Job</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/provider/schedule')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="calendar-outline" size={24} color="#0d9488" />
                </View>
                <Text style={styles.quickActionText}>My Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/(provider-tabs)/earnings')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="wallet-outline" size={24} color="#0d9488" />
                </View>
                <Text style={styles.quickActionText}>Earnings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/provider/messages')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="chatbubbles-outline" size={24} color="#0d9488" />
                </View>
                <Text style={styles.quickActionText}>Messages</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => router.push('/provider/profile')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="settings-outline" size={24} color="#0d9488" />
                </View>
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {jobRequests.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No Job Requests</Text>
              <Text style={styles.emptySubtext}>
                {isAvailable 
                  ? 'Check back soon for new requests!'
                  : 'Turn on availability to receive requests'
                }
              </Text>
              {!isAvailable && (
                <TouchableOpacity 
                  style={styles.enableButton}
                  onPress={() => handleToggleAvailability(true)}
                >
                  <Text style={styles.enableButtonText}>Become Available</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.bottomSpacing} />
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
  notificationButton: {
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
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  availabilityCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  availabilityGradient: { padding: 20 },
  availabilityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  availabilityText: { marginLeft: 12, flex: 1 },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  availabilitySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  loadingContainer: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceGradient: {
    padding: 20,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  withdrawText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d9488',
  },
  section: { marginBottom: 24 },
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
  jobCard: {
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
    position: 'relative',
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  jobInfo: { flex: 1 },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    color: '#64748b',
  },
  jobPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  jobDetails: { marginBottom: 16 },
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
  jobActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  declineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  acceptButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    margin: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    textAlign: 'center',
  },
  enableButton: {
    marginTop: 20,
    backgroundColor: '#0d9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enableButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: { height: 100 },
});