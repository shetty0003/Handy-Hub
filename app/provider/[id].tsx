import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View>
      <Text>Provider Detail for ID: {id}</Text>
    </View>
  );
}