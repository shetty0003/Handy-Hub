// app/(provider-tabs)/index.tsx - Provider Dashboard/Home
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface JobRequest {
  id: string;
  title: string;
  client: string;
  location: string;
  time: string;
  price: string;
  distance: string;
  urgent: boolean;
}

const jobRequests: JobRequest[] = [
  { 
    id: '1', 
    title: 'Fix Kitchen Sink', 
    client: 'Sarah Johnson', 
    location: '123 Main St', 
    time: '2:00 PM Today',
    price: '$75',
    distance: '2.5 km',
    urgent: true
  },
  { 
    id: '2', 
    title: 'Bathroom Plumbing', 
    client: 'Mike Brown', 
    location: '456 Oak Ave', 
    time: '4:30 PM Today',
    price: '$120',
    distance: '3.8 km',
    urgent: false
  },
  { 
    id: '3', 
    title: 'Water Heater Repair', 
    client: 'Emily Davis', 
    location: '789 Pine Rd', 
    time: '10:00 AM Tomorrow',
    price: '$200',
    distance: '1.2 km',
    urgent: false
  },
];

export default function ProviderDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);

  const handleJobPress = (jobId: string) => {
    console.log('Job pressed:', jobId);
  };

  const handleAcceptJob = (jobId: string) => {
    console.log('Accept job:', jobId);
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
              <Text style={styles.greeting}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Ready to work today?</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
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
                  onValueChange={setIsAvailable}
                  trackColor={{ false: '#cbd5e1', true: 'rgba(255,255,255,0.3)' }}
                  thumbColor="white"
                />
              </View>
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="briefcase" size={28} color="#3b82f6" />
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Active Jobs</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="cash" size={28} color="#10b981" />
              <Text style={styles.statValue}>$1.2k</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="star" size={28} color="#f59e0b" />
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="trending-up" size={28} color="#8b5cf6" />
              <Text style={styles.statValue}>127</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          {/* New Job Requests */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Requests</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {jobRequests.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => handleJobPress(job.id)}
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
                  <Text style={styles.jobPrice}>{job.price}</Text>
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
                    onPress={(e) => {
                      e.stopPropagation();
                      console.log('Decline:', job.id);
                    }}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={(e) => {
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

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionCard}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="calendar-outline" size={24} color="#0d9488" />
                </View>
                <Text style={styles.quickActionText}>My Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="wallet-outline" size={24} color="#0d9488" />
                </View>
                <Text style={styles.quickActionText}>Earnings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="chatbubbles-outline" size={24} color="#0d9488" />
                </View>
                <Text style={styles.quickActionText}>Messages</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name="settings-outline" size={24} color="#0d9488" />
                </View>
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

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
    borderWidth: 2,
    borderColor: '#d4af37',
  },
  availabilityGradient: {
    padding: 20,
  },
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
  availabilityText: {
    marginLeft: 12,
    flex: 1,
  },
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
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
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
    top: 50,
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
  jobInfo: {
    flex: 1,
  },
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
  jobDetails: {
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
  bottomSpacing: {
    height: 100,
  },
});