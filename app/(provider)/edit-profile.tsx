import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { getUserProfile } from '../../utils/profileHelper';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';

interface ProviderProfile {
  business_name: string;
  business_type: string;
  business_address?: string;
  years_of_experience?: string;
  license_number?: string;
  tax_id?: string;
  phone?: string;
  description?: string;
}

export default function EditProviderProfileScreen() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProviderProfile>({
    business_name: '',
    business_type: '',
    business_address: '',
    years_of_experience: '',
    license_number: '',
    tax_id: '',
    phone: '',
    description: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setProfile({
            business_name: userProfile.providers?.business_name || '',
            business_type: userProfile.providers?.business_type || '',
            business_address: userProfile.providers?.business_address || '',
            years_of_experience: userProfile.providers?.years_of_experience?.toString() || '',
            license_number: userProfile.providers?.license_number || '',
            tax_id: userProfile.providers?.tax_id || '',
            phone: userProfile.phone || '',
            description: userProfile.providers?.description || '',
          });
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof ProviderProfile) => (value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (!profile.business_name.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }

    if (!profile.business_type.trim()) {
      Alert.alert('Error', 'Service type is required');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update provider info
      const { error: providerError } = await supabase
        .from('providers')
        .update({
          business_name: profile.business_name,
          business_type: profile.business_type,
          business_address: profile.business_address || null,
          years_of_experience: profile.years_of_experience ? parseInt(profile.years_of_experience) : null,
          license_number: profile.license_number || null,
          tax_id: profile.tax_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (providerError) throw providerError;

      // Update profile phone if changed
      if (profile.phone) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: profile.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      Alert.alert(
        'Success',
        'Profile updated successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', error.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const businessTypes = [
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Carpentry',
    'Painting',
    'Gardening',
    'Moving',
    'Repair',
    'Installation',
    'Other'
  ];

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={saving}
              >
                <Ionicons name="arrow-back" size={24} color="#0d9488" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Business Profile</Text>
              <View style={styles.headerRight} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Business Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your business name"
                    placeholderTextColor="#999"
                    value={profile.business_name}
                    onChangeText={handleInputChange('business_name')}
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Business Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Type *</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.typeScrollView}
                >
                  {businessTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        profile.business_type === type && styles.typeButtonActive
                      ]}
                      onPress={() => handleInputChange('business_type')(type)}
                      disabled={saving}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        profile.business_type === type && styles.typeButtonTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {profile.business_type && profile.business_type === 'Other' && (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Specify service type"
                      placeholderTextColor="#999"
                      value={profile.business_type}
                      onChangeText={handleInputChange('business_type')}
                      editable={!saving}
                    />
                  </View>
                )}
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+1 (555) 123-4567"
                    placeholderTextColor="#999"
                    value={profile.phone}
                    onChangeText={handleInputChange('phone')}
                    keyboardType="phone-pad"
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Business Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Street, City, State, ZIP"
                    placeholderTextColor="#999"
                    value={profile.business_address}
                    onChangeText={handleInputChange('business_address')}
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Years of Experience */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Years of Experience</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="time-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 5"
                    placeholderTextColor="#999"
                    value={profile.years_of_experience}
                    onChangeText={handleInputChange('years_of_experience')}
                    keyboardType="numeric"
                    editable={!saving}
                  />
                </View>
              </View>

              {/* License Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Professional License</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="License/Certification Number"
                    placeholderTextColor="#999"
                    value={profile.license_number}
                    onChangeText={handleInputChange('license_number')}
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Tax ID */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tax ID / EIN</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="document-text-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tax Identification Number"
                    placeholderTextColor="#999"
                    value={profile.tax_id}
                    onChangeText={handleInputChange('tax_id')}
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Business Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Description</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell customers about your business, expertise, and services..."
                    placeholderTextColor="#999"
                    value={profile.description}
                    onChangeText={handleInputChange('description')}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <LinearGradient
                    colors={['#0d9488', '#0f766e']}
                    style={styles.saveButtonGradient}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>

              <View style={styles.bottomSpacing} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
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
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0d9488',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRight: {
    width: 44,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  typeScrollView: {
    marginBottom: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeButtonActive: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  textAreaContainer: {
    height: 120,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  saveButton: {
    height: 56,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
});