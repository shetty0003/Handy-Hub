// app/auth/customer/signup.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import PhoneInput from 'react-native-phone-number-input';

const { width } = Dimensions.get('window');

// Steps
const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: 'person' },
  { id: 'security', title: 'Security', icon: 'lock-closed' },
  { id: 'location', title: 'Location', icon: 'location' },
  { id: 'preferences', title: 'Preferences', icon: 'settings' },
  { id: 'review', title: 'Review', icon: 'checkmark-circle' }
];

interface CustomerFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  profilePicture: string | null;
  location: {
    latitude: number | null;
    longitude: number | null;
    address: string;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
  };
}

export default function AdvancedCustomerSignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
    location: {
      latitude: null,
      longitude: null,
      address: ''
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: '#ef4444',
    criteria: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: true,
    age: false
  });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Refs
  const fullNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const retypePasswordRef = useRef<TextInput>(null);
  const phoneInput = useRef<PhoneInput>(null);
  
  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Handle input change
  const handleInputChange = (field: keyof CustomerFormData) => (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
    
    // Update password strength in real-time
    if (field === 'password') {
      calculatePasswordStrength(value);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    if (criteria.length) score += 20;
    if (criteria.uppercase) score += 20;
    if (criteria.lowercase) score += 20;
    if (criteria.number) score += 20;
    if (criteria.special) score += 20;

    let message = '';
    let color = '#ef4444';
    
    if (score < 40) {
      message = 'Weak';
      color = '#ef4444';
    } else if (score < 70) {
      message = 'Fair';
      color = '#f59e0b';
    } else if (score < 90) {
      message = 'Good';
      color = '#3b82f6';
    } else {
      message = 'Strong';
      color = '#10b981';
    }

    setPasswordStrength({
      score,
      message,
      color,
      criteria
    });
  };

  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Personal Info
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        break;
      case 1: // Security
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters required';
        else if (passwordStrength.score < 40) newErrors.password = 'Password is too weak';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!agreements.terms) newErrors.terms = 'You must accept Terms of Service';
        if (!agreements.privacy) newErrors.privacy = 'You must accept Privacy Policy';
        if (!agreements.age) newErrors.age = 'You must confirm you are 18 or older';
        break;
      case 2: // Location
        if (!formData.location.address) newErrors.location = 'Location is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSignUp();
      }
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    } else {
      router.back();
    }
  };

  // Handle sign up
  const handleSignUp = async () => {
    setLoading(true);
    try {
      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            user_type: 'customer',
            phone: formData.phone,
            marketing_consent: agreements.marketing,
            preferences: formData.preferences,
            location: formData.location
          },
          emailRedirectTo: 'handyhub://auth/callback'
        }
      });

      if (authError) throw authError;

      // Navigate to success or home
      Alert.alert(
        'Success!',
        'Account created successfully. Please check your email to verify your account.',
        [{ 
          text: 'Continue', 
          onPress: () => router.replace('/(tabs)') 
        }]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep();
      case 1:
        return renderSecurityStep();
      case 2:
        return renderLocationStep();
      case 3:
        return renderPreferencesStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Full Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeField === 'fullName' ? '#0d9488' : '#94a3b8'} 
            style={styles.inputIcon} 
          />
          <TextInput
            ref={fullNameRef}
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#94a3b8"
            value={formData.fullName}
            onChangeText={handleInputChange('fullName')}
            onFocus={() => setActiveField('fullName')}
            onBlur={() => setActiveField(null)}
            autoCapitalize="words"
            editable={!loading}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        </View>
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Email Address <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
          <Ionicons 
            name="mail-outline" 
            size={20} 
            color={activeField === 'email' ? '#0d9488' : '#94a3b8'} 
            style={styles.inputIcon} 
          />
          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="john@example.com"
            placeholderTextColor="#94a3b8"
            value={formData.email}
            onChangeText={handleInputChange('email')}
            onFocus={() => setActiveField('email')}
            onBlur={() => setActiveField(null)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Phone */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Phone Number <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
          <Ionicons 
            name="call-outline" 
            size={20} 
            color={activeField === 'phone' ? '#0d9488' : '#94a3b8'} 
            style={styles.inputIcon} 
          />
          <TextInput
            ref={phoneRef}
            style={styles.input}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor="#94a3b8"
            value={formData.phone}
            onChangeText={handleInputChange('phone')}
            onFocus={() => setActiveField('phone')}
            onBlur={() => setActiveField(null)}
            keyboardType="phone-pad"
            editable={!loading}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
    </View>
  );

  const renderSecurityStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Account Security</Text>
      <Text style={styles.stepSubtitle}>Create secure login credentials</Text>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
          <Ionicons 
            name="lock-closed-outline"
            size={20} 
            color={activeField === 'password' ? '#0d9488' : '#94a3b8'} 
            style={styles.inputIcon} 
          />
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Create a strong password"
            placeholderTextColor="#94a3b8"
            value={formData.password}
            onChangeText={handleInputChange('password')}
            onFocus={() => setActiveField('password')}
            onBlur={() => setActiveField(null)}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            editable={!loading}
            returnKeyType="next"
            onSubmitEditing={() => retypePasswordRef.current?.focus()}
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
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Password Strength Meter */}
      <View style={styles.passwordStrengthContainer}>
        <View style={styles.strengthLabels}>
          <Text style={styles.strengthLabel}>Password Strength:</Text>
          <Text style={[
            styles.strengthValue, 
            { 
              color: passwordStrength.score < 40 ? '#ef4444' : 
                     passwordStrength.score < 70 ? '#f59e0b' : 
                     passwordStrength.score < 90 ? '#3b82f6' : '#10b981'
            }
          ]}>
            {passwordStrength.message}
          </Text>
        </View>
        <View style={styles.strengthBar}>
          <View 
            style={[
              styles.strengthProgress, 
              { 
                width: `${passwordStrength.score}%`,
                backgroundColor: passwordStrength.score < 40 ? '#ef4444' : 
                               passwordStrength.score < 70 ? '#f59e0b' : 
                               passwordStrength.score < 90 ? '#3b82f6' : '#10b981'
              }
            ]} 
          />
        </View>
        
        {/* Password Requirements Checklist */}
        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={formData.password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'} 
              size={16} 
              color={formData.password.length >= 8 ? '#10b981' : '#94a3b8'} 
            />
            <Text style={[
              styles.requirementText,
              { color: formData.password.length >= 8 ? '#10b981' : '#64748b' }
            ]}>
              At least 8 characters
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={/[A-Z]/.test(formData.password) ? 'checkmark-circle' : 'ellipse-outline'} 
              size={16} 
              color={/[A-Z]/.test(formData.password) ? '#10b981' : '#94a3b8'} 
            />
            <Text style={[
              styles.requirementText,
              { color: /[A-Z]/.test(formData.password) ? '#10b981' : '#64748b' }
            ]}>
              One uppercase letter
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={/[a-z]/.test(formData.password) ? 'checkmark-circle' : 'ellipse-outline'} 
              size={16} 
              color={/[a-z]/.test(formData.password) ? '#10b981' : '#94a3b8'} 
            />
            <Text style={[
              styles.requirementText,
              { color: /[a-z]/.test(formData.password) ? '#10b981' : '#64748b' }
            ]}>
              One lowercase letter
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={/\d/.test(formData.password) ? 'checkmark-circle' : 'ellipse-outline'} 
              size={16} 
              color={/\d/.test(formData.password) ? '#10b981' : '#94a3b8'} 
            />
            <Text style={[
              styles.requirementText,
              { color: /\d/.test(formData.password) ? '#10b981' : '#64748b' }
            ]}>
              One number
            </Text>
          </View>
        </View>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Confirm Password <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
          <Ionicons 
            name="lock-closed-outline"
            size={20} 
            color={activeField === 'confirmPassword' ? '#0d9488' : '#94a3b8'} 
            style={styles.inputIcon} 
          />
          <TextInput
            ref={retypePasswordRef}
            style={styles.input}
            placeholder="Retype your password"
            placeholderTextColor="#94a3b8"
            value={formData.confirmPassword}
            onChangeText={handleInputChange('confirmPassword')}
            onFocus={() => setActiveField('confirmPassword')}
            onBlur={() => setActiveField(null)}
            autoCapitalize="none"
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#0d9488"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
      </View>

      {/* Terms & Agreements */}
      <View style={styles.agreementsContainer}>
        <Text style={styles.agreementsTitle}>Legal Agreements</Text>
        
        <TouchableOpacity 
          style={styles.agreementItem}
          onPress={() => setAgreements(prev => ({ ...prev, terms: !prev.terms }))}
          disabled={loading}
        >
          <View style={[
            styles.agreementCheckbox,
            agreements.terms && styles.agreementCheckboxChecked
          ]}>
            {agreements.terms && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.agreementText}>
            I agree to the{' '}
            <Text style={styles.agreementLink}>Terms of Service</Text>
          </Text>
        </TouchableOpacity>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

        <TouchableOpacity 
          style={styles.agreementItem}
          onPress={() => setAgreements(prev => ({ ...prev, privacy: !prev.privacy }))}
          disabled={loading}
        >
          <View style={[
            styles.agreementCheckbox,
            agreements.privacy && styles.agreementCheckboxChecked
          ]}>
            {agreements.privacy && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.agreementText}>
            I agree to the{' '}
            <Text style={styles.agreementLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {errors.privacy && <Text style={styles.errorText}>{errors.privacy}</Text>}

        <TouchableOpacity 
          style={styles.agreementItem}
          onPress={() => setAgreements(prev => ({ ...prev, age: !prev.age }))}
          disabled={loading}
        >
          <View style={[
            styles.agreementCheckbox,
            agreements.age && styles.agreementCheckboxChecked
          ]}>
            {agreements.age && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.agreementText}>
            I confirm I am 18 years or older
          </Text>
        </TouchableOpacity>
        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

        <TouchableOpacity 
          style={styles.agreementItem}
          onPress={() => setAgreements(prev => ({ ...prev, marketing: !prev.marketing }))}
          disabled={loading}
        >
          <View style={[
            styles.agreementCheckbox,
            agreements.marketing && styles.agreementCheckboxChecked
          ]}>
            {agreements.marketing && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.agreementText}>
            Send me promotional offers and updates (optional)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your Location</Text>
      <Text style={styles.stepSubtitle}>Help us find services near you</Text>

      <View style={styles.locationCard}>
        <Ionicons name="location" size={40} color="#0d9488" />
        <Text style={styles.locationTitle}>Set Your Location</Text>
        <Text style={styles.locationDescription}>
          We use your location to show relevant services and providers in your area.
          Your exact address is never shared publicly.
        </Text>

        <Text style={styles.inputLabel}>Enter Address</Text>
        <View style={[styles.inputContainer, errors.location && styles.inputError]}>
          <Ionicons name="home-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Street, City, State, ZIP"
            placeholderTextColor="#94a3b8"
            value={formData.location.address}
            onChangeText={(value) => {
              setFormData(prev => ({
                ...prev,
                location: { ...prev.location, address: value }
              }));
              if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
            }}
            multiline
            numberOfLines={2}
          />
        </View>
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
      </View>

      <View style={styles.privacyNote}>
        <Ionicons name="shield-checkmark" size={16} color="#0d9488" />
        <Text style={styles.privacyNoteText}>
          Your location is encrypted and only used to match you with nearby services
        </Text>
      </View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Preferences</Text>
      <Text style={styles.stepSubtitle}>Customize your experience</Text>

      {/* Communication Preferences */}
      <View style={styles.preferencesSection}>
        <Text style={styles.sectionTitle}>Communication Preferences</Text>
        
        <TouchableOpacity
          style={styles.preferenceItem}
          onPress={() => {
            setFormData(prev => ({
              ...prev,
              preferences: {
                ...prev.preferences,
                notifications: !prev.preferences.notifications
              }
            }));
          }}
        >
          <View style={styles.preferenceCheckbox}>
            {formData.preferences.notifications && <Ionicons name="checkmark" size={16} color="#0d9488" />}
          </View>
          <Text style={styles.preferenceText}>
            Push Notifications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.preferenceItem}
          onPress={() => {
            setFormData(prev => ({
              ...prev,
              preferences: {
                ...prev.preferences,
                emailUpdates: !prev.preferences.emailUpdates
              }
            }));
          }}
        >
          <View style={styles.preferenceCheckbox}>
            {formData.preferences.emailUpdates && <Ionicons name="checkmark" size={16} color="#0d9488" />}
          </View>
          <Text style={styles.preferenceText}>
            Email Updates
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.preferenceItem}
          onPress={() => {
            setFormData(prev => ({
              ...prev,
              preferences: {
                ...prev.preferences,
                smsUpdates: !prev.preferences.smsUpdates
              }
            }));
          }}
        >
          <View style={styles.preferenceCheckbox}>
            {formData.preferences.smsUpdates && <Ionicons name="checkmark" size={16} color="#0d9488" />}
          </View>
          <Text style={styles.preferenceText}>
            SMS Updates
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepSubtitle}>Confirm your information</Text>

      <ScrollView style={styles.reviewContainer}>
        {/* Profile Summary */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Profile</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Name:</Text>
            <Text style={styles.reviewValue}>{formData.fullName}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Email:</Text>
            <Text style={styles.reviewValue}>{formData.email}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Phone:</Text>
            <Text style={styles.reviewValue}>{formData.phone}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Location:</Text>
            <Text style={styles.reviewValue}>
              {formData.location.address || 'Not set'}
            </Text>
          </View>
        </View>

        {/* Preferences Summary */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Preferences</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Notifications:</Text>
            <Text style={styles.reviewValue}>
              {formData.preferences.notifications ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Email Updates:</Text>
            <Text style={styles.reviewValue}>
              {formData.preferences.emailUpdates ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>SMS Updates:</Text>
            <Text style={styles.reviewValue}>
              {formData.preferences.smsUpdates ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {/* Security Summary */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Security</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Password Strength:</Text>
            <Text style={[styles.reviewValue, { color: passwordStrength.color }]}>
              {passwordStrength.message}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Final Confirmation */}
      <View style={styles.confirmationBox}>
        <Ionicons name="information-circle" size={24} color="#0d9488" />
        <Text style={styles.confirmationText}>
          By submitting, you confirm all information is accurate and agree to our terms
        </Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#ccfbf1']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0d9488" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
          {STEPS.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.step,
                index === currentStep && styles.stepActive,
                index < currentStep && styles.stepCompleted
              ]}
              onPress={() => index <= currentStep && setCurrentStep(index)}
              disabled={loading}
            >
              <View style={[
                styles.stepCircle,
                index === currentStep && styles.stepCircleActive,
                index < currentStep && styles.stepCircleCompleted
              ]}>
                {index < currentStep ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Ionicons name={step.icon as any} size={16} color={
                    index === currentStep ? '#0d9488' : 
                    index < currentStep ? 'white' : '#94a3b8'
                  } />
                )}
              </View>
              <Text style={[
                styles.stepText,
                index === currentStep && styles.stepTextActive,
                index < currentStep && styles.stepTextCompleted
              ]}>
                {step.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderStepContent()}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBack}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.buttonDisabled
              ]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {currentStep === STEPS.length - 1 ? 'Create Account' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.footerNote}>
            Step {currentStep + 1} of {STEPS.length}
          </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d9488',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  stepsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 35,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#0d9488',
    zIndex: 1,
  },
  step: {
    alignItems: 'center',
    flex: 1,
    zIndex: 2,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  stepCircleActive: {
    backgroundColor: '#ffffff',
    borderColor: '#0d9488',
  },
  stepCircleCompleted: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  stepText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#0d9488',
    fontWeight: '600',
  },
  stepTextCompleted: {
    color: '#0d9488',
    fontWeight: '600',
  },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  stepContent: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1e293b',
    paddingRight: 40,
  },
  eyeButton: {
    padding: 8,
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  passwordStrengthContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  strengthLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  strengthBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  strengthProgress: {
    height: '100%',
    borderRadius: 3,
  },
  passwordRequirements: {
    marginTop: 12,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 12,
  },
  agreementsContainer: {
    marginTop: 20,
  },
  agreementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 16,
  },
  agreementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  agreementCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreementCheckboxChecked: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  agreementLink: {
    color: '#0d9488',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f766e',
    marginTop: 16,
    marginBottom: 8,
  },
  locationDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdfa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  privacyNoteText: {
    fontSize: 12,
    color: '#047857',
    flex: 1,
  },
  preferencesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  preferenceCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceText: {
    fontSize: 16,
    color: '#334155',
  },
  reviewContainer: {
    maxHeight: 400,
  },
  reviewSection: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  reviewLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  reviewValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  confirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0fdfa',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  confirmationText: {
    fontSize: 14,
    color: '#0f766e',
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0d9488',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footerNote: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 12,
  },
  stepActive: {},
  stepCompleted: {},
});