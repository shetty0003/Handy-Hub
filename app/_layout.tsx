// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../utils/supabase';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const navigationReady = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations during development/hot reload
    if (hasInitialized.current) {
      console.log('Skipping re-initialization');
      return;
    }
    
    hasInitialized.current = true;
    console.log('🚀 Initializing app...');

    let linkingSubscription: any = null;
    let authSubscription: any = null;

    const initializeApp = async () => {
      try {
        // 1. First check for deep links
        const handleDeepLink = (event: { url: string }) => {
          const url = event.url;
          console.log('🔗 Deep link received:', url);
          
          if (url.includes('type=recovery') || url.includes('reset-password')) {
            console.log('🔑 Password reset link detected');
            router.replace('/auth/reset-password');
          }
        };

        // Setup deep link listener
        linkingSubscription = Linking.addEventListener('url', handleDeepLink);

        // Check initial URL
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('📱 App opened with deep link:', initialUrl);
          if (initialUrl.includes('type=recovery') || initialUrl.includes('reset-password')) {
            console.log('🔄 Navigating to reset password screen');
            setIsLoading(false);
            router.replace('/auth/reset-password');
            return;
          }
        }

        // 2. Check auth session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ User is logged in:', session.user.email);
          
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, verification_status')
            .eq('id', session.user.id)
            .maybeSingle();

          console.log('📊 Profile data:', profile);
          
          // Route based on user type
          const userType = profile?.user_type || 'customer';
          console.log('📍 Routing to:', userType === 'provider' ? 'provider-tabs' : 'tabs');
          
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            if (userType === 'provider') {
              router.replace('/(provider-tabs)');
            } else {
              router.replace('/(tabs)');
            }
          }, 100);
          
        } else {
          console.log('👤 No active session');
          // Let splash screen handle the navigation
        }

      } catch (error) {
        console.error('💥 Initialization error:', error);
      } finally {
        // Short delay before hiding loading
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    // 3. Setup auth state listener (for future changes only)
    const setupAuthListener = () => {
      if (authSubscription) return;
      
      authSubscription = supabase.auth.onAuthStateChange(
        (event, session) => {
          // Skip INITIAL_SESSION to prevent loops
          if (event === 'INITIAL_SESSION') {
            console.log('🔄 Auth: Initial session received (ignoring)');
            return;
          }
          
          console.log(`🔄 Auth state changed: ${event}`);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('🎉 User signed in:', session.user.email);
            
            // Get profile and route
            setTimeout(async () => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', session.user.id)
                .maybeSingle();

              if (profile?.user_type === 'provider') {
                router.replace('/(provider-tabs)');
              } else {
                router.replace('/(tabs)');
              }
            }, 300);
            
          } else if (event === 'SIGNED_OUT') {
            console.log('👋 User signed out');
            router.replace('/auth/login');
          } else if (event === 'USER_UPDATED') {
            console.log('📝 User updated');
          }
        }
      );
    };

    // Run initialization
    initializeApp();
    setupAuthListener();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up listeners...');
      
      if (linkingSubscription) {
        linkingSubscription.remove();
      }
      
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
      
      // Reset flag on unmount (for hot reload)
      if (__DEV__) {
        hasInitialized.current = false;
      }
    };

  }, []); // Empty dependency array

  // Show loading indicator
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#0f172a' 
      }}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="splash" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/providers-signup" />
          <Stack.Screen name="auth/signin" />
          <Stack.Screen name="auth/forgotpassword" />
          <Stack.Screen name="auth/reset-password" />
          <Stack.Screen name="contextualmenu" />
          <Stack.Screen name="serviceselectionscreen" />
          <Stack.Screen name="needservice" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(provider-tabs)" />
          <Stack.Screen name="(provider)" />
          <Stack.Screen name="notification" />
          <Stack.Screen name="welcome" />

          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}