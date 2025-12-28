import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View>
      <Text>Booking Detail for ID: {id}</Text>
    </View>
  );
}