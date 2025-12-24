import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { height } = Dimensions.get('window');

// Service data
interface Service {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const services: Service[] = [
    { id: '1', name: 'Plumbing', icon: 'water-outline', color: '#0ea5e9' },
    { id: '2', name: 'Electrical', icon: 'flash-outline', color: '#f59e0b' },
    { id: '3', name: 'Cleaning', icon: 'sparkles-outline', color: '#10b981' },
    { id: '4', name: 'Carpentry', icon: 'hammer-outline', color: '#8b5cf6' },
    { id: '5', name: 'Painting', icon: 'brush-outline', color: '#ec4899' },
    { id: '6', name: 'Gardening', icon: 'leaf-outline', color: '#22c55e' },
    { id: '7', name: 'AC Repair', icon: 'snow-outline', color: '#3b82f6' },
    { id: '8', name: 'Appliance Repair', icon: 'tv-outline', color: '#ef4444' },
    { id: '9', name: 'Pest Control', icon: 'bug-outline', color: '#84cc16' },
    { id: '10', name: 'Moving & Transport', icon: 'car-outline', color: '#f97316' },
];

export default function ServiceSelectionScreen() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bottomSectionAnim = useRef(new Animated.Value(height)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => handleKeyboardShow(e)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardHide
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [fadeAnim, slideAnim, bottomSectionAnim, searchBarAnim, keyboardOffset]);

  const handleKeyboardShow = (e: any) => {
    setIsKeyboardVisible(true);
    // Calculate how much to move the bottom section up
    // For iOS, we use keyboard height. For Android, we can use a fixed value or calculate differently
    const moveUpValue = Platform.OS === 'ios' ? 
      Math.min(e.endCoordinates.height, 250) : // Cap at 250 for very tall keyboards
      200; // Fixed value for Android
    
    Animated.timing(keyboardOffset, {
      toValue: -moveUpValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handleKeyboardHide = () => {
    setIsKeyboardVisible(false);
    Animated.timing(keyboardOffset, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    // Dismiss keyboard when selecting a service
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const isSelected = selectedServices.includes(service.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.serviceCard,
          isSelected && styles.serviceCardSelected,
          { borderLeftColor: service.color }
        ]}
        onPress={() => toggleServiceSelection(service.id)}
        activeOpacity={0.7}
      >
        <View style={styles.serviceIconContainer}>
          <Ionicons 
            name={service.icon} 
            size={24} 
            color={isSelected ? 'white' : service.color} 
          />
        </View>
        <Text style={[
          styles.serviceName,
          isSelected && styles.serviceNameSelected
        ]}>
          {service.name}
        </Text>
        {isSelected && (
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color="white" 
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
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
            <TouchableOpacity style={styles.header} onPress={() => router.push('/contextualmenu')}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#0d9488" />
          </TouchableOpacity>

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
                  { translateY: bottomSectionAnim },
                  { translateY: keyboardOffset }
                ]
              }
            ]}
          >
            <View style={styles.bottomSectionContent}>
              {/* Search Bar Section */}
              <Animated.View 
                style={[
                  styles.searchContainer,
                  {
                    opacity: searchBarAnim,
                    transform: [
                      { translateY: searchBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })}
                    ]
                  }
                ]}
              >
                <View style={styles.searchBar}>
                  <Ionicons name="search-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="What services do you require today?"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setIsKeyboardVisible(true)}
                    onBlur={() => setIsKeyboardVisible(false)}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                      <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.7)" />
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>

              {/* Services Scroll Section */}
              <View style={[
                styles.servicesContainer,
                isKeyboardVisible && styles.servicesContainerKeyboardVisible
              ]}>
                <Text style={styles.servicesTitle}>
                  {searchQuery ? 'Search Results' : 'Popular Services'}
                  {selectedServices.length > 0 && (
                    <Text style={styles.selectedCount}> • {selectedServices.length} selected</Text>
                  )}
                </Text>
                
                <FlatList
                  data={filteredServices}
                  renderItem={({ item }) => <ServiceCard service={item} />}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  contentContainerStyle={styles.servicesGrid}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search-outline" size={40} color="rgba(255, 255, 255, 0.5)" />
                      <Text style={styles.emptyText}>No services found</Text>
                    </View>
                  }
                />
              </View>

              {/* Continue Button (Hidden when keyboard is visible on smaller screens) */}
              {!isKeyboardVisible && (
                <Animated.View 
                  style={[
                    styles.continueContainer,
                    {
                      opacity: searchBarAnim
                    }
                  ]}
                >
                  <TouchableOpacity 
                    style={[
                      styles.continueButton,
                      selectedServices.length === 0 && styles.continueButtonDisabled
                    ]}
                    disabled={selectedServices.length === 0}
                  >
                    <Text style={styles.continueButtonText}>
                      Continue {selectedServices.length > 0 && `(${selectedServices.length})`}
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </TouchableOpacity>
                  
                  {/* Bottom Icon */}
                  <View style={styles.bottomIcon}>
                    <Ionicons name="grid-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                  </View>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
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
    flex: 0.6,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'flex-end',
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
    flex: 0.7,
    backgroundColor: '#0d9488',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.7, // Fixed height
  },
  bottomSectionContent: {
    flex: 1,
    paddingTop: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: 'white',
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  servicesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  servicesContainerKeyboardVisible: {
    flex: 1.5, // Give more space when keyboard is visible
  },
  servicesTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  selectedCount: {
    color: '#ffd700',
    fontWeight: '500',
  },
  servicesGrid: {
    paddingBottom: 20,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    borderLeftWidth: 4,
    minHeight: 100,
    justifyContent: 'center',
    position: 'relative',
  },
  serviceCardSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ scale: 0.98 }],
  },
  serviceIconContainer: {
    marginBottom: 8,
  },
  serviceName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  serviceNameSelected: {
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 10,
    fontSize: 16,
  },
  continueContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  continueButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#0d9488',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  bottomIcon: {
    alignItems: 'center',
    paddingTop: 10,
  },
});