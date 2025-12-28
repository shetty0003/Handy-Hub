// app/provider/services.tsx - New file
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import { getProviderServices, createService, updateService, deleteService, Service } from '../../utils/profileHelper';

export default function ProviderServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    duration_hours: '1',
    is_active: true
  });

  const categories = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'Gardening', 'Moving', 'Other'];

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const services = await getProviderServices(user.id);
      setServices(services);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const serviceData = {
        provider_id: user.id,
        title: formData.title,
        category: formData.category,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        duration_hours: parseInt(formData.duration_hours) || 1,
        is_active: formData.is_active
      };

      if (!serviceData.title || !serviceData.category || !serviceData.price) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (editingService) {
        const { error } = await updateService(editingService.id, serviceData);
        if (error) throw error;
        Alert.alert('Success', 'Service updated successfully');
      } else {
        const { error } = await createService(serviceData);
        if (error) throw error;
        Alert.alert('Success', 'Service created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await deleteService(serviceId);
              if (error) throw error;
              Alert.alert('Success', 'Service deleted successfully');
              fetchServices();
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service');
            }
          }
        }
      ]
    );
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      category: service.category,
      description: service.description || '',
      price: service.price.toString(),
      duration_hours: service.duration_hours.toString(),
      is_active: service.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      price: '',
      duration_hours: '1',
      is_active: true
    });
    setEditingService(null);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#f0fdfa', '#ecfdf5']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0d9488" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f0fdfa', '#ecfdf5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Services</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Services List */}
          <View style={styles.servicesList}>
            {services.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="construct-outline" size={64} color="#cbd5e1" />
                <Text style={styles.emptyText}>No Services Yet</Text>
                <Text style={styles.emptySubtext}>Add your first service to start receiving requests</Text>
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                >
                  <Text style={styles.addFirstButtonText}>Add Your First Service</Text>
                </TouchableOpacity>
              </View>
            ) : (
              services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      <View style={styles.serviceCategory}>
                        <Text style={styles.categoryText}>{service.category}</Text>
                      </View>
                    </View>
                    <View style={styles.serviceStatus}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: service.is_active ? '#d1fae5' : '#f1f5f9' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: service.is_active ? '#065f46' : '#64748b' }
                        ]}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                      <Text style={styles.servicePrice}>${service.price}</Text>
                    </View>
                  </View>

                  {service.description && (
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  )}

                  <View style={styles.serviceDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.detailText}>{service.duration_hours} hour(s)</Text>
                    </View>
                  </View>

                  <View style={styles.serviceActions}>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditService(service)}
                    >
                      <Ionicons name="create-outline" size={18} color="#0d9488" />
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteService(service.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Add/Edit Service Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Service Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => setFormData({...formData, title: text})}
                    placeholder="e.g., Plumbing Repair, House Cleaning"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category *</Text>
                  <View style={styles.categoryGrid}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          formData.category === category && styles.categoryChipActive
                        ]}
                        onPress={() => setFormData({...formData, category})}
                      >
                        <Text style={[
                          styles.categoryChipText,
                          formData.category === category && styles.categoryChipTextActive
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({...formData, description: text})}
                    placeholder="Describe your service in detail..."
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Price ($) *</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.price}
                      onChangeText={(text) => setFormData({...formData, price: text})}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Duration (hours)</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.duration_hours}
                      onChangeText={(text) => setFormData({...formData, duration_hours: text})}
                      placeholder="1"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <View style={styles.switchContainer}>
                    <Text style={styles.label}>Active Status</Text>
                    <Switch
                      value={formData.is_active}
                      onValueChange={(value) => setFormData({...formData, is_active: value})}
                      trackColor={{ false: '#cbd5e1', true: '#0d9488' }}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    {formData.is_active 
                      ? 'Service is visible to customers' 
                      : 'Service is hidden from customers'}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveService}
                >
                  <LinearGradient
                    colors={['#14b8a6', '#0d9488']}
                    style={styles.saveGradient}
                  >
                    <Text style={styles.saveText}>Save Service</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  servicesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  serviceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  serviceCategory: {
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
  },
  serviceStatus: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    marginBottom: 12,
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
  serviceActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0d9488',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: 'white',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});