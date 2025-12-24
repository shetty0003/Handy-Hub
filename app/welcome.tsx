// app/welcome.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    icon: 'search',
    iconColor: '#3b82f6',
    title: 'Find Services',
    description: 'Browse and discover trusted local service providers for all your needs',
  },
  {
    id: 2,
    icon: 'calendar',
    iconColor: '#10b981',
    title: 'Book Instantly',
    description: 'Schedule appointments with just a few taps and get confirmed in seconds',
  },
  {
    id: 3,
    icon: 'shield-checkmark',
    iconColor: '#8b5cf6',
    title: 'Safe & Secure',
    description: 'All service providers are verified and rated by our community',
  },
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate current slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto advance slides
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        // Reset animations
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        setCurrentSlide(currentSlide + 1);
      } else {
        // After last slide, go to sign up
        setTimeout(() => {
          router.replace('/serviceselectionscreen');
        }, 1500);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  const handleSkip = () => {
    router.replace('/serviceselectionscreen');
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/serviceselectionscreen');
    }
  };

  const slide = slides[currentSlide];

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#d1fae5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#14b8a6', '#0d9488']}
              style={styles.logoCircle}
            >
              <Text style={styles.logoText}>H</Text>
            </LinearGradient>
          </View>

          {/* Slide Content */}
          <Animated.View
            style={[
              styles.slideContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${slide.iconColor}15` }]}>
              <Ionicons name={slide.icon} size={80} color={slide.iconColor} />
            </View>

            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </Animated.View>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentSlide === index && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#14b8a6', '#0d9488']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
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
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#0d9488',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  slideContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 60,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0d9488',
  },
  nextButton: {
    width: width - 80,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});