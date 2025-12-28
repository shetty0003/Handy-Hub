// app/(tabs)/profile.tsx - Client Profile
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { getUserProfile } from '../../utils/profileHelper';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import ActivityIndicator separately to avoid casting issues
import { ActivityIndicator } from 'react-native';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  action: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
}

export default function ClientProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    bookings: 0,
    favorites: 0,
    memberSince: 'Recently'
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setRefreshing(true);
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (!authUser) {
        console.log('No authenticated user');
        router.replace('/auth/login');
        return;
      }

      const profile = await getUserProfile(authUser.id);
      if (!profile) {
        console.log('No profile found');
        setUser({ full_name: 'User', email: authUser.email });
      } else {
        setUser(profile);
      }

      // Load profile image safely
      try {
        const { data: imageData, error: imageError } = await supabase.storage
          .from('avatars')
          .createSignedUrl(`public/${authUser.id}`, 60);
        
        if (!imageError && imageData) {
          setProfileImage(imageData.signedUrl);
        }
      } catch (imageError) {
        console.log('No profile image found:', imageError);
      }

      // Load user stats
      await loadUserStats(authUser.id);
    } catch (error) {
      console.error('Profile load error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      // Load booking count
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', userId)
        .eq('status', 'completed');

      if (bookingsError) {
        console.error('Bookings count error:', bookingsError);
      }

      // Load favorites count
      const { count: favoritesCount, error: favoritesError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (favoritesError) {
        console.error('Favorites count error:', favoritesError);
      }

      // Calculate member since
      let memberSince = 'Recently';
      if (user?.created_at) {
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const diffInMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + 
                           (now.getMonth() - createdDate.getMonth());
        
        if (diffInMonths < 1) memberSince = 'New';
        else if (diffInMonths < 12) memberSince = `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
        else {
          const years = Math.floor(diffInMonths / 12);
          memberSince = `${years} year${years > 1 ? 's' : ''}`;
        }
      }

      setStats({
        bookings: bookingsCount || 0,
        favorites: favoritesCount || 0,
        memberSince
      });
    } catch (error) {
      console.error('Stats load error:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              router.replace('/auth/login');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const accountMenuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'person-outline',
      subtitle: 'Update your information',
      action: handleEditProfile,
      showArrow: true,
    },
    {
      id: '2',
      title: 'Addresses',
      icon: 'location-outline',
      subtitle: 'Manage saved addresses',
      action: () => router.push('/'),
      showArrow: true,
    },
    {
      id: '3',
      title: 'Payment Methods',
      icon: 'card-outline',
      subtitle: 'Cards & payment options',
      action: () => router.push('/'),
      showArrow: true,
    },
    {
      id: '4',
      title: 'Favorites',
      icon: 'heart-outline',
      subtitle: 'Saved service providers',
      action: () => router.push('/'),
      showArrow: true,
    },
  ];

  const activityMenuItems: MenuItem[] = [
    {
      id: '5',
      title: 'Booking History',
      icon: 'time-outline',
      subtitle: 'View past bookings',
      action: () => router.push('/'),
      showArrow: true,
    },
    {
      id: '6',
      title: 'Reviews',
      icon: 'star-outline',
      subtitle: 'Your reviews & ratings',
      action: () => router.push('/'),
      showArrow: true,
    },
    {
      id: '7',
      title: 'Receipts',
      icon: 'receipt-outline',
      subtitle: 'Download receipts',
      action: () => router.push('/'),
      showArrow: true,
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      id: '8',
      title: 'Notifications',
      icon: 'notifications-outline',
      subtitle: 'Booking & service updates',
      action: () => setNotificationsEnabled(!notificationsEnabled),
      showSwitch: true,
      switchValue: notificationsEnabled,
    },
    {
      id: '9',
      title: 'Location Services',
      icon: 'navigate-outline',
      subtitle: 'Find providers near you',
      action: () => setLocationEnabled(!locationEnabled),
      showSwitch: true,
      switchValue: locationEnabled,
    },
    {
      id: '10',
      title: 'Privacy & Security',
      icon: 'shield-outline',
      subtitle: 'Manage your privacy',
      action: () => router.push('/'),
      showArrow: true,
    },
    {
      id: '11',
      title: 'Language',
      icon: 'language-outline',
      subtitle: 'English',
      action: () => router.push('/'),
      showArrow: true,
    },
  ];

  const supportMenuItems: MenuItem[] = [
    {
      id: '12',
      title: 'Help Center',
      icon: 'help-circle-outline',
      subtitle: 'FAQs & support',
      action: () => router.push('/'),
      showArrow: true,
    },
    {
      id: '13',
      title: 'Contact Support',
      icon: 'chatbubbles-outline',
      subtitle: 'Get help from our team',
      action: () => router.push('/'),
      showArrow: true,
    },
    {
      id: '14',
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      action: () => router.push('/'),
      showArrow: true,
    },
    {
      id: '15',
      title: 'Privacy Policy',
      icon: 'lock-closed-outline',
      action: () => router.push('/'),
      showArrow: true,
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.action}
      activeOpacity={0.7}
      disabled={loading}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={item.icon} size={22} color="#0d9488" />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      {item.showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      )}
      {item.showSwitch && (
        <Switch
          value={item.switchValue}
          onValueChange={item.action}
          trackColor={{ false: '#cbd5e1', true: '#0d9488' }}
          thumbColor="white"
          disabled={loading}
        />
      )}
    </TouchableOpacity>
  );

  const handleBookService = () => {
    router.push('/services');
  };

  const handleViewHistory = () => {
    router.push('/');
  };

  const handleViewPayments = () => {
    router.push('/');
  };

  // Loading component to avoid issues
  const LoadingSpinner = () => (
    <View style={styles.loadingSpinner}>
      <ActivityIndicator size="large" color="#0d9488" />
    </View>
  );

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notification')}
              disabled={loading}
            >
              <Ionicons name="notifications-outline" size={24} color="#0d9488" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#14b8a6', '#0d9488']}
              style={styles.profileGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profileHeader}>
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileAvatarImage}
                  />
                ) : (
                  <View style={styles.profileAvatar}>
                    <Ionicons name="person" size={48} color="white" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editAvatarButton}
                  onPress={handleEditProfile}
                  disabled={loading}
                >
                  <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>

              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.bookings}</Text>
                  <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.favorites}</Text>
                  <Text style={styles.statLabel}>Favorites</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.memberSince}</Text>
                  <Text style={styles.statLabel}>Member</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={handleEditProfile}
                disabled={loading}
              >
                <Text style={styles.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleBookService}
              disabled={loading}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#f0fdfa' }]}>
                <Ionicons name="add-circle" size={28} color="#0d9488" />
              </View>
              <Text style={styles.quickActionText}>Book Service</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleViewHistory}
              disabled={loading}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="time" size={28} color="#3b82f6" />
              </View>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={handleViewPayments}
              disabled={loading}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#f0fdf9' }]}>
                <Ionicons name="wallet" size={28} color="#10b981" />
              </View>
              <Text style={styles.quickActionText}>Payments</Text>
            </TouchableOpacity>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuContainer}>
              {accountMenuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Activity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.menuContainer}>
              {activityMenuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.menuContainer}>
              {settingsMenuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.menuContainer}>
              {supportMenuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.logoutLoading}>
                <LoadingSpinner />
              </View>
            ) : (
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            )}
            <Text style={styles.logoutText}>
              {loading ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>Customer Dashboard v1.0.0</Text>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
  },
  loadingSpinner: {
    marginVertical: 10,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
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
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editProfileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editProfileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d9488',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutLoading: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});