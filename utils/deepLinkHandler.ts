// utils/deepLinkHandler.ts
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export const handleDeepLink = (url: string) => {
  console.log('Handling deep link:', url);
  
  // Check for Supabase reset password tokens
  if (url.includes('type=recovery') || url.includes('reset-password')) {
    console.log('Password reset link detected');
    router.replace('/auth/reset-password');
    return true;
  }
  
  return false;
};

export const setupDeepLinking = () => {
  // Listen for deep links
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  // Check initial URL
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  return subscription;
};