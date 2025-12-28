// app/auth/success.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SignUpSuccessScreen() {
  const params = useLocalSearchParams<{
    type?: 'customer' | 'provider';
    email?: string;
    name?: string;
    business?: string;
    status?: string;
    verified?: string;
  }>();

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Success animation sequence
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const isProvider = params.type === 'provider';
  const isVerified = params.verified === 'true';
  
  const getTitle = () => {
    if (isProvider) {
      return 'Application Submitted!';
    }
    return isVerified ? 'Account Verified!' : 'Account Created!';
  };

  const getSubtitle = () => {
    if (isProvider) {
      return 'Your provider application is under review';
    }
    return isVerified 
      ? 'Your account is ready to use' 
      : 'Check your email to verify your account';
  };

  const getNextSteps = () => {
    if (isProvider) {
      return [
        '✅ Application received',
        '📋 Under review (3-5 business days)',
        '📧 Verification email sent',
        '📱 We\'ll contact you for next steps'
      ];
    }
    
    if (isVerified) {
      return [
        '✅ Email verified successfully',
        '🎉 Ready to book services',
        '🔒 Account secured',
        '🚀 Start exploring HandyHub'
      ];
    }
    
    return [
      '📧 Check your inbox',
      '📍 Click the verification link',
      '⏱️ Link expires in 24 hours',
      '🔄 Can\'t find it? Check spam folder'
    ];
  };

  const handleContinue = () => {
    if (isProvider) {
      // For providers, go to provider dashboard or home
      router.replace('/(provider-tabs)');
    } else {
      // For customers, go to main app
      router.replace('/(tabs)');
    }
  };

  const handleResendEmail = () => {
    // Implement resend email logic
    alert('Verification email resent!');
  };

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#d1fae5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View 
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <LinearGradient
              colors={['#10b981', '#0d9488']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={isProvider ? 'hourglass' : 'checkmark-circle'} 
                size={60} 
                color="white" 
              />
            </LinearGradient>
          </Animated.View>

          {/* Title & Subtitle */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </Animated.View>

          {/* User Info */}
          <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#0d9488" />
              <Text style={styles.infoLabel}>Account Type:</Text>
              <Text style={styles.infoValue}>
                {isProvider ? 'Service Provider' : 'Customer'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color="#0d9488" />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {params.email || 'Not provided'}
              </Text>
            </View>

            {params.name && (
              <View style={styles.infoRow}>
                <Ionicons name="person-circle" size={20} color="#0d9488" />
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{params.name}</Text>
              </View>
            )}

            {params.business && (
              <View style={styles.infoRow}>
                <Ionicons name="business" size={20} color="#0d9488" />
                <Text style={styles.infoLabel}>Business:</Text>
                <Text style={styles.infoValue}>{params.business}</Text>
              </View>
            )}

            {params.status && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#0d9488" />
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={[
                  styles.infoValue,
                  params.status === 'under_review' && styles.statusPending
                ]}>
                  {params.status === 'under_review' ? 'Under Review' : 'Active'}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Next Steps */}
          <Animated.View style={[styles.stepsContainer, { opacity: fadeAnim }]}>
            <Text style={styles.stepsTitle}>Next Steps:</Text>
            {getNextSteps().map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepBullet}>•</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Actions */}
          <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinue}
            >
              <Text style={styles.primaryButtonText}>
                {isProvider ? 'Go to Dashboard' : 'Get Started'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>

            {!isVerified && !isProvider && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleResendEmail}
              >
                <Ionicons name="refresh" size={20} color="#0d9488" />
                <Text style={styles.secondaryButtonText}>
                  Resend Verification Email
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.replace('/auth/login')}
            >
              <Text style={styles.linkButtonText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Security Note */}
          <Animated.View style={[styles.securityNote, { opacity: fadeAnim }]}>
            <Ionicons name="shield-checkmark" size={16} color="#0d9488" />
            <Text style={styles.securityText}>
              Your information is secure and encrypted
            </Text>
          </Animated.View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f766e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  statusPending: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  stepsContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepBullet: {
    fontSize: 16,
    color: '#0d9488',
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0d9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f0fdfa',
    borderWidth: 2,
    borderColor: '#a7f3d0',
  },
  secondaryButtonText: {
    color: '#0d9488',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#0d9488',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  securityText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
});