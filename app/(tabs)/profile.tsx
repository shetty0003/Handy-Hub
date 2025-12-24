// app/(tabs)/profile.tsx - Client Profile
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { getUserProfile } from '../../utils/profileHelper';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        setUser(profile);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace('/auth/login');
    setLoading(false);
  };

  const accountMenuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'person-outline',
      subtitle: 'Update your information',
      action: () => console.log('Edit Profile'),
      showArrow: true,
    },
    {
      id: '2',
      title: 'Addresses',
      icon: 'location-outline',
      subtitle: 'Manage saved addresses',
      action: () => console.log('Addresses'),
      showArrow: true,
    },
    {
      id: '3',
      title: 'Payment Methods',
      icon: 'card-outline',
      subtitle: 'Cards & payment options',
      action: () => console.log('Payment Methods'),
      showArrow: true,
    },
    {
      id: '4',
      title: 'Favorites',
      icon: 'heart-outline',
      subtitle: 'Saved service providers',
      action: () => console.log('Favorites'),
      showArrow: true,
    },
  ];

  const activityMenuItems: MenuItem[] = [
    {
      id: '5',
      title: 'Booking History',
      icon: 'time-outline',
      subtitle: 'View past bookings',
      action: () => console.log('History'),
      showArrow: true,
    },
    {
      id: '6',
      title: 'Reviews',
      icon: 'star-outline',
      subtitle: 'Your reviews & ratings',
      action: () => console.log('Reviews'),
      showArrow: true,
    },
    {
      id: '7',
      title: 'Receipts',
      icon: 'receipt-outline',
      subtitle: 'Download receipts',
      action: () => console.log('Receipts'),
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
      action: () => console.log('Privacy'),
      showArrow: true,
    },
    {
      id: '11',
      title: 'Language',
      icon: 'language-outline',
      subtitle: 'English',
      action: () => console.log('Language'),
      showArrow: true,
    },
  ];

  const supportMenuItems: MenuItem[] = [
    {
      id: '12',
      title: 'Help Center',
      icon: 'help-circle-outline',
      subtitle: 'FAQs & support',
      action: () => console.log('Help Center'),
      showArrow: true,
    },
    {
      id: '13',
      title: 'Contact Support',
      icon: 'chatbubbles-outline',
      subtitle: 'Get help from our team',
      action: () => console.log('Support'),
      showArrow: true,
    },
    {
      id: '14',
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      action: () => console.log('Terms'),
      showArrow: true,
    },
    {
      id: '15',
      title: 'Privacy Policy',
      icon: 'lock-closed-outline',
      action: () => console.log('Privacy Policy'),
      showArrow: true,
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.action}
      activeOpacity={0.7}
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
        />
      )}
    </TouchableOpacity>
  );

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
            >
              <Ionicons name="notifications-outline" size={24} color="#0d9488" />
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          {loading ? (
            <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['#14b8a6', '#0d9488']}
                style={styles.profileGradient}
              >
                <View style={styles.profileAvatar}>
                  <Ionicons name="person" size={48} color="white" />
                  <TouchableOpacity style={styles.editAvatarButton}>
                    <Ionicons name="camera" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.profileName}>{user?.full_name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || ''}</Text>

                <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>24</Text>
                  <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Favorites</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>2 yrs</Text>
                  <Text style={styles.statLabel}>Member</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle" size={28} color="#0d9488" />
              </View>
              <Text style={styles.quickActionText}>Book Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="time" size={28} color="#3b82f6" />
              </View>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
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
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>Version 1.0.0</Text>

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
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
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