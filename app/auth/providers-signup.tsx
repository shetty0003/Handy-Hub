import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';

const { width } = Dimensions.get('window');

// Service categories with icons
const SERVICE_CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: 'pipe', color: '#3b82f6' },
  { id: 'electrical', label: 'Electrical', icon: 'flash', color: '#f59e0b' },
  { id: 'cleaning', label: 'Cleaning', icon: 'broom', color: '#10b981' },
  { id: 'handyman', label: 'Handyman', icon: 'tools', color: '#8b5cf6' },
  { id: 'painting', label: 'Painting', icon: 'brush', color: '#ec4899' },
  { id: 'carpentry', label: 'Carpentry', icon: 'hammer', color: '#f97316' },
  { id: 'landscaping', label: 'Landscaping', icon: 'tree', color: '#22c55e' },
  { id: 'hvac', label: 'HVAC', icon: 'thermometer', color: '#06b6d4' },
  { id: 'appliance', label: 'Appliance Repair', icon: 'washing-machine', color: '#6366f1' },
  { id: 'moving', label: 'Moving Services', icon: 'truck', color: '#14b8a6' },
];

// Service areas
const SERVICE_AREAS = [
  { id: '10mi', label: 'Within 10 miles', radius: 10 },
  { id: '25mi', label: 'Within 25 miles', radius: 25 },
  { id: '50mi', label: 'Within 50 miles', radius: 50 },
  { id: 'city', label: 'City-wide', radius: 0 },
  { id: 'county', label: 'County-wide', radius: 0 },
];

const PROVIDER_STEPS = [
  { id: 'personal', title: 'Personal Info', icon: 'person' },
  { id: 'business', title: 'Business Info', icon: 'business' },
  { id: 'services', title: 'Services', icon: 'construct' },
  { id: 'documents', title: 'Documents', icon: 'document' },
  { id: 'account', title: 'Account', icon: 'lock-closed' },
  { id: 'review', title: 'Review', icon: 'checkmark-circle' },
];

interface Document {
  id: string;
  type: string;
  label: string;
  required: boolean;
  fileUri: string | null;
  fileName: string | null;
  fileSize: number | null;
  uploaded: boolean;
  uploading: boolean;
  error?: string;
}

interface ProviderFormData {
  // Personal Info
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    profilePicture: string | null;
  };
  
  // Business Info
  businessInfo: {
    businessName: string;
    businessType: string;
    businessAddress: string;
    businessDescription: string;
    yearsOfExperience: string;
    teamSize: string;
  };
  
  // Service Details
  serviceDetails: {
    categories: string[];
    specialties: string[];
    hourlyRate: string;
    serviceAreas: string[];
    emergencyService: boolean;
    warrantyOffered: boolean;
  };
  
  // Account Security
  account: {
    password: string;
    confirmPassword: string;
    twoFactorAuth: boolean;
  };
  
  // Agreements
  agreements: {
    terms: boolean;
    privacy: boolean;
    providerAgreement: boolean;
    backgroundCheck: boolean;
  };
}

export default function AdvancedProviderSignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProviderFormData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      profilePicture: null,
    },
    businessInfo: {
      businessName: '',
      businessType: '',
      businessAddress: '',
      businessDescription: '',
      yearsOfExperience: '',
      teamSize: '1',
    },
    serviceDetails: {
      categories: [],
      specialties: [],
      hourlyRate: '',
      serviceAreas: [],
      emergencyService: false,
      warrantyOffered: false,
    },
    account: {
      password: '',
      confirmPassword: '',
      twoFactorAuth: true,
    },
    agreements: {
      terms: false,
      privacy: false,
      providerAgreement: false,
      backgroundCheck: false,
    }
  });
  
  const [documents, setDocuments] = useState<Document[]>([
    { id: 'license', type: 'license', label: 'Professional License', required: true, fileUri: null, fileName: null, fileSize: null, uploaded: false, uploading: false },
    { id: 'insurance', type: 'insurance', label: 'Insurance Certificate', required: true, fileUri: null, fileName: null, fileSize: null, uploaded: false, uploading: false },
    { id: 'id', type: 'id', label: 'Government ID', required: true, fileUri: null, fileName: null, fileSize: null, uploaded: false, uploading: false },
    { id: 'certification', type: 'certification', label: 'Certification (Optional)', required: false, fileUri: null, fileName: null, fileSize: null, uploaded: false, uploading: false },
    { id: 'business_reg', type: 'business_reg', label: 'Business Registration (Optional)', required: false, fileUri: null, fileName: null, fileSize: null, uploaded: false, uploading: false },
    { id: 'tax_id', type: 'tax_id', label: 'Tax ID Document (Optional)', required: false, fileUri: null, fileName: null, fileSize: null, uploaded: false, uploading: false },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const [activeField, setActiveField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [businessNameAvailable, setBusinessNameAvailable] = useState<boolean | null>(null);
  const [businessNameChecking, setBusinessNameChecking] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const passwordRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animations
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / PROVIDER_STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 12) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;
    return Math.min(score, 100);
  };

  // Check email availability with debounce
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(async () => {
      setEmailChecking(true);
      try {
        // Check if email exists in auth
        const { data: existingUser } = await supabase
          .from('providers')
          .select('email')
          .eq('email', email.trim().toLowerCase())
          .single();

        setEmailAvailable(!existingUser);
      } catch (error) {
        // No user found is good
        setEmailAvailable(true);
      } finally {
        setEmailChecking(false);
      }
    }, 500);
  };

  // Check business name availability
  const checkBusinessNameAvailability = async (businessName: string) => {
    if (!businessName.trim()) {
      setBusinessNameAvailable(null);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(async () => {
      setBusinessNameChecking(true);
      try {
        const { data: existingBusiness } = await supabase
          .from('providers')
          .select('business_name')
          .eq('business_name', businessName.trim())
          .single();

        setBusinessNameAvailable(!existingBusiness);
      } catch (error) {
        setBusinessNameAvailable(true);
      } finally {
        setBusinessNameChecking(false);
      }
    }, 500);
  };

  // Handle profile picture upload
 const handleProfilePicturePick = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Gallery access is needed to upload profile picture');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        profilePicture: result.assets[0].uri
      }
    }));
  }
  setImageModalVisible(false);
};

  // Handle input change with real-time validation
  const handleInputChange = (section: keyof ProviderFormData, field: string) => (value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Update password strength in real-time
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Real-time validation
    if (field === 'email') {
      checkEmailAvailability(value);
    }
    
    if (field === 'businessName') {
      checkBusinessNameAvailability(value);
    }
  };

  // Handle document pick and upload
  const handleDocumentPick = async (documentId: string) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Access to files is needed to upload documents');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.9,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0].uri) {
        const asset = result.assets[0];
        
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size || 0 : 0;
        
        // Check file size (max 10MB)
        if (fileSize > 10 * 1024 * 1024) {
          Alert.alert('File too large', 'Maximum file size is 10MB');
          return;
        }

        // Update document state
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { 
                ...doc, 
                fileUri: asset.uri, 
                fileName: asset.fileName || `document_${Date.now()}`,
                fileSize,
                error: undefined
              }
            : doc
        ));
      }
    } catch (error) {
      console.error('Document pick error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  // Add this function before the validateStep function
const validatePhoneNumber = (phone: string): boolean => {
  // Basic validation - at least 10 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};
  // Upload document to storage
  const uploadDocumentToStorage = async (document: Document, userId: string) => {
    if (!document.fileUri) return null;
    
    try {
      // Update uploading state
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, uploading: true, error: undefined }
          : doc
      ));
      
      const { uploadDocument } = await import('../utils/storage-setup');
      const { path, error } = await uploadDocument(
        userId,
        document.fileUri,
        document.type,
        document.fileName || undefined
      );
      
      if (error) {
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, uploading: false, error: 'Upload failed' }
            : doc
        ));
        return null;
      }
      
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, uploading: false, uploaded: true }
          : doc
      ));
      
      return path;
    } catch (error) {
      console.error('Upload document error:', error);
      setDocuments(prev => prev.map(doc => 
        doc.id === document.id 
          ? { ...doc, uploading: false, error: 'Upload failed' }
          : doc
      ));
      return null;
    }
  };

  // Remove document
  const handleRemoveDocument = (documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { 
            ...doc, 
            fileUri: null, 
            fileName: null, 
            fileSize: null, 
            uploaded: false,
            error: undefined
          }
        : doc
    ));
  };

  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Personal Info
        if (!formData.personalInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.personalInfo.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) newErrors.email = 'Invalid email format';
        else if (emailAvailable === false) newErrors.email = 'Email already registered';
        if (!formData.personalInfo.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!validatePhoneNumber(formData.personalInfo.phone)) newErrors.phone = 'Please enter a valid phone number (minimum 10 digits)';
        break;
      case 1: // Business Info
        if (!formData.businessInfo.businessName.trim()) newErrors.businessName = 'Business name is required';
        else if (businessNameAvailable === false) newErrors.businessName = 'Business name already taken';
        if (!formData.businessInfo.businessType.trim()) newErrors.businessType = 'Business type is required';
        if (!formData.businessInfo.businessAddress.trim()) newErrors.businessAddress = 'Business address is required';
        if (!formData.businessInfo.yearsOfExperience) newErrors.experience = 'Years of experience is required';
        else if (parseInt(formData.businessInfo.yearsOfExperience) < 0) newErrors.experience = 'Years must be positive';
        break;
      case 2: // Services
        if (formData.serviceDetails.categories.length === 0) newErrors.categories = 'Select at least one service category';
        if (!formData.serviceDetails.hourlyRate) newErrors.hourlyRate = 'Hourly rate is required';
        else if (parseFloat(formData.serviceDetails.hourlyRate) < 10) newErrors.hourlyRate = 'Minimum hourly rate is $10';
        if (formData.serviceDetails.serviceAreas.length === 0) newErrors.serviceAreas = 'Select service areas';
        break;
      case 3: // Documents
        const requiredDocuments = documents.filter(doc => doc.required);
        const missingRequired = requiredDocuments.filter(doc => !doc.fileUri);
        if (missingRequired.length > 0) {
          newErrors.documents = `${missingRequired.length} required document(s) missing`;
        }
        break;
      case 4: // Account
        if (!formData.account.password) newErrors.password = 'Password is required';
        else if (formData.account.password.length < 12) newErrors.password = 'Minimum 12 characters required';
        else if (passwordStrength < 60) newErrors.password = 'Password is too weak';
        if (formData.account.password !== formData.account.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.agreements.terms) newErrors.terms = 'You must accept Terms of Service';
        if (!formData.agreements.privacy) newErrors.privacy = 'You must accept Privacy Policy';
        if (!formData.agreements.providerAgreement) newErrors.providerAgreement = 'You must accept Provider Agreement';
        if (!formData.agreements.backgroundCheck) newErrors.backgroundCheck = 'You must accept Background Check Terms';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < PROVIDER_STEPS.length - 1) {
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
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.personalInfo.email.trim(),
        password: formData.account.password,
        phone: formData.personalInfo.phone,
        options: {
          data: {
            full_name: formData.personalInfo.fullName.trim(),
            user_type: 'provider',
            profile_picture: formData.personalInfo.profilePicture,
            business_name: formData.businessInfo.businessName,
            business_type: formData.businessInfo.businessType,
            business_address: formData.businessInfo.businessAddress,
            years_of_experience: parseInt(formData.businessInfo.yearsOfExperience) || 0,
            service_categories: formData.serviceDetails.categories,
            hourly_rate: parseFloat(formData.serviceDetails.hourlyRate) || 0,
            service_areas: formData.serviceDetails.serviceAreas,
            verification_status: 'pending',
            approval_status: 'under_review'
          },
          emailRedirectTo: 'handyhub://auth/callback'
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const userId = authData.user.id;
        
        // 2. Upload profile picture if exists
        let profilePictureUrl = null;
        if (formData.personalInfo.profilePicture) {
          try {
            const { uploadProfilePicture } = await import('../utils/storage-setup');
            const { url, error } = await uploadProfilePicture(
              userId,
              formData.personalInfo.profilePicture
            );
            
            if (!error) {
              profilePictureUrl = url;
            }
          } catch (uploadError) {
            console.log('Profile picture upload failed, continuing...');
          }
        }

        // 3. Skip provider profile creation - data is in auth metadata
        // Continue with other operations

        // 4. Create verification status record
        try {
          await supabase
            .from('provider_verification_status')
            .insert({
              provider_id: userId,
              email_verified: false,
              documents_uploaded: false,
              documents_verified: false,
              background_check_passed: false,
              verification_step: 'email_pending'
            });
        } catch (verificationError) {
          console.error('Verification status creation error:', verificationError);
        }

        // 5. Upload documents in background
        let uploadedDocumentsCount = 0;
        setTimeout(async () => {
          try {
            for (const document of documents) {
              if (document.fileUri && !document.uploaded) {
                const filePath = await uploadDocumentToStorage(document, userId);
                
                if (filePath) {
                  uploadedDocumentsCount++;
                  
                  // Save document record in database
                  await supabase
                    .from('provider_documents')
                    .insert({
                      provider_id: userId,
                      document_type: document.type,
                      document_name: document.label,
                      file_path: filePath,
                      file_size: document.fileSize,
                      file_type: document.fileName?.split('.').pop() || 'unknown',
                      verification_status: 'pending',
                      created_at: new Date().toISOString()
                    });
                }
              }
            }
            
            // Update verification status if documents were uploaded
            if (uploadedDocumentsCount > 0) {
              await supabase
                .from('provider_verification_status')
                .update({
                  documents_uploaded: true,
                  updated_at: new Date().toISOString()
                })
                .eq('provider_id', userId);
            }
          } catch (docError) {
            console.error('Document upload background error:', docError);
          }
        }, 1000);

        // 6. Initiate background check in background
        setTimeout(async () => {
          try {
            const backgroundCheckResult = await initiateBackgroundCheck(
              userId,
              formData.personalInfo.fullName,
              formData.personalInfo.email
            );
            
            if (backgroundCheckResult) {
              await supabase
                .from('provider_verification_status')
                .update({
                  background_check_id: backgroundCheckResult.check_id,
                  verification_step: 'background_pending',
                  updated_at: new Date().toISOString()
                })
                .eq('provider_id', userId);
            }
          } catch (bgError) {
            console.error('Background check initiation error:', bgError);
          }
        }, 2000);

        // 7. Send verification email
        try {
          const { error: emailError } = await supabase.auth.resend({
            type: 'signup',
            email: formData.personalInfo.email,
            options: {
              emailRedirectTo: 'handyhub://auth/callback'
            }
          });
          
          if (emailError) {
            console.error('Verification email error:', emailError);
          }
        } catch (emailError) {
          console.error('Verification email error:', emailError);
        }

        // 8. Show success and navigate
        Alert.alert(
          'Application Submitted Successfully! 🎉',
          '✅ Your provider application has been received!\n\n' +
          '📧 Check your email to verify your account\n' +
          '📋 Your application is under review (3-5 business days)\n' +
          '📄 ' + (uploadedDocumentsCount > 0 ? 
            `${uploadedDocumentsCount} document(s) uploaded` : 
            'Upload required documents in your dashboard') + '\n' +
          '🔒 We will contact you for verification updates',
          [
            { 
              text: 'Go to Dashboard', 
              onPress: () => router.replace('/(provider-tabs)')
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Provider signup error:', error);
      
      let errorMessage = 'Registration failed. ';
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Background check integration (placeholder)
  const initiateBackgroundCheck = async (
    providerId: string, 
    fullName: string, 
    email: string
  ) => {
    // This is a placeholder for integration with services like Checkr, GoodHire, etc.
    // In production, you would call their API here
    
    console.log(`Initiating background check for: ${fullName} (${email})`);
    
    // Simulate API call
    return {
      check_id: `check_${Date.now()}_${providerId}`,
      status: 'initiated',
      estimated_completion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep();
      case 1:
        return renderBusinessInfoStep();
      case 2:
        return renderServicesStep();
      case 3:
        return renderDocumentsStep();
      case 4:
        return renderAccountStep();
      case 5:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderPersonalInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      {/* Profile Picture */}
      <TouchableOpacity 
        style={styles.profilePictureContainer}
        onPress={() => setImageModalVisible(true)}
      >
        {formData.personalInfo.profilePicture ? (
          <Image source={{ uri: formData.personalInfo.profilePicture }} style={styles.profilePicture} />
        ) : (
          <View style={styles.profilePicturePlaceholder}>
            <Ionicons name="person" size={40} color="#94a3b8" />
          </View>
        )}
        <View style={styles.profilePictureOverlay}>
          <Ionicons name="camera" size={20} color="white" />
        </View>
      </TouchableOpacity>
      <Text style={styles.profilePictureLabel}>Tap to add profile photo</Text>

      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
          <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#94a3b8"
            value={formData.personalInfo.fullName}
            onChangeText={handleInputChange('personalInfo', 'fullName')}
          />
        </View>
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      {/* Email with availability check */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
          <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="john@example.com"
            placeholderTextColor="#94a3b8"
            value={formData.personalInfo.email}
            onChangeText={handleInputChange('personalInfo', 'email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailChecking && (
            <View style={styles.inputStatusIcon}>
              <ActivityIndicator size="small" color="#0d9488" />
            </View>
          )}
          {emailAvailable === true && !emailChecking && (
            <Ionicons name="checkmark-circle" size={20} color="#10b981" style={styles.inputStatusIcon} />
          )}
          {emailAvailable === false && !emailChecking && (
            <Ionicons name="close-circle" size={20} color="#ef4444" style={styles.inputStatusIcon} />
          )}
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        {emailAvailable === true && !errors.email && (
          <Text style={styles.successText}>✓ Email is available</Text>
        )}
        {emailAvailable === false && !errors.email && (
          <Text style={styles.warningText}>✗ Email already registered</Text>
        )}
      </View>

      {/* Phone Number */}
      
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
      style={styles.input}
      placeholder="Enter phone number"
      placeholderTextColor="#94a3b8"
      value={formData.personalInfo.phone}
      onChangeText={handleInputChange('personalInfo', 'phone')}
      onFocus={() => setActiveField('phone')}
      onBlur={() => setActiveField(null)}
      keyboardType="phone-pad"
      autoComplete="tel"
      editable={!loading}
      returnKeyType="next"
      onSubmitEditing={() => passwordRef.current?.focus()}
    />
    {formData.personalInfo.phone && (
      <TouchableOpacity
        style={styles.clearButton}
        onPress={() => handleInputChange('personalInfo', 'phone')('')}
        disabled={loading}
      >
        <Ionicons name="close-circle" size={20} color="#94a3b8" />
      </TouchableOpacity>
    )}
  </View>
  {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
</View>
    </View>
  );

  const renderBusinessInfoStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Business Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your business</Text>

      {/* Business Name with availability check */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Name *</Text>
        <View style={[styles.inputContainer, errors.businessName && styles.inputError]}>
          <Ionicons name="business-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="ABC Plumbing Services"
            placeholderTextColor="#94a3b8"
            value={formData.businessInfo.businessName}
            onChangeText={handleInputChange('businessInfo', 'businessName')}
          />
          {businessNameChecking && (
            <View style={styles.inputStatusIcon}>
              <ActivityIndicator size="small" color="#0d9488" />
            </View>
          )}
          {businessNameAvailable === true && !businessNameChecking && (
            <Ionicons name="checkmark-circle" size={20} color="#10b981" style={styles.inputStatusIcon} />
          )}
          {businessNameAvailable === false && !businessNameChecking && (
            <Ionicons name="close-circle" size={20} color="#ef4444" style={styles.inputStatusIcon} />
          )}
        </View>
        {errors.businessName && <Text style={styles.errorText}>{errors.businessName}</Text>}
        {businessNameAvailable === true && !errors.businessName && (
          <Text style={styles.successText}>✓ Business name is available</Text>
        )}
        {businessNameAvailable === false && !errors.businessName && (
          <Text style={styles.warningText}>✗ Business name already taken</Text>
        )}
      </View>

      {/* Business Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Type *</Text>
        <View style={[styles.inputContainer, errors.businessType && styles.inputError]}>
          <Ionicons name="briefcase-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Sole Proprietorship, LLC, Corporation"
            placeholderTextColor="#94a3b8"
            value={formData.businessInfo.businessType}
            onChangeText={handleInputChange('businessInfo', 'businessType')}
          />
        </View>
        {errors.businessType && <Text style={styles.errorText}>{errors.businessType}</Text>}
      </View>

      {/* Business Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Address *</Text>
        <View style={[styles.inputContainer, errors.businessAddress && styles.inputError]}>
          <Ionicons name="location-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="123 Main St, City, State ZIP"
            placeholderTextColor="#94a3b8"
            value={formData.businessInfo.businessAddress}
            onChangeText={handleInputChange('businessInfo', 'businessAddress')}
            multiline
          />
        </View>
        {errors.businessAddress && <Text style={styles.errorText}>{errors.businessAddress}</Text>}
      </View>

      {/* Years of Experience */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Years of Experience *</Text>
        <View style={[styles.inputContainer, errors.experience && styles.inputError]}>
          <Ionicons name="time-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="5"
            placeholderTextColor="#94a3b8"
            value={formData.businessInfo.yearsOfExperience}
            onChangeText={handleInputChange('businessInfo', 'yearsOfExperience')}
            keyboardType="number-pad"
          />
        </View>
        {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
      </View>

      {/* Team Size */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Team Size</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="people-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Number of employees"
            placeholderTextColor="#94a3b8"
            value={formData.businessInfo.teamSize}
            onChangeText={handleInputChange('businessInfo', 'teamSize')}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Business Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Description</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your business, services, and expertise..."
            placeholderTextColor="#94a3b8"
            value={formData.businessInfo.businessDescription}
            onChangeText={handleInputChange('businessInfo', 'businessDescription')}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>
        <Text style={styles.charCount}>
          {formData.businessInfo.businessDescription.length}/500 characters
        </Text>
      </View>
    </View>
  );

  const renderServicesStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Service Details</Text>
      <Text style={styles.stepSubtitle}>What services do you offer?</Text>

      {/* Service Categories */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Service Categories *</Text>
        {errors.categories && <Text style={styles.errorText}>{errors.categories}</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {SERVICE_CATEGORIES.map((category) => {
            const isSelected = formData.serviceDetails.categories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                onPress={() => {
                  setFormData(prev => {
                    const newCategories = isSelected
                      ? prev.serviceDetails.categories.filter(id => id !== category.id)
                      : [...prev.serviceDetails.categories, category.id];
                    return {
                      ...prev,
                      serviceDetails: {
                        ...prev.serviceDetails,
                        categories: newCategories
                      }
                    };
                  });
                  if (errors.categories) setErrors(prev => ({ ...prev, categories: '' }));
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <MaterialCommunityIcons name={category.icon as any} size={24} color="white" />
                </View>
                <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Specialties */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Specialties (optional)</Text>
        <View style={styles.tagsContainer}>
          {formData.serviceDetails.specialties.map((specialty, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{specialty}</Text>
              <TouchableOpacity onPress={() => {
                setFormData(prev => ({
                  ...prev,
                  serviceDetails: {
                    ...prev.serviceDetails,
                    specialties: prev.serviceDetails.specialties.filter((_, i) => i !== index)
                  }
                }));
              }}>
                <Ionicons name="close" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            style={styles.tagInput}
            placeholder="Add specialty (press Enter)"
            placeholderTextColor="#94a3b8"
            onSubmitEditing={(e) => {
              if (e.nativeEvent.text.trim()) {
                setFormData(prev => ({
                  ...prev,
                  serviceDetails: {
                    ...prev.serviceDetails,
                    specialties: [...prev.serviceDetails.specialties, e.nativeEvent.text.trim()]
                  }
                }));
              }
            }}
          />
        </View>
      </View>

      {/* Hourly Rate */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Hourly Rate ($) *</Text>
        <View style={[styles.inputContainer, errors.hourlyRate && styles.inputError]}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={[styles.input, { paddingLeft: 40 }]}
            placeholder="75.00"
            placeholderTextColor="#94a3b8"
            value={formData.serviceDetails.hourlyRate}
            onChangeText={handleInputChange('serviceDetails', 'hourlyRate')}
            keyboardType="decimal-pad"
          />
        </View>
        {errors.hourlyRate && <Text style={styles.errorText}>{errors.hourlyRate}</Text>}
      </View>

      {/* Service Areas */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Service Areas *</Text>
        {errors.serviceAreas && <Text style={styles.errorText}>{errors.serviceAreas}</Text>}
        <View style={styles.serviceAreasGrid}>
          {SERVICE_AREAS.map((area) => {
            const isSelected = formData.serviceDetails.serviceAreas.includes(area.id);
            return (
              <TouchableOpacity
                key={area.id}
                style={[styles.areaCard, isSelected && styles.areaCardSelected]}
                onPress={() => {
                  setFormData(prev => {
                    const newAreas = isSelected
                      ? prev.serviceDetails.serviceAreas.filter(id => id !== area.id)
                      : [...prev.serviceDetails.serviceAreas, area.id];
                    return {
                      ...prev,
                      serviceDetails: {
                        ...prev.serviceDetails,
                        serviceAreas: newAreas
                      }
                    };
                  });
                  if (errors.serviceAreas) setErrors(prev => ({ ...prev, serviceAreas: '' }));
                }}
              >
                <Ionicons 
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={20} 
                  color={isSelected ? '#0d9488' : '#64748b'} 
                />
                <Text style={[styles.areaLabel, isSelected && styles.areaLabelSelected]}>
                  {area.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Additional Options */}
      <View style={styles.optionsContainer}>
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionLabel}>Emergency Service</Text>
            <Text style={styles.optionDescription}>Available 24/7 for urgent needs</Text>
          </View>
          <Switch
            value={formData.serviceDetails.emergencyService}
            onValueChange={(value) => {
              setFormData(prev => ({
                ...prev,
                serviceDetails: { ...prev.serviceDetails, emergencyService: value }
              }));
            }}
            trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
            thumbColor={formData.serviceDetails.emergencyService ? '#0d9488' : '#94a3b8'}
          />
        </View>

        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionLabel}>Warranty Offered</Text>
            <Text style={styles.optionDescription}>Provide warranty for your work</Text>
          </View>
          <Switch
            value={formData.serviceDetails.warrantyOffered}
            onValueChange={(value) => {
              setFormData(prev => ({
                ...prev,
                serviceDetails: { ...prev.serviceDetails, warrantyOffered: value }
              }));
            }}
            trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
            thumbColor={formData.serviceDetails.warrantyOffered ? '#0d9488' : '#94a3b8'}
          />
        </View>
      </View>
    </View>
  );

  const renderDocumentsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Required Documents</Text>
      <Text style={styles.stepSubtitle}>Upload verification documents</Text>
      
      <View style={styles.documentsContainer}>
        {documents.map((document) => (
          <View key={document.id} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>
                  {document.label}
                  {document.required && <Text style={styles.requiredStar}> *</Text>}
                </Text>
                {document.fileName && (
                  <Text style={styles.documentFileName} numberOfLines={1}>
                    {document.fileName}
                  </Text>
                )}
                {document.fileSize && (
                  <Text style={styles.documentFileSize}>
                    {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Text>
                )}
              </View>
              
              <View style={styles.documentStatus}>
                {document.uploading && (
                  <View>
                    <ActivityIndicator size="small" color="#0d9488" />
                  </View>
                )}
                {document.uploaded && !document.uploading && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
                {document.error && !document.uploading && (
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                )}
              </View>
            </View>
            
            <View style={styles.documentActions}>
              {document.fileUri ? (
                <>
                  <TouchableOpacity
                    style={styles.documentButton}
                    onPress={() => handleDocumentPick(document.id)}
                  >
                    <Ionicons name="refresh" size={16} color="#0d9488" />
                    <Text style={styles.documentButtonText}>Replace</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.documentButton, styles.documentButtonRemove]}
                    onPress={() => handleRemoveDocument(document.id)}
                  >
                    <Ionicons name="trash" size={16} color="#ef4444" />
                    <Text style={[styles.documentButtonText, styles.documentButtonTextRemove]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.documentButtonPrimary}
                  onPress={() => handleDocumentPick(document.id)}
                  disabled={document.uploading}
                >
                  <Ionicons name="cloud-upload" size={16} color="white" />
                  <Text style={styles.documentButtonPrimaryText}>
                    Upload Document
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {document.error && (
              <Text style={styles.documentError}>{document.error}</Text>
            )}
            
            {!document.required && (
              <Text style={styles.documentOptional}>Optional</Text>
            )}
          </View>
        ))}
      </View>
      
      <View style={styles.documentsDisclaimer}>
        <Ionicons name="information-circle" size={20} color="#f59e0b" />
        <Text style={styles.documentsDisclaimerText}>
          Required documents will be verified by our team. You can also upload them later in your dashboard.
          Maximum file size: 10MB per document.
        </Text>
      </View>
      
      {errors.documents && <Text style={styles.errorText}>{errors.documents}</Text>}
    </View>
  );

  const renderAccountStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Account Security</Text>
      <Text style={styles.stepSubtitle}>Create secure login credentials</Text>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password *</Text>
        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Create a strong password (min. 12 characters)"
            placeholderTextColor="#94a3b8"
            value={formData.account.password}
            onChangeText={handleInputChange('account', 'password')}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Password Strength */}
      {formData.account.password && (
        <View style={styles.passwordStrengthContainer}>
          <View style={styles.strengthBar}>
            <View 
              style={[
                styles.strengthProgress,
                { 
                  width: `${passwordStrength}%`,
                  backgroundColor: passwordStrength < 40 ? '#ef4444' : 
                                 passwordStrength < 70 ? '#f59e0b' : 
                                 passwordStrength < 90 ? '#3b82f6' : '#10b981'
                }
              ]} 
            />
          </View>
          <View style={styles.strengthTextContainer}>
            <Text style={styles.strengthText}>
              Strength: 
            </Text>
            <Text style={[
              styles.strengthValue,
              { 
                color: passwordStrength < 40 ? '#ef4444' : 
                       passwordStrength < 70 ? '#f59e0b' : 
                       passwordStrength < 90 ? '#3b82f6' : '#10b981'
              }
            ]}>
              {passwordStrength < 40 ? 'Weak' : 
               passwordStrength < 70 ? 'Fair' : 
               passwordStrength < 90 ? 'Good' : 'Strong'}
            </Text>
          </View>
        </View>
      )}

      {/* Confirm Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm Password *</Text>
        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor="#94a3b8"
            value={formData.account.confirmPassword}
            onChangeText={handleInputChange('account', 'confirmPassword')}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        {formData.account.confirmPassword && formData.account.password !== formData.account.confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
      </View>

      {/* 2FA */}
      <View style={styles.securityOptions}>
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionLabel}>Two-Factor Authentication</Text>
            <Text style={styles.optionDescription}>Recommended for business accounts</Text>
          </View>
          <Switch
            value={formData.account.twoFactorAuth}
            onValueChange={(value) => {
              setFormData(prev => ({
                ...prev,
                account: { ...prev.account, twoFactorAuth: value }
              }));
            }}
            trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
            thumbColor={formData.account.twoFactorAuth ? '#0d9488' : '#94a3b8'}
          />
        </View>
      </View>

      {/* Agreements */}
      <View style={styles.agreementsContainer}>
        <Text style={styles.agreementsTitle}>Legal Agreements</Text>
        
        <TouchableOpacity 
          style={styles.agreementItem}
          onPress={() => {
            setFormData(prev => ({
              ...prev,
              agreements: { ...prev.agreements, terms: !prev.agreements.terms }
            }));
            if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
          }}
          disabled={loading}
        >
          <View style={[
            styles.agreementCheckbox,
            formData.agreements.terms && styles.agreementCheckboxChecked
          ]}>
            {formData.agreements.terms && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.agreementText}>
            I agree to the Terms of Service
          </Text>
        </TouchableOpacity>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

        <TouchableOpacity 
          style={styles.agreementItem}
          onPress={() => {
            setFormData(prev => ({
              ...prev,
              agreements: { ...prev.agreements, privacy: !prev.agreements.privacy }
            }));
            if (errors.privacy) setErrors(prev => ({ ...prev, privacy: '' }));
          }}
          disabled={loading}
        >
          <View style={[
            styles.agreementCheckbox,
            formData.agreements.privacy && styles.agreementCheckboxChecked
          ]}>
            {formData.agreements.privacy && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.agreementText}>
            I agree to the Privacy Policy
          </Text>
        </TouchableOpacity>
        {errors.privacy && <Text style={styles.errorText}>{errors.privacy}</Text>}

        <TouchableOpacity 
          style={styles.agreementItem}
          onPress={() => {
            setFormData(prev => ({
              ...prev,
              agreements: { ...prev.agreements, providerAgreement: !prev.agreements.providerAgreement }
            }));
            if (errors.providerAgreement) setErrors(prev => ({ ...prev, providerAgreement: '' }));
          }}
          disabled={loading}
        >
          <View style={[
            styles.agreementCheckbox,
            formData.agreements.providerAgreement && styles.agreementCheckboxChecked
          ]}>
            {formData.agreements.providerAgreement && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.agreementText}>
            I agree to the Provider Agreement
          </Text>
        </TouchableOpacity>
        {errors.providerAgreement && <Text style={styles.errorText}>{errors.providerAgreement}</Text>}

        <TouchableOpacity 
          style={styles.agreementItem}
          onPress={() => {
            setFormData(prev => ({
              ...prev,
              agreements: { ...prev.agreements, backgroundCheck: !prev.agreements.backgroundCheck }
            }));
            if (errors.backgroundCheck) setErrors(prev => ({ ...prev, backgroundCheck: '' }));
          }}
          disabled={loading}
        >
          <View style={[
            styles.agreementCheckbox,
            formData.agreements.backgroundCheck && styles.agreementCheckboxChecked
          ]}>
            {formData.agreements.backgroundCheck && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.agreementText}>
            I consent to background verification
          </Text>
        </TouchableOpacity>
        {errors.backgroundCheck && <Text style={styles.errorText}>{errors.backgroundCheck}</Text>}
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review Application</Text>
      <Text style={styles.stepSubtitle}>Verify all information before submitting</Text>

      <ScrollView style={styles.reviewScroll} showsVerticalScrollIndicator={false}>
        {/* Personal Info Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Personal Information</Text>
          <ReviewItem label="Name" value={formData.personalInfo.fullName} />
          <ReviewItem label="Email" value={formData.personalInfo.email} />
          <ReviewItem label="Phone" value={formData.personalInfo.phone} />
          <ReviewItem 
            label="Profile Picture" 
            value={formData.personalInfo.profilePicture ? 'Uploaded' : 'Not uploaded'} 
            status={formData.personalInfo.profilePicture ? 'success' : 'warning'}
          />
        </View>

        {/* Business Info Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Business Information</Text>
          <ReviewItem label="Business Name" value={formData.businessInfo.businessName} />
          <ReviewItem label="Business Type" value={formData.businessInfo.businessType} />
          <ReviewItem label="Address" value={formData.businessInfo.businessAddress} />
          <ReviewItem label="Years of Experience" value={formData.businessInfo.yearsOfExperience} />
          <ReviewItem label="Team Size" value={formData.businessInfo.teamSize} />
        </View>

        {/* Services Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Service Details</Text>
          <ReviewItem 
            label="Categories" 
            value={formData.serviceDetails.categories
              .map(id => SERVICE_CATEGORIES.find(c => c.id === id)?.label)
              .join(', ') || 'None selected'} 
          />
          <ReviewItem label="Hourly Rate" value={`$${formData.serviceDetails.hourlyRate || '0'}`} />
          <ReviewItem label="Service Areas" value={formData.serviceDetails.serviceAreas
            .map(id => SERVICE_AREAS.find(a => a.id === id)?.label)
            .join(', ') || 'None selected'} 
          />
          <ReviewItem label="Emergency Service" value={formData.serviceDetails.emergencyService ? 'Yes' : 'No'} />
          <ReviewItem label="Warranty Offered" value={formData.serviceDetails.warrantyOffered ? 'Yes' : 'No'} />
        </View>

        {/* Documents Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Documents</Text>
          {documents.filter(doc => doc.required).map((doc) => (
            <ReviewItem
              key={doc.id}
              label={doc.label}
              value={doc.fileUri ? 'Uploaded' : 'Missing'}
              status={doc.fileUri ? 'success' : 'error'}
            />
          ))}
          {documents.filter(doc => !doc.required && doc.fileUri).map((doc) => (
            <ReviewItem
              key={doc.id}
              label={doc.label}
              value="Uploaded"
              status="success"
            />
          ))}
        </View>

        {/* Agreements Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Agreements</Text>
          <ReviewItem
            label="Terms of Service"
            value={formData.agreements.terms ? 'Accepted' : 'Not Accepted'}
            status={formData.agreements.terms ? 'success' : 'error'}
          />
          <ReviewItem
            label="Privacy Policy"
            value={formData.agreements.privacy ? 'Accepted' : 'Not Accepted'}
            status={formData.agreements.privacy ? 'success' : 'error'}
          />
          <ReviewItem
            label="Provider Agreement"
            value={formData.agreements.providerAgreement ? 'Accepted' : 'Not Accepted'}
            status={formData.agreements.providerAgreement ? 'success' : 'error'}
          />
          <ReviewItem
            label="Background Check"
            value={formData.agreements.backgroundCheck ? 'Accepted' : 'Not Accepted'}
            status={formData.agreements.backgroundCheck ? 'success' : 'error'}
          />
        </View>
      </ScrollView>

      {/* Final Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle" size={20} color="#0d9488" />
        <Text style={styles.disclaimerText}>
          By submitting, you certify that all information is accurate and complete. 
          Approval may take 3-5 business days. You will receive email notifications for each verification step.
        </Text>
      </View>
    </View>
  );

  const ReviewItem = ({ label, value, status }: { 
    label: string; 
    value: string | number; 
    status?: 'success' | 'error' | 'warning';
  }) => (
    <View style={styles.reviewItem}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <View style={styles.reviewValueContainer}>
        <Text style={[
          styles.reviewValue,
          status === 'error' && styles.reviewValueError,
          status === 'success' && styles.reviewValueSuccess,
          status === 'warning' && styles.reviewValueWarning
        ]}>
          {value}
        </Text>
        {status && (
          <Ionicons 
            name={status === 'error' ? 'close-circle' : status === 'success' ? 'checkmark-circle' : 'warning'} 
            size={16} 
            color={status === 'error' ? '#ef4444' : status === 'success' ? '#10b981' : '#f59e0b'} 
          />
        )}
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
          <Text style={styles.headerTitle}>Provider Application</Text>
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
          {PROVIDER_STEPS.map((step, index) => (
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
                  <Ionicons name="checkmark" size={14} color="white" />
                ) : (
                  <Ionicons name={step.icon as any} size={14} color={
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
                <View>
                  <ActivityIndicator color="white" size="small" />
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>
                  {currentStep === PROVIDER_STEPS.length - 1 ? 'Submit Application' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.footerNote}>
            Step {currentStep + 1} of {PROVIDER_STEPS.length} • {Math.round(((currentStep + 1) / PROVIDER_STEPS.length) * 100)}% Complete
          </Text>
        </View>
      </SafeAreaView>

      {/* Image Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>Choose Profile Picture</Text>
            <TouchableOpacity
              style={modalStyles.option}
              onPress={handleProfilePicturePick}
            >
              <Ionicons name="images" size={24} color="#0d9488" />
              <Text style={modalStyles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.option, modalStyles.cancel]}
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Modal styles
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  clearButton: {
  padding: 8,
  marginRight: 8,
},
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f766e',
    textAlign: 'center',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
  },
  cancel: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    marginTop: 8,
  },

  cancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
  },
});

// Main styles
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
    top: 30,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
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
  profilePictureContainer: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  profilePictureOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0d9488',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profilePictureLabel: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
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
  inputStatusIcon: {
    marginRight: 16,
  },
  currencySymbol: {
    position: 'absolute',
    left: 48,
    fontSize: 16,
    color: '#1e293b',
    zIndex: 1,
  },
  eyeButton: {
    padding: 8,
    marginRight: 8,
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
  },
  textAreaContainer: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  textArea: {
    fontSize: 16,
    color: '#1e293b',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryCard: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  categoryCardSelected: {
    backgroundColor: '#f0fdfa',
    borderColor: '#0d9488',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#0f766e',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#475569',
  },
  tagInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#1e293b',
    minWidth: 100,
  },
  serviceAreasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
    flex: 1,
    minWidth: '45%',
  },
  areaCardSelected: {
    backgroundColor: '#f0fdfa',
    borderColor: '#0d9488',
  },
  areaLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  areaLabelSelected: {
    color: '#0f766e',
    fontWeight: '600',
  },
  optionsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  documentsContainer: {
    marginBottom: 20,
  },
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
    marginRight: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  requiredStar: {
    color: '#ef4444',
  },
  documentFileName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  documentFileSize: {
    fontSize: 12,
    color: '#94a3b8',
  },
  documentStatus: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  documentButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  documentButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  documentButtonPrimaryText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  documentButtonRemove: {
    backgroundColor: '#fef2f2',
  },
  documentButtonTextRemove: {
    color: '#ef4444',
  },
  documentError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
  },
  documentOptional: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  documentsDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  documentsDisclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  passwordStrengthContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  strengthBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthProgress: {
    height: '100%',
    borderRadius: 3,
  },
  strengthTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthText: {
    fontSize: 12,
    color: '#64748b',
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  securityOptions: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
  reviewScroll: {
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
  reviewValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  reviewValueError: {
    color: '#ef4444',
  },
  reviewValueSuccess: {
    color: '#10b981',
  },
  reviewValueWarning: {
    color: '#f59e0b',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdfa',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#0f766e',
    lineHeight: 20,
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