import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';

const CustomLogo = () => (
  <View style={styles.logoContainer}>
    <LinearGradient
      colors={['#0d9488', '#0f766e']}
      style={styles.logoBox}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.logoText}>H</Text>
    </LinearGradient>
  </View>
);

export default function ProviderSignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    businessAddress: '',
    yearsOfExperience: '',
    licenseNumber: '',
    taxId: '',
    password: '',
    retypePassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeVerification, setAgreeVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
  // Validation
  if (!agreeTerms || !agreeVerification) {
    Alert.alert('Agreement Required', 'Please agree to the terms and verification process');
    return;
  }

  const requiredFields = ['fullName', 'email', 'phone', 'businessName', 'businessType', 'password'];
  const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

  if (missingFields.length > 0) {
    Alert.alert('Missing Information', 'Please fill in all required fields (*)');
    return;
  }

  if (formData.password !== formData.retypePassword) {
    Alert.alert('Password Mismatch', 'Passwords do not match');
    return;
  }

  if (formData.password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters');
    return;
  }

  setLoading(true);
  try {
    // ========== STEP 1: Create Auth User with provider type ==========
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          user_type: 'provider', // CRITICAL: This triggers provider profile creation
          phone: formData.phone,
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        Alert.alert('Email Exists', 'This email is already registered. Please try logging in.');
      } else if (authError.message.includes('Invalid email')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
      } else {
        Alert.alert('Registration Failed', authError.message);
      }
      return;
    }

    if (!authData.user) {
      Alert.alert('Error', 'User creation failed. Please try again.');
      return;
    }

    // ========== STEP 2: Complete Provider Registration ==========
    const { error: providerError } = await supabase.rpc(
      'complete_provider_registration',
      {
        p_business_name: formData.businessName,
        p_business_type: formData.businessType,
        p_business_address: formData.businessAddress || null,
        p_years_of_experience: formData.yearsOfExperience ? 
          parseInt(formData.yearsOfExperience) : null,
        p_license_number: formData.licenseNumber || null,
        p_tax_id: formData.taxId || null,
      }
    );

    if (providerError) {
      console.error('Provider registration error:', providerError);
      
      let errorMessage = 'Failed to create provider profile. ';
      if (providerError.message.includes('already exists')) {
        errorMessage = 'Provider profile already exists for this user.';
      } else if (providerError.message.includes('not authenticated')) {
        errorMessage = 'Authentication failed. Please try again.';
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      Alert.alert('Provider Setup Failed', errorMessage);
      return;
    }

    // ========== STEP 3: Success ==========
    Alert.alert(
      'Application Submitted!',
      '✅ Account created successfully!\n\n' +
      '📋 Your provider application is under review.\n' +
      '📧 Check your email to verify your account.\n' +
      '⏳ We\'ll contact you within 2-3 business days.',
      [
        { 
          text: 'Go to Dashboard', 
          onPress: () => router.replace('/(provider-tabs)')
        }
      ]
    );

  } catch (error: any) {
    console.error('Provider signup error:', error);
    
    Alert.alert(
      'Error',
      'Unable to complete registration. Please try again.',
      [{ text: 'OK' }]
    );
  } finally {
    setLoading(false);
  }
};

  const handleSignIn = () => {
    router.replace('/auth/login');
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#d1fae5']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <CustomLogo />

            <View style={styles.header}>
              <Text style={styles.title}>Become a Service Provider</Text>
              <Text style={styles.subtitle}>Join our verified professional network</Text>
            </View>

            <View style={styles.form}>
              {/* Personal Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#999"
                    value={formData.fullName}
                    onChangeText={handleInputChange('fullName')}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="john@example.com"
                    placeholderTextColor="#999"
                    value={formData.email}
                    onChangeText={handleInputChange('email')}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+234 800 000 0000"
                    placeholderTextColor="#999"
                    value={formData.phone}
                    onChangeText={handleInputChange('phone')}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Business Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Information</Text>
                
                <Text style={styles.inputLabel}>Business Name *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your Business Name"
                    placeholderTextColor="#999"
                    value={formData.businessName}
                    onChangeText={handleInputChange('businessName')}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.inputLabel}>Service Type *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="construct-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Plumbing, Electrical, Cleaning"
                    placeholderTextColor="#999"
                    value={formData.businessType}
                    onChangeText={handleInputChange('businessType')}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.inputLabel}>Business Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Street, City, State"
                    placeholderTextColor="#999"
                    value={formData.businessAddress}
                    onChangeText={handleInputChange('businessAddress')}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.inputLabel}>Years of Experience</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="time-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 5"
                    placeholderTextColor="#999"
                    value={formData.yearsOfExperience}
                    onChangeText={handleInputChange('yearsOfExperience')}
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Verification Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Verification Documents</Text>
                <Text style={styles.sectionSubtitle}>
                  Help us verify your credentials (optional but recommended)
                </Text>
                
                <Text style={styles.inputLabel}>Professional License Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="License/Certification Number"
                    placeholderTextColor="#999"
                    value={formData.licenseNumber}
                    onChangeText={handleInputChange('licenseNumber')}
                    autoCapitalize="characters"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.inputLabel}>Business Registration/Tax ID</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="document-text-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tax ID or Registration Number"
                    placeholderTextColor="#999"
                    value={formData.taxId}
                    onChangeText={handleInputChange('taxId')}
                    editable={!loading}
                  />
                </View>

                <View style={styles.verificationNote}>
                  <Ionicons name="information-circle-outline" size={20} color="#0d9488" />
                  <Text style={styles.verificationNoteText}>
                    You will be able to upload photos of your documents after registration
                  </Text>
                </View>
              </View>

              {/* Security Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Security</Text>

                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a strong password"
                    placeholderTextColor="#999"
                    value={formData.password}
                    onChangeText={handleInputChange('password')}
                    autoCapitalize="none"
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color="#0d9488"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Retype your password"
                    placeholderTextColor="#999"
                    value={formData.retypePassword}
                    onChangeText={handleInputChange('retypePassword')}
                    autoCapitalize="none"
                    secureTextEntry={!showRetypePassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowRetypePassword(!showRetypePassword)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={showRetypePassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color="#0d9488"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Agreements */}
              <View style={styles.agreementsSection}>
                <TouchableOpacity 
                  style={styles.termsContainer} 
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  disabled={loading}
                >
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                    {agreeTerms && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.termsContainer} 
                  onPress={() => setAgreeVerification(!agreeVerification)}
                  disabled={loading}
                >
                  <View style={[styles.checkbox, agreeVerification && styles.checkboxChecked]}>
                    {agreeVerification && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.termsText}>
                    I consent to background verification and document review for platform security
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Button */}
              <LinearGradient
                colors={['#0d9488', '#0f766e']}
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
              >
                <TouchableOpacity
                  style={styles.submitButtonInner}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="white" size="small" />
                      <Text style={styles.loadingText}>Submitting Application...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Application</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>

              {/* Sign In Link */}
              <TouchableOpacity 
                onPress={handleSignIn} 
                style={styles.switchButton}
                disabled={loading}
              >
                <Text style={styles.switchButtonText}>
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  logoText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  form: {
    marginTop: 20,
    padding: 25,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 7,
  },
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: { position: 'relative', marginBottom: 18 },
  inputIcon: {
    position: 'absolute',
    left: 18,
    top: 17,
    zIndex: 1,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 14,
    padding: 5,
  },
  verificationNote: {
    flexDirection: 'row',
    backgroundColor: '#f0fdfa',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  verificationNoteText: {
    fontSize: 12,
    color: '#0d9488',
    marginLeft: 8,
    flex: 1,
  },
  agreementsSection: { marginBottom: 25 },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#0d9488',
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#0d9488' },
  termsText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
    lineHeight: 20,
  },
  termsLink: { color: '#0d9488', fontWeight: '600' },
  submitButton: {
    height: 55,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  submitButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: 'white', marginLeft: 10, fontSize: 16 },
  submitButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  switchButton: { alignItems: 'center', padding: 10 },
  switchButtonText: { color: '#0d9488', fontSize: 15 },
});