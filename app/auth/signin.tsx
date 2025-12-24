import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
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
  ActivityIndicator
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

export default function SignInPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    retypePassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.retypePassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the terms and privacy policy');
      return;
    }

    setLoading(true);
    try {
      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: 'customer', // CRITICAL: This triggers customer profile creation
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          Alert.alert('Email Exists', 'This email is already registered. Please try logging in.');
        } else if (authError.message.includes('Invalid email')) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
        } else {
          Alert.alert('Sign Up Failed', authError.message);
        }
        return;
      }

      if (authData.user) {
        // Verify profile was created (trigger handles this)
        const { error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.warn('Profile check warning:', profileError.message);
          // Continue anyway - trigger should have created it
        }

        Alert.alert(
          'Success!',
          'Your account has been created. Please check your email to verify your account.',
          [{ 
            text: 'Go to App', 
            onPress: () => router.replace('/(tabs)') 
          }]
        );
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
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
          >
            <CustomLogo />

            <View style={styles.header}>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>Join the Handy Hub Community</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={formData.fullName}
                  onChangeText={handleInputChange('fullName')}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={handleInputChange('email')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
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

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Retype Password"
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

              <TouchableOpacity 
                style={styles.termsContainer} 
                onPress={() => setAgreeTerms(!agreeTerms)}
                disabled={loading}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the <Text style={styles.termsLink}>Terms & Privacy</Text>
                </Text>
              </TouchableOpacity>

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
                      <Text style={styles.loadingText}>Creating Account...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>

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
    justifyContent: 'center',
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
    marginBottom: 40,
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  form: {
    marginTop: 20,
    padding: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 7,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: { position: 'relative', marginBottom: 20 },
  inputIcon: {
    position: 'absolute',
    left: 20,
    top: 18,
    zIndex: 1,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingLeft: 50,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#0d9488',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0d9488',
  },
  termsText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  termsLink: { color: '#0d9488', textDecorationLine: 'underline' },
  submitButton: {
    height: 55,
    borderRadius: 25,
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
  switchButtonText: { color: '#0d9488', fontSize: 16 },
});