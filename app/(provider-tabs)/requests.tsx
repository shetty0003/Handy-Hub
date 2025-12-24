// app/(provider-tabs)/requests.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Request {
  id: string;
  title: string;
  client: string;
  clientRating: number;
  location: string;
  date: string;
  time: string;
  distance: string;
  price: string;
  description: string;
  status: 'new' | 'accepted' | 'ongoing' | 'completed';
  urgent: boolean;
  category: string;
}

const allRequests: Request[] = [
  {
    id: '1',
    title: 'Fix Kitchen Sink Leak',
    client: 'Sarah Johnson',
    clientRating: 4.8,
    location: '123 Main St, Apartment 4B',
    date: 'Today',
    time: '2:00 PM',
    distance: '2.5 km',
    price: '$75',
    description: 'Kitchen sink has been leaking for 2 days. Need urgent repair.',
    status: 'new',
    urgent: true,
    category: 'Plumbing'
  },
  {
    id: '2',
    title: 'Bathroom Pipe Installation',
    client: 'Mike Brown',
    clientRating: 4.9,
    location: '456 Oak Avenue',
    date: 'Today',
    time: '4:30 PM',
    distance: '3.8 km',
    price: '$120',
    description: 'Need to install new pipes in the bathroom. Materials provided.',
    status: 'accepted',
    urgent: false,
    category: 'Plumbing'
  },
  {
    id: '3',
    title: 'Water Heater Repair',
    client: 'Emily Davis',
    clientRating: 5.0,
    location: '789 Pine Road',
    date: 'Tomorrow',
    time: '10:00 AM',
    distance: '1.2 km',
    price: '$200',
    description: 'Water heater not heating properly. Seems like thermostat issue.',
    status: 'ongoing',
    urgent: false,
    category: 'Plumbing'
  },
  {
    id: '4',
    title: 'Drain Cleaning Service',
    client: 'David Wilson',
    clientRating: 4.6,
    location: '321 Elm Street',
    date: 'Dec 22',
    time: '3:00 PM',
    distance: '5.1 km',
    price: '$90',
    description: 'Main drain clogged. Need professional cleaning.',
    status: 'completed',
    urgent: false,
    category: 'Plumbing'
  },
];

const tabs = ['All', 'New', 'Accepted', 'Ongoing', 'Completed'];

export default function ProviderRequestsScreen() {
  const [selectedTab, setSelectedTab] = useState('All');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'ongoing': return '#8b5cf6';
      case 'completed': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'new': return '#fef3c7';
      case 'accepted': return '#dbeafe';
      case 'ongoing': return '#ede9fe';
      case 'completed': return '#d1fae5';
      default: return '#f1f5f9';
    }
  };

  const filteredRequests = selectedTab === 'All' 
    ? allRequests 
    : allRequests.filter(req => req.status === selectedTab.toLowerCase());

  const handleRequestPress = (requestId: string) => {
    console.log('Request pressed:', requestId);
  };

  const handleAccept = (requestId: string) => {
    console.log('Accept request:', requestId);
  };

  const handleDecline = (requestId: string) => {
    console.log('Decline request:', requestId);
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5']}
      style={styles.container}
    >
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
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No requests found</Text>
              <Text style={styles.emptySubtext}>New requests will appear here</Text>
            </View>
          ) : (
            filteredRequests.map((request) => (
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
                        <Text style={styles.ratingText}>{request.clientRating}</Text>
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

                <View style={styles.requestFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Job Price</Text>
                    <Text style={styles.priceValue}>{request.price}</Text>
                  </View>

                  {request.status === 'new' && (
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
                  )}
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
    top: 50,
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
    height: 20,
  },
});