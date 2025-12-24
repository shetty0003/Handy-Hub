// app/notifications.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notification {
  id: string;
  type: 'job' | 'payment' | 'message' | 'system' | 'review';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
}

const notificationsData: Notification[] = [
  {
    id: '1',
    type: 'job',
    title: 'New Job Request',
    message: 'Sarah Johnson requested a plumbing service for kitchen sink repair.',
    time: '5 minutes ago',
    read: false,
    actionable: true,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $120 for electrical wiring job from Mike Brown.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'Emily Davis sent you a message about the cabinet installation.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '4',
    type: 'review',
    title: 'New Review',
    message: 'John Smith left you a 5-star review! "Excellent work and very professional."',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'job',
    title: 'Job Reminder',
    message: 'You have a scheduled job tomorrow at 10:00 AM with Lisa Anderson.',
    time: '5 hours ago',
    read: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'Profile Updated',
    message: 'Your profile information has been successfully updated.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '7',
    type: 'payment',
    title: 'Withdrawal Completed',
    message: 'Your withdrawal of $500 has been processed to your bank account.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '8',
    type: 'job',
    title: 'Job Completed',
    message: 'David Wilson marked the job as completed. Please review.',
    time: '3 days ago',
    read: true,
  },
];

const tabs = ['All', 'Unread', 'Jobs', 'Payments', 'Messages'];

export default function NotificationsScreen() {
  const [selectedTab, setSelectedTab] = useState('All');
  const [notifications, setNotifications] = useState(notificationsData);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job': return 'briefcase';
      case 'payment': return 'cash';
      case 'message': return 'chatbubble';
      case 'review': return 'star';
      case 'system': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'job': return '#3b82f6';
      case 'payment': return '#10b981';
      case 'message': return '#8b5cf6';
      case 'review': return '#f59e0b';
      case 'system': return '#64748b';
      default: return '#0d9488';
    }
  };

  const getNotificationBackground = (type: string) => {
    switch (type) {
      case 'job': return '#dbeafe';
      case 'payment': return '#d1fae5';
      case 'message': return '#ede9fe';
      case 'review': return '#fef3c7';
      case 'system': return '#f1f5f9';
      default: return '#f0fdfa';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (selectedTab === 'All') return true;
    if (selectedTab === 'Unread') return !notif.read;
    if (selectedTab === 'Jobs') return notif.type === 'job';
    if (selectedTab === 'Payments') return notif.type === 'payment';
    if (selectedTab === 'Messages') return notif.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationPress = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Ionicons name="arrow-back" size={24} color="#0d9488" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={24} color="#0d9488" />
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

        {/* Notifications List */}
        <ScrollView 
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>Youre all caught up!</Text>
            </View>
          ) : (
            <>
              {filteredNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadCard
                  ]}
                  onPress={() => handleNotificationPress(notification.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationLeft}>
                    <View style={[
                      styles.notificationIcon,
                      { backgroundColor: getNotificationBackground(notification.type) }
                    ]}>
                      <Ionicons 
                        name={getNotificationIcon(notification.type) as any} 
                        size={24} 
                        color={getNotificationColor(notification.type)} 
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>
                      <Text style={styles.notificationMessage} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                  </View>
                  {notification.actionable && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        console.log('Action for:', notification.id);
                      }}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#0d9488" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}

              {/* Clear All Button */}
              {filteredNotifications.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={handleClearAll}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={styles.clearAllText}>Clear All Notifications</Text>
                </TouchableOpacity>
              )}
            </>
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
  backButton: {
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  headerBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  moreButton: {
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
    maxHeight: 40,
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
  notificationsList: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0d9488',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0d9488',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  bottomSpacing: {
    height: 20,
  },
});