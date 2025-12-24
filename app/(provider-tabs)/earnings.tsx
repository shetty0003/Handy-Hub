// app/(provider-tabs)/earnings.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ScrollView,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  title: string;
  client: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'withdrawn';
  type: 'earning' | 'withdrawal';
}

const transactions: Transaction[] = [
  { id: '1', title: 'Kitchen Sink Repair', client: 'Sarah Johnson', date: 'Dec 19, 2:30 PM', amount: '+$75', status: 'completed', type: 'earning' },
  { id: '2', title: 'Withdrawal to Bank', client: '', date: 'Dec 18, 10:00 AM', amount: '-$500', status: 'withdrawn', type: 'withdrawal' },
  { id: '3', title: 'Bathroom Plumbing', client: 'Mike Brown', date: 'Dec 17, 4:30 PM', amount: '+$120', status: 'completed', type: 'earning' },
  { id: '4', title: 'Water Heater Repair', client: 'Emily Davis', date: 'Dec 16, 10:00 AM', amount: '+$200', status: 'pending', type: 'earning' },
  { id: '5', title: 'Drain Cleaning', client: 'David Wilson', date: 'Dec 15, 3:00 PM', amount: '+$90', status: 'completed', type: 'earning' },
  { id: '6', title: 'Pipe Installation', client: 'Lisa Anderson', date: 'Dec 14, 1:00 PM', amount: '+$150', status: 'completed', type: 'earning' },
];

const periods = ['This Week', 'This Month', 'This Year', 'All Time'];

export default function ProviderEarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const handleWithdraw = () => {
    console.log('Withdraw funds');
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
            <Text style={styles.headerTitle}>Earnings</Text>
            <TouchableOpacity style={styles.historyButton}>
              <Ionicons name="time-outline" size={24} color="#0d9488" />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={['#14b8a6', '#0d9488', '#0f766e']}
              style={styles.balanceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceContent}>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={styles.balanceAmount}>$1,245.50</Text>
                  <Text style={styles.balanceSubtext}>+$185 this week</Text>
                </View>
                <TouchableOpacity 
                  style={styles.withdrawButton}
                  onPress={handleWithdraw}
                >
                  <Text style={styles.withdrawText}>Withdraw</Text>
                  <Ionicons name="arrow-forward" size={16} color="#0d9488" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="trending-up" size={24} color="#10b981" />
              </View>
              <Text style={styles.statValue}>$3.2k</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="briefcase" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          {/* Period Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.periodContainer}
            contentContainerStyle={styles.periodContent}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodChip,
                  selectedPeriod === period && styles.periodChipActive
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Quick Stats */}
          <View style={styles.quickStatsCard}>
            <View style={styles.quickStatItem}>
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Total Earned</Text>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </View>
              <Text style={styles.quickStatValue}>$8,450.00</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Pending</Text>
                <Ionicons name="time-outline" size={16} color="#f59e0b" />
              </View>
              <Text style={[styles.quickStatValue, { color: '#f59e0b' }]}>$320.00</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Withdrawn</Text>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              </View>
              <Text style={[styles.quickStatValue, { color: '#10b981' }]}>$6,880.00</Text>
            </View>
          </View>

          {/* Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            
            {transactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                activeOpacity={0.7}
              >
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.type === 'earning' ? '#d1fae5' : '#dbeafe' }
                  ]}>
                    <Ionicons 
                      name={transaction.type === 'earning' ? 'arrow-down' : 'arrow-up'} 
                      size={20} 
                      color={transaction.type === 'earning' ? '#10b981' : '#3b82f6'} 
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    {transaction.client && (
                      <Text style={styles.transactionClient}>{transaction.client}</Text>
                    )}
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'earning' ? '#10b981' : '#3b82f6' }
                  ]}>
                    {transaction.amount}
                  </Text>
                  {transaction.status === 'pending' && (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>Pending</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              <TouchableOpacity>
                <Text style={styles.addText}>Add New</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentCard}>
              <View style={styles.paymentLeft}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="card" size={24} color="#0d9488" />
                </View>
                <View>
                  <Text style={styles.paymentTitle}>Bank Account</Text>
                  <Text style={styles.paymentSubtitle}>**** **** 1234</Text>
                </View>
              </View>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            </View>

            <View style={styles.paymentCard}>
              <View style={styles.paymentLeft}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="wallet" size={24} color="#0d9488" />
                </View>
                <View>
                  <Text style={styles.paymentTitle}>PayPal</Text>
                  <Text style={styles.paymentSubtitle}>john.doe@email.com</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  historyButton: {
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
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
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
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  periodContainer: {
    marginBottom: 16,
  },
  periodContent: {
    paddingHorizontal: 20,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  periodChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  periodTextActive: {
    color: 'white',
  },
  quickStatsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatItem: {
    paddingVertical: 12,
  },
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  quickStatDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
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
  addText: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '600',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionClient: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  defaultBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  bottomSpacing: {
    height: 100,
  },
});