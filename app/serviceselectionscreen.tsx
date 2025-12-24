import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
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

export default function ServiceSelectionScreen() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const button1Anim = useRef(new Animated.Value(0)).current;
  const button2Anim = useRef(new Animated.Value(0)).current;
  const bottomSectionAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Stagger animations for smooth entrance
    Animated.sequence([
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
      ]),
      Animated.spring(bottomSectionAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.stagger(150, [
        Animated.spring(button1Anim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(button2Anim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleNeedServices = () => {
    console.log('User needs services');
    router.push('auth/signin' as any);
  };

  const handleRenderServices = () => {
    console.log('User wants to render services');
    router.replace('auth/providers-signup' as any);
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top White Section */}
        <Animated.View 
          style={[
            styles.topSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
              ]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#0d9488" />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>How do you want to use</Text>
            <Text style={styles.titleBrand}>handyhub</Text>
          </View>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustrationPlaceholder}>
              <Ionicons name="construct" size={60} color="#0d9488" />
              <Ionicons name="hammer" size={40} color="#f59e0b" style={styles.toolIcon} />
            </View>
          </View>
        </Animated.View>

        {/* Bottom Teal Section - Animated from bottom */}
        <Animated.View 
          style={[
            styles.bottomSection,
            {
              transform: [
                { translateY: bottomSectionAnim }
              ]
            }
          ]}
        >
          <View style={styles.bottomSectionContent}>
            {/* Buttons Section */}
            <View style={styles.buttonSection}>
              {/* Button 1 - I Need Services */}
              <Animated.View
                style={{
                  opacity: button1Anim,
                  transform: [
                    {
                      translateY: button1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    { scale: button1Anim },
                  ],
                }}
              >
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleNeedServices}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>I Need Services</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Button 2 - Render Services */}
              <Animated.View
                style={{
                  opacity: button2Anim,
                  transform: [
                    {
                      translateY: button2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    { scale: button2Anim },
                  ],
                }}
              >
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={handleRenderServices}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Render Services</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Back to Login Link */}
              <TouchableOpacity 
                style={styles.backLink}
                onPress={handleBackToLogin}
              >
                <Text style={styles.backLinkText}>Back to Login</Text>
              </TouchableOpacity>

              {/* Bottom Icon */}
              <View style={styles.bottomIcon}>
                <Ionicons name="grid-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
              </View>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  safeArea: {
    flex: 1,
  },
  topSection: {
    flex: 0.6, // 60% of the screen
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'flex-start',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
  },
  titleBrand: {
    fontSize: 16,
    color: '#948208ff',
    textAlign: 'center',
    fontWeight: '600',
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  illustrationPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#e6fffa',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  toolIcon: {
    position: 'absolute',
    top: 30,
    right: 20,
    transform: [{ rotate: '-45deg' }],
  },
  bottomSection: {
    flex: 0.4, // 40% of the screen
    backgroundColor: '#0d9488', // Teal color
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomSectionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: 'white', // White button on teal background
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#0d9488', // Teal text on white
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  secondaryButtonText: {
    color: 'white', // White text
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  backLinkText: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bottomIcon: {
    alignItems: 'center',
    paddingTop: 10,
  },
});