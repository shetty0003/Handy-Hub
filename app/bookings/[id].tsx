import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { updateBookingStatus } from '../../utils/serviceHelpers';
import { handleError } from '../../utils/errorHandler';

interface Booking {
  id: string;
  service_name: string;
  booking_time: string;
  status: string;
  total_amount: number;
  address: string;
  special_instructions: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#fef3c7',
  confirmed: '#dbeafe',
  in_progress: '#dbeafe',
  completed: '#d1fae5',
  cancelled: '#fee2e2',
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to load booking');
      } else {
        setBooking(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!booking?.id) return;

    try {
      const result = await updateBookingStatus(booking.id, newStatus as any);
      if (result.success) {
        Alert.alert('Success', `Booking updated to ${newStatus}`);
        fetchBooking();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      const { userMessage } = handleError(error, 'handleStatusChange');
      Alert.alert('Error', userMessage);
    }
  };

  if (loading || !booking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f0fdfa', '#ccfbf1']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0d9488" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Service Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service</Text>
          <Text style={styles.serviceName}>{booking.service_name}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Date & Time</Text>
          <Text style={styles.detailText}>
            {new Date(booking.booking_time).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Address</Text>
          <Text style={styles.detailText}>{booking.address}</Text>
        </View>

        {/* Special Instructions */}
        {booking.special_instructions && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Special Instructions</Text>
            <Text style={styles.detailText}>{booking.special_instructions}</Text>
          </View>
        )}

        {/* Total */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Amount</Text>
          <Text style={styles.totalText}>${booking.total_amount.toFixed(2)}</Text>
        </View>

        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[booking.status] || '#f3f4f6' }]}>
            <Text style={styles.statusText}>{booking.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Update Status</Text>
          <View style={styles.actionButtons}>
            {['confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.actionButton,
                  booking.status === status && styles.actionButtonActive,
                ]}
                onPress={() => handleStatusChange(status)}
              >
                <Text style={styles.actionButtonText}>{status.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  detailText: {
    fontSize: 16,
    color: '#1e293b',
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});
