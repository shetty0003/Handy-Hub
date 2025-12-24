// app/test-deep-link.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export default function TestDeepLinkScreen() {
  const testDeepLinks = () => {
    const links = [
      'handyhub://reset-password',
      'exp://localhost:8081/--/reset-password',
    ];

    links.forEach(link => {
      Linking.openURL(link).then(() => {
        console.log(`Opened: ${link}`);
      }).catch(error => {
        console.error(`Failed to open ${link}:`, error);
      });
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Deep Linking</Text>
      
      <TouchableOpacity style={styles.button} onPress={testDeepLinks}>
        <Text style={styles.buttonText}>Test Reset Password Link</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0d9488',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});