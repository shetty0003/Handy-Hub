// auth/login.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { getUserProfile } from '../../utils/profileHelper';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    Alert.alert('Invalid Email', 'Please enter a valid email address');
    return;
  }

  setLoading(true);
  try {
    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        Alert.alert(
          'Login Failed',
          'Invalid email or password. Please check your credentials and try again.'
        );
      } else if (authError.message.includes('Email not confirmed')) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in. Check your inbox for the verification link.'
        );
      } else if (authError.message.includes('rate limit')) {
        Alert.alert(
          'Too Many Attempts',
          'Please wait a few minutes before trying again.'
        );
      } else {
        Alert.alert('Login Failed', authError.message);
      }
      return;
    }

    if (!authData.user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const profile = await getUserProfile(authData.user.id);

    // 4. Route based on user type
    if (profile?.user_type === 'provider') {
      // Check verification status for providers
      if (profile.verification_status !== 'verified') {
        Alert.alert(
          'Account Under Review',
          'Your provider account is still under review. You\'ll be notified once verified.',
          [{ text: 'OK', onPress: () => router.replace('/(provider-tabs)') }]
        );
      } else {
        router.replace('/(provider-tabs)');
      }
    } else {
      // Customer or default
      router.replace('/(tabs)');
    }

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Network error detection
    if (error.message?.includes('Network request failed') || 
        error.message?.includes('fetch')) {
      Alert.alert(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection.'
      );
    } else {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }

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
              <Text style={styles.title}>Handy Hub</Text>
              <Text style={styles.subtitle}>Welcome Back!</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#c9bd14ff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#c9bd14ff" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
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

              <TouchableOpacity 
                onPress={() => router.push('/auth/forgotpassword')} 
                style={styles.forgotContainer}
                disabled={loading}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <LinearGradient
                colors={['#0d9488', '#0f766e']}
                style={styles.submitButton}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
              >
                <TouchableOpacity
                  style={styles.submitButtonInner}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>

              <TouchableOpacity 
                onPress={() => router.push('/auth/signin')} 
                style={styles.switchButton}
                disabled={loading}
              >
                <Text style={styles.switchButtonText}>
                  Dont have an account? Create one
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
    shadowColor: '#c9bd14ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#c9bd14ff',
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
    borderWidth: 2,
    borderColor: '#FFD700',
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
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 30,
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
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  forgotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: '#0d9488',
  },
  submitButton: {
    height: 55,
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
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
  switchButton: {
    alignItems: 'center',
    padding: 10,
  },
  switchButtonText: {
    color: '#0d9488',
    fontSize: 16,
  },
});