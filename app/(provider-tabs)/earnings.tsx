import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { getUserProfile } from '../../utils/profileHelper';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  title: string;
  client: string;
  date: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'earning' | 'withdrawal';
}

interface EarningsStats {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  withdrawnAmount: number;
  weeklyEarnings: number;
  jobsCompleted: number;
}

const periods = ['This Week', 'This Month', 'This Year', 'All Time'];

export default function ProviderEarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    availableBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    withdrawnAmount: 0,
    weeklyEarnings: 0,
    jobsCompleted: 0
  });

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get provider stats
      const { provider } = await getUserProfile(user.id);
      if (provider) {
        setStats({
          availableBalance: provider.available_balance || 0,
          pendingBalance: provider.pending_balance || 0,
          totalEarned: provider.total_earnings || 0,
          withdrawnAmount: (provider.total_earnings || 0) - (provider.available_balance || 0),
          weeklyEarnings: provider.weekly_earnings || 0,
          jobsCompleted: provider.completed_jobs || 0
        });
      }

      // Get recent transactions
      const { data: earnings, error } = await supabase
        .from('earnings')
        .select(`
          *,
          job_requests (
            title
          )
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedTransactions: Transaction[] = (earnings || []).map(earning => {
        const job = earning.job_requests as any;
        return {
          id: earning.id,
          title: job?.title || (earning.type === 'withdrawal' ? 'Withdrawal' : 'Service'),
          client: 'Client', // You might want to fetch client name here
          date: new Date(earning.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          }),
          amount: earning.amount,
          status: earning.status as any,
          type: earning.type as any
        };
      });

      setTransactions(formattedTransactions);

    } catch (error) {
      console.error('Error fetching earnings:', error);
      Alert.alert('Error', 'Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const handleWithdraw = async () => {
    if (stats.availableBalance <= 0) {
      Alert.alert('No Funds', 'You have no available balance to withdraw');
      return;
    }

    Alert.alert(
      'Withdraw Funds',
      `Are you sure you want to withdraw $${stats.availableBalance.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'default',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              // Create withdrawal record
              const { error } = await supabase
                .from('earnings')
                .insert({
                  provider_id: user.id,
                  amount: stats.availableBalance,
                  type: 'withdrawal',
                  status: 'pending',
                  description: 'Withdrawal to bank account'
                });

              if (error) throw error;

              // Update provider balance (simplified - you might want to add pending_balance logic)
              const { error: updateError } = await supabase
                .from('providers')
                .update({ 
                  available_balance: 0,
                  pending_balance: stats.availableBalance
                })
                .eq('id', user.id);

              if (updateError) throw updateError;

              Alert.alert('Success', 'Withdrawal request submitted!');
              fetchEarningsData();
            } catch (error) {
              console.error('Withdrawal error:', error);
              Alert.alert('Error', 'Failed to process withdrawal');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#f0fdfa', '#ecfdf5']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d9488" />
            <Text style={styles.loadingText}>Loading earnings...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f0fdfa', '#ecfdf5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Earnings</Text>
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => router.push('/provider/earnings/history')}
            >
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
                  <Text style={styles.balanceAmount}>${stats.availableBalance.toFixed(2)}</Text>
                  <Text style={styles.balanceSubtext}>
                    {stats.weeklyEarnings > 0 ? `+$${stats.weeklyEarnings} this week` : 'No earnings this week'}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.withdrawButton}
                  onPress={handleWithdraw}
                  disabled={stats.availableBalance <= 0}
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
              <Text style={styles.statValue}>${stats.weeklyEarnings}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="briefcase" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>{stats.jobsCompleted}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="cash-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statValue}>${stats.totalEarned}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStatsCard}>
            <View style={styles.quickStatItem}>
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Total Earned</Text>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </View>
              <Text style={styles.quickStatValue}>${stats.totalEarned.toFixed(2)}</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Pending</Text>
                <Ionicons name="time-outline" size={16} color="#f59e0b" />
              </View>
              <Text style={[styles.quickStatValue, { color: '#f59e0b' }]}>
                ${stats.pendingBalance.toFixed(2)}
              </Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <View style={styles.quickStatRow}>
                <Text style={styles.quickStatLabel}>Withdrawn</Text>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              </View>
              <Text style={[styles.quickStatValue, { color: '#10b981' }]}>
                ${stats.withdrawnAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            
            {transactions.length === 0 ? (
              <View style={styles.emptyTransactions}>
                <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              transactions.map((transaction) => (
                <View
                  key={transaction.id}
                  style={styles.transactionCard}
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
                      <Text style={styles.transactionDate}>{transaction.date}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'earning' ? '#10b981' : '#3b82f6' }
                    ]}>
                      {transaction.type === 'earning' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </Text>
                    {transaction.status === 'pending' && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Styles remain mostly the same...
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
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
  balanceGradient: { padding: 24 },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceInfo: { flex: 1 },
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
  periodContainer: { marginBottom: 16 },
  periodContent: { paddingHorizontal: 20 },
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
  periodTextActive: { color: 'white' },
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
  quickStatItem: { paddingVertical: 12 },
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
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d9488',
    paddingHorizontal: 20,
    marginBottom: 16,
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
  transactionInfo: { flex: 1 },
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
  transactionRight: { alignItems: 'flex-end' },
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
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  bottomSpacing: { height: 100 },
});