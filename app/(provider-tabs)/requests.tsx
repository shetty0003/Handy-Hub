// app/(provider-tabs)/requests.tsx - Updated version
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
import { getJobRequestsWithService } from '../../utils/profileHelper';
import { supabase } from '../../utils/supabase';

interface JobRequest {
  id: string;
  title: string;
  client: string;
  clientRating: number;
  location: string;
  date: string;
  time: string;
  distance: string;
  price: number;
  description: string;
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled' | 'declined';
  urgent: boolean;
  category: string;
  client_id: string;
  service_id?: string;
  service_title?: string;
  service_category?: string;
}

const tabs = ['All', 'Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled'];

export default function ProviderRequestsScreen() {
  const [selectedTab, setSelectedTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<JobRequest[]>([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await getJobRequestsWithService(user.id, selectedTab);

      if (error) throw error;

      const formattedRequests: JobRequest[] = (data || []).map(request => {
        const service = request.services as any;
        return {
          id: request.id,
          title: request.title || service?.title || 'Service Request',
          client: request.profiles?.full_name || 'Client',
          clientRating: 4.8,
          location: request.location || 'Not specified',
          date: new Date(request.preferred_date || request.created_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          time: request.preferred_time || 'Flexible',
          distance: `${Math.floor(Math.random() * 10) + 1} km`,
          price: request.estimated_price || service?.price || 0,
          description: request.description || 'No description provided',
          status: request.status as any,
          urgent: request.priority === 'urgent',
          category: service?.category || request.category || 'General',
          client_id: request.client_id,
          service_id: request.service_id,
          service_title: service?.title,
          service_category: service?.category
        };
      });

      setRequests(formattedRequests);

    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to load job requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedTab]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'ongoing': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'declined': return '#64748b';
      default: return '#64748b';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'pending': return '#fef3c7';
      case 'accepted': return '#dbeafe';
      case 'ongoing': return '#ede9fe';
      case 'completed': return '#d1fae5';
      case 'cancelled': return '#fee2e2';
      case 'declined': return '#f1f5f9';
      default: return '#f1f5f9';
    }
  };

  const handleRequestPress = (requestId: string) => {
    router.push(`/provider/job/${requestId}`);
  };

  const handleAccept = async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      Alert.alert(
        'Accept Job',
        'Are you sure you want to accept this job?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            style: 'default',
            onPress: async () => {
              const { error } = await supabase
                .from('job_requests')
                .update({ 
                  status: 'accepted',
                  provider_id: user.id,
                  accepted_at: new Date().toISOString()
                })
                .eq('id', requestId);

              if (error) throw error;

              Alert.alert('Success', 'Job accepted successfully!');
              fetchRequests();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Accept job error:', error);
      Alert.alert('Error', 'Failed to accept job');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      Alert.alert(
        'Decline Job',
        'Are you sure you want to decline this job?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Decline',
            style: 'destructive',
            onPress: async () => {
              const { error } = await supabase
                .from('job_requests')
                .update({ 
                  status: 'declined',
                  updated_at: new Date().toISOString()
                })
                .eq('id', requestId);

              if (error) throw error;

              Alert.alert('Success', 'Job declined');
              fetchRequests();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Decline job error:', error);
      Alert.alert('Error', 'Failed to decline job');
    }
  };

  const handleStartJob = async (requestId: string) => {
    try {
      Alert.alert(
        'Start Job',
        'Mark this job as started?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start',
            style: 'default',
            onPress: async () => {
              const { error } = await supabase
                .from('job_requests')
                .update({ 
                  status: 'ongoing',
                  started_at: new Date().toISOString()
                })
                .eq('id', requestId);

              if (error) throw error;

              Alert.alert('Success', 'Job marked as started');
              fetchRequests();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Start job error:', error);
      Alert.alert('Error', 'Failed to start job');
    }
  };

  const handleCompleteJob = async (requestId: string) => {
    try {
      Alert.alert(
        'Complete Job',
        'Mark this job as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            style: 'default',
            onPress: async () => {
              const { error } = await supabase
                .from('job_requests')
                .update({ 
                  status: 'completed',
                  completed_at: new Date().toISOString()
                })
                .eq('id', requestId);

              if (error) throw error;

              Alert.alert('Success', 'Job marked as completed');
              fetchRequests();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Complete job error:', error);
      Alert.alert('Error', 'Failed to complete job');
    }
  };

  const renderActionButtons = (request: JobRequest) => {
    switch (request.status) {
      case 'pending':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDecline(request.id);
              }}
            >
              <Ionicons name="close" size={18} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={(e) => {
                e.stopPropagation();
                handleAccept(request.id);
              }}
            >
              <LinearGradient
                colors={['#14b8a6', '#0d9488']}
                style={styles.acceptGradient}
              >
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.acceptText}>Accept</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
      case 'accepted':
        return (
          <TouchableOpacity
            style={styles.startButton}
            onPress={(e) => {
              e.stopPropagation();
              handleStartJob(request.id);
            }}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.startGradient}
            >
              <Ionicons name="play" size={18} color="white" />
              <Text style={styles.startText}>Start Job</Text>
            </LinearGradient>
          </TouchableOpacity>
        );
      case 'ongoing':
        return (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleCompleteJob(request.id);
            }}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.completeGradient}
            >
              <Ionicons name="checkmark-circle" size={18} color="white" />
              <Text style={styles.completeText}>Complete</Text>
            </LinearGradient>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#f0fdfa', '#ecfdf5']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d9488" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f0fdfa', '#ecfdf5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Job Requests</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#0d9488" />
          </TouchableOpacity>
        </View>

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

        {/* Requests List */}
        <ScrollView 
          style={styles.requestsList}
          showsVerticalScrollIndicator={false}
        >
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No requests found</Text>
              <Text style={styles.emptySubtext}>
                {selectedTab === 'Pending' 
                  ? 'New requests will appear here' 
                  : `No ${selectedTab.toLowerCase()} jobs`
                }
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                onPress={() => handleRequestPress(request.id)}
                activeOpacity={0.7}
              >
                {request.urgent && (
                  <View style={styles.urgentBadge}>
                    <Ionicons name="flash" size={12} color="white" />
                    <Text style={styles.urgentText}>Urgent</Text>
                  </View>
                )}

                <View style={styles.requestHeader}>
                  <View style={styles.clientInfo}>
                    <View style={styles.clientAvatar}>
                      <Ionicons name="person" size={28} color="#0d9488" />
                    </View>
                    <View style={styles.clientDetails}>
                      <Text style={styles.clientName}>{request.client}</Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#f59e0b" />
                        <Text style={styles.ratingText}>{request.clientRating.toFixed(1)}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBackground(request.status) }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(request.status) }
                    ]}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestBody}>
                  <Text style={styles.requestTitle}>{request.title}</Text>
                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.description}
                  </Text>

                  <View style={styles.requestDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={16} color="#64748b" />
                      <Text style={styles.detailText}>{request.date}, {request.time}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="location-outline" size={16} color="#64748b" />
                      <Text style={styles.detailText}>{request.distance} away</Text>
                    </View>
                  </View>

                  <View style={styles.locationRow}>
                    <Ionicons name="navigate-outline" size={16} color="#64748b" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {request.location}
                    </Text>
                  </View>
                </View>
                {request.service_title && (
    <View style={styles.serviceInfo}>
      <Ionicons name="construct-outline" size={14} color="#0d9488" />
      <Text style={styles.serviceText}>
        Service: {request.service_title} {request.service_category ? `(${request.service_category})` : ''}
      </Text>
    </View>
  )}

                <View style={styles.requestFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Job Price</Text>
                    <Text style={styles.priceValue}>${request.price.toFixed(2)}</Text>
                  </View>
                  {renderActionButtons(request)}
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
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
  tabsContainer: {
    marginBottom: 16,
    marginTop: 12,
    marginHorizontal: 8,
    minHeight: 10,
    maxHeight: 40
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
  requestsList: {
    flex: 1,
  },
  requestCard: {
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
    zIndex: 1,
  },
  urgentText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
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
  requestBody: {
    marginBottom: 16,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  requestDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  requestDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  declineButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  acceptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  startButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  startText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  completeButton: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  completeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    backgroundColor: '#f0fdfa',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  serviceText: {
    fontSize: 12,
    color: '#0d9488',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});