import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, providers: 0, bookings: 0, pendingVerifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [users, providers, bookings, verifications] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('providers').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('provider_verification').select('*', { count: 'exact', head: true }).eq('verification_step', 'pending'),
      ]);
      setStats({
        users: users.count || 0,
        providers: providers.count || 0,
        bookings: bookings.count || 0,
        pendingVerifications: verifications.count || 0,
      });
    } finally { setLoading(false); }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#0d9488" /></View>;

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: 'people-outline', color: '#3b82f6' },
    { label: 'Providers', value: stats.providers, icon: 'business-outline', color: '#10b981' },
    { label: 'Bookings', value: stats.bookings, icon: 'calendar-outline', color: '#f59e0b' },
    { label: 'Pending Verifications', value: stats.pendingVerifications, icon: 'shield-checkmark-outline', color: '#ef4444' },
  ];

  return (
    <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Platform overview</Text>
          <View style={styles.grid}>
            {statCards.map(s => (
              <View key={s.label} style={styles.statCard}>
                <Ionicons name={s.icon as any} size={24} color={s.color} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Manage Provider Verifications</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, gap: 16 },
  header: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: 140, backgroundColor: '#1e293b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: 'white', marginVertical: 8 },
  statLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  actionButton: { backgroundColor: '#0d9488', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  actionText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
