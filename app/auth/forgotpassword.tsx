import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import {
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `handyhub://reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setIsSubmitted(true);
        Alert.alert('Email Sent!', 'Password reset instructions have been sent to your email.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  const handleBackToLogin = () => {
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
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed-outline" size={40} color="#0d9488" />
              </View>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                {isSubmitted 
                  ? 'Check your email for reset instructions'
                  : 'Enter your email to receive reset instructions'}
              </Text>
            </View>

            {!isSubmitted && (
              <View style={styles.form}>
                {/* Email Input */}
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#0d9488" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color="#0d9488" />
                  <Text style={styles.infoText}>
                    Well send you an email with instructions to reset your password.
                  </Text>
                </View>

                {/* Reset Button */}
                <LinearGradient
                  colors={['#0d9488', '#0f766e']}
                  style={styles.submitButton}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                >
                  <TouchableOpacity
                    style={styles.submitButtonInner}
                    onPress={handleResetPassword}
                  >
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                  </TouchableOpacity>
                </LinearGradient>

                {/* Back to Login */}
                <TouchableOpacity 
                  onPress={handleBackToLogin} 
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={20} color="#0d9488" />
                  <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}

            {isSubmitted && (
              <View style={styles.form}>
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={60} color="#10b981" />
                  <Text style={styles.successTitle}>Email Sent!</Text>
                  <Text style={styles.successText}>
                    Weve sent password reset instructions to:
                  </Text>
                  <Text style={styles.emailText}>{email}</Text>
                  <Text style={styles.successSubtext}>
                    Please check your inbox and follow the link to reset your password.
                  </Text>
                </View>

                {/* Resend Button */}
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>
                    {loading ? 'Sending...' : "Didn't receive? Resend Email"}
                  </Text>
                </TouchableOpacity>

                {/* Back to Login */}
                <LinearGradient
                  colors={['#0d9488', '#0f766e']}
                  style={styles.submitButton}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                >
                  <TouchableOpacity
                    style={styles.submitButtonInner}
                    onPress={handleBackToLogin}
                  >
                    <Text style={styles.submitButtonText}>Back to Login</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
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
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 20,
    borderRadius: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#99f6e4',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
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
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
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
    paddingRight: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdfa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#134e4a',
    marginLeft: 10,
    lineHeight: 20,
  },
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
  submitButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  backButtonText: {
    color: '#0d9488',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d9488',
    marginTop: 15,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0d9488',
    marginBottom: 15,
  },
  successSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  resendButton: {
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
  },
  resendButtonText: {
    color: '#0d9488',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});