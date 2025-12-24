import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
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
import { supabase } from '../../utils/supabase';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  action: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  showBadge?: boolean;
  badgeColor?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  user_type: string;
  verification_status: string;
  created_at: string;
}

interface ProviderInfo {
  id: string;
  business_name: string;
  business_type: string;
  business_address?: string;
  years_of_experience?: number;
  license_number?: string;
  tax_id?: string;
  rating: number;
  total_jobs: number;
  is_verified: boolean;
}

export default function ProviderProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [availableStatus, setAvailableStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load provider info
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerError) {
        console.error('Provider info error:', providerError);
      } else {
        setProviderInfo(providerData);
      }

      // Try to load profile image
      const { data: imageData } = await supabase.storage
        .from('avatars')
        .createSignedUrl(`public/${user.id}`, 60);

      if (imageData) {
        setProfileImage(imageData.signedUrl);
      }
    } catch (error) {
      console.error('Profile load error:', error);
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
    router.push('/');
  };

  const handleVerificationStatus = () => {
    let title = 'Verification Status';
    let message = 'Your account status is currently unverified.';

    switch (profile?.verification_status) {
      case 'verified':
        title = '✓ Account Verified';
        message = 'Congratulations! Your account is verified, and you have full access to all features.';
        break;
      case 'pending':
        title = '⏳ Verification Pending';
        message = 'Your documents are under review. This typically takes 2-3 business days. We appreciate your patience.';
        break;
      case 'rejected':
        title = '⚠️ Action Required';
        message = 'Your verification could not be completed. Please check your email for details on the required actions.';
        break;
    }

    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const handleBusinessInfo = () => {
    router.push('/provider/business-info');
  };

  const handleServices = () => {
    router.push('/provider/services');
  };

  const handleAvailability = () => {
    router.push('/provider/availability');
  };

  const handlePricing = () => {
    router.push('/provider/pricing');
  };

  const handleDocuments = () => {
    router.push('/provider/documents');
  };

  const handleEarnings = () => {
    router.push('/provider/earnings');
  };

  const handleReviews = () => {
    router.push('/provider/reviews');
  };

  const handleSupport = () => {
    router.push('/provider/support');
  };

  const handleAvailableToggle = () => {
    setAvailableStatus(!availableStatus);
    // TODO: Update availability in Supabase
    supabase
      .from('providers')
      .update({ is_available: !availableStatus })
      .eq('user_id', profile?.id);
  };

  const providerMenuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Business Profile',
      icon: 'business-outline',
      subtitle: 'Edit business details',
      action: handleBusinessInfo,
      showArrow: true,
    },
    {
      id: '2',
      title: 'My Services',
      icon: 'construct-outline',
      subtitle: 'Manage offered services',
      action: handleServices,
      showArrow: true,
    },
    {
      id: '3',
      title: 'Availability',
      icon: 'calendar-outline',
      subtitle: 'Set working hours',
      action: handleAvailability,
      showArrow: true,
    },
    {
      id: '4',
      title: 'Pricing',
      icon: 'cash-outline',
      subtitle: 'Set service rates',
      action: handlePricing,
      showArrow: true,
    },
  ];

  const accountMenuItems: MenuItem[] = [
    {
      id: '5',
      title: 'Verification Status',
      icon: 'shield-checkmark-outline',
      subtitle: profile?.verification_status === 'verified' ? 'Verified ✓' : 'Pending review',
      action: handleVerificationStatus,
      showArrow: true,
      showBadge: true,
      badgeColor: profile?.verification_status === 'verified' ? '#10b981' : '#f59e0b',
    },
    {
      id: '6',
      title: 'Documents',
      icon: 'document-text-outline',
      subtitle: 'Upload licenses & certificates',
      action: handleDocuments,
      showArrow: true,
    },
    {
      id: '7',
      title: 'Earnings & Payments',
      icon: 'wallet-outline',
      subtitle: 'View earnings history',
      action: handleEarnings,
      showArrow: true,
    },
    {
      id: '8',
      title: 'Reviews',
      icon: 'star-outline',
      subtitle: `${providerInfo?.rating || 0}/5 (${providerInfo?.total_jobs || 0} jobs)`,
      action: handleReviews,
      showArrow: true,
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      id: '9',
      title: 'Available for Jobs',
      icon: availableStatus ? 'checkmark-circle-outline' : 'close-circle-outline',
      subtitle: availableStatus ? 'Accepting new jobs' : 'Not available',
      action: handleAvailableToggle,
      showSwitch: true,
      switchValue: availableStatus,
    },
    {
      id: '10',
      title: 'Notifications',
      icon: 'notifications-outline',
      subtitle: 'Job alerts & messages',
      action: () => setNotificationsEnabled(!notificationsEnabled),
      showSwitch: true,
      switchValue: notificationsEnabled,
    },
    {
      id: '11',
      title: 'Support Center',
      icon: 'help-circle-outline',
      subtitle: 'Get help & support',
      action: handleSupport,
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
        <View style={[
          styles.menuIcon,
          item.showBadge && { backgroundColor: `${item.badgeColor}20` }
        ]}>
          <Ionicons 
            name={item.icon} 
            size={22} 
            color={item.showBadge ? item.badgeColor : '#0d9488'} 
          />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={[
              styles.menuItemSubtitle,
              item.showBadge && { color: item.badgeColor, fontWeight: '600' }
            ]}>
              {item.subtitle}
            </Text>
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

  const getMemberSince = () => {
    if (!profile?.created_at) return 'Recently';
    const createdDate = new Date(profile.created_at);
    const now = new Date();
    const diffInMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + 
                         (now.getMonth() - createdDate.getMonth());
    
    if (diffInMonths < 1) return 'New';
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
    
    const years = Math.floor(diffInMonths / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  const getVerificationBadge = () => {
    if (!profile) return null;
    
    switch(profile.verification_status) {
      case 'verified':
        return {
          text: 'Verified',
          color: '#10b981',
          bgColor: '#dcfce7',
          icon: 'checkmark-circle'
        };
      case 'pending':
        return {
          text: 'Under Review',
          color: '#f59e0b',
          bgColor: '#fef3c7',
          icon: 'time-outline'
        };
      case 'rejected':
        return {
          text: 'Needs Attention',
          color: '#ef4444',
          bgColor: '#fee2e2',
          icon: 'alert-circle'
        };
      default:
        return {
          text: 'Not Verified',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          icon: 'close-circle'
        };
    }
  };

  const verificationBadge = getVerificationBadge();

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={handleEditProfile}
              disabled={loading}
            >
              <Ionicons name="create-outline" size={24} color="#0d9488" />
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
                <View>
                  {profileImage ? (
                    <Image 
                      source={{ uri: profileImage }} 
                      style={styles.profileAvatarImage}
                    />
                  ) : (
                    <View style={styles.profileAvatar}>
                      <Ionicons name="business" size={48} color="white" />
                    </View>
                  )}
                </View>
                
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {providerInfo?.business_name || profile?.full_name || 'Loading...'}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {profile?.email || 'Loading...'}
                  </Text>
                  
                  {/* Verification Badge */}
                  {verificationBadge && (
                    <View style={[styles.verificationBadge, { backgroundColor: verificationBadge.bgColor }]}>
                      <Ionicons 
                        name={verificationBadge.icon as any} 
                        size={14} 
                        color={verificationBadge.color} 
                      />
                      <Text style={[styles.verificationText, { color: verificationBadge.color }]}>
                        {verificationBadge.text}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Business Info */}
              <View style={styles.businessInfo}>
                <View style={styles.businessInfoItem}>
                  <Ionicons name="construct-outline" size={16} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.businessInfoText}>
                    {providerInfo?.business_type || 'Service Type'}
                  </Text>
                </View>
                
                {providerInfo?.years_of_experience && (
                  <View style={styles.businessInfoItem}>
                    <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.businessInfoText}>
                      {providerInfo.years_of_experience} years experience
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{providerInfo?.rating?.toFixed(1) || '--'}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{providerInfo?.total_jobs || '0'}</Text>
                  <Text style={styles.statLabel}>Jobs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{getMemberSince()}</Text>
                  <Text style={styles.statLabel}>On Platform</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Provider Services Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Business</Text>
            <View style={styles.menuContainer}>
              {providerMenuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.menuContainer}>
              {accountMenuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.menuContainer}>
              {settingsMenuItems.map(renderMenuItem)}
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
              <Ionicons name="refresh-outline" size={20} color="#ef4444" />
            ) : (
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            )}
            <Text style={styles.logoutText}>
              {loading ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>Provider Dashboard v1.0.0</Text>

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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  settingsButton: {
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
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  businessInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  businessInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  businessInfoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
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
    height: 20,
  },
});