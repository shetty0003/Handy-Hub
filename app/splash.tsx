// app/splash.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { supabase } from '../utils/supabase';

const FIRST_TIME_KEY = '@handy_hub_first_time';
// AsyncStorage.removeItem(FIRST_TIME_KEY); // Uncomment to reset first time

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [statusText, setStatusText] = useState('Initializing...');
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const checkFirstTime = async () => {
      try {
        setStatusText('Checking preferences...');
        const hasSeenWelcome = await AsyncStorage.getItem(FIRST_TIME_KEY);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (hasSeenWelcome === null) {
          setStatusText('Setting up your experience...');
          await AsyncStorage.setItem(FIRST_TIME_KEY, 'true');
          router.replace('/welcome');
        } else {
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Splash screen error:', error);
        router.replace('/auth/login');
      }
    };

    checkFirstTime();
  }, []);

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.stars}>
        {[...Array(20)].map((_, i) => (
          <View 
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              }
            ]}
          />
        ))}
      </View>

      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { scale: pulseAnim }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#0ea5e9', '#3b82f6', '#6366f1']}
          style={styles.logoCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient
            colors={['#ffffff', '#f0f9ff']}
            style={styles.innerCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoIcon}>⚙️</Text>
          </LinearGradient>
          
          {/* Rotating ring */}
          <Animated.View style={styles.rotatingRing}>
            <View style={styles.ringSegment} />
            <View style={[styles.ringSegment, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.ringSegment, { transform: [{ rotate: '90deg' }] }]} />
            <View style={[styles.ringSegment, { transform: [{ rotate: '135deg' }] }]} />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.titleContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.title}>Handy Hub</Text>
        <Text style={styles.subtitle}>Your Trusted Service Partner</Text>
      </Animated.View>

      {/* Status and loading indicator */}
      <Animated.View 
        style={[
          styles.statusContainer,
          { opacity: fadeAnim }
        ]}
      >
        <ActivityIndicator 
          size="small" 
          color="#38bdf8"
          style={styles.loadingIndicator}
        />
        <Text style={styles.statusText}>{statusText}</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View 
        style={[
          styles.taglineContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.tagline}>Connecting you with trusted professionals</Text>
        <View style={styles.taglineLine} />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stars: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  rotatingRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringSegment: {
    position: 'absolute',
    width: 130,
    height: 2,
    backgroundColor: 'rgba(56, 189, 248, 0.6)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '300',
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 2,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingIndicator: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#94a3b8',
    textAlign: 'center',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 12,
    fontWeight: '300',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  taglineLine: {
    width: 100,
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
  },
});