import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t, setLanguage, LANGUAGE_NAMES } from '../i18n';
import { LanguagePicker } from '../components/LanguagePicker';

interface FiltersState {
  category: string;
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: 'rating' | 'price' | 'distance' | 'availability';
  radius: number;
  onlyVerified: boolean;
  availableNow: boolean;
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'distance', label: 'Nearest' },
  { value: 'availability', label: 'Available Now' },
];

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export default function SearchFiltersScreen() {
  const [filters, setFilters] = useState<FiltersState>({
    category: '',
    location: '',
    minPrice: null,
    maxPrice: null,
    sortBy: 'rating',
    radius: 25,
    onlyVerified: true,
    availableNow: false,
  });

  useEffect(() => {
    // Load saved filters from storage
    const saved = global.searchFilters;
    if (saved) setFilters(saved);
  }, []);

  const updateFilter = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    // Save filters
    global.searchFilters = filters;
    router.back();
  };

  const handleReset = () => {
    setFilters({
      category: '',
      location: '',
      minPrice: null,
      maxPrice: null,
      sortBy: 'rating',
      radius: 25,
      onlyVerified: true,
      availableNow: false,
    });
  };

  return (
    <LinearGradient colors={['#f0fdfa', '#ecfdf5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#0d9488" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('filters') || 'Filters'}</Text>
              <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('category') || 'Category'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {['Cleaning', 'Plumbing', 'Electrical', 'Gardening', 'Painting', 'Assembly', 'Repair', 'Moving'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      filters.category === cat && styles.chipActive
                    ]}
                    onPress={() => updateFilter('category', filters.category === cat ? '' : cat)}
                  >
                    <Text style={[
                      styles.chipText,
                      filters.category === cat && styles.chipTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('location') || 'Location'}</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="City, ZIP, or neighborhood"
                  value={filters.location}
                  onChangeText={text => updateFilter('location', text)}
                />
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('priceRange') || 'Price Range'}</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Min ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={filters.minPrice?.toString() || ''}
                    onChangeText={text => updateFilter('minPrice', parseInt(text) || null)}
                  />
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Max ($)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="500"
                    keyboardType="numeric"
                    value={filters.maxPrice?.toString() || ''}
                    onChangeText={text => updateFilter('maxPrice', parseInt(text) || null)}
                  />
                </View>
              </View>
            </View>

            {/* Radius */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('radius') || 'Search Radius'} ({filters.radius} km)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                {RADIUS_OPTIONS.map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.chip,
                      filters.radius === r && styles.chipActive
                    ]}
                    onPress={() => updateFilter('radius', r)}
                  >
                    <Text style={[
                      styles.chipText,
                      filters.radius === r && styles.chipTextActive
                    ]}>
                      {r} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sortBy') || 'Sort By'}</Text>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionRow,
                    filters.sortBy === opt.value && styles.optionRowActive
                  ]}
                  onPress={() => updateFilter('sortBy', opt.value)}
                >
                  <Text style={[
                    styles.optionText,
                    filters.sortBy === opt.value && styles.optionTextActive
                  ]}>
                    {opt.label}
                  </Text>
                  {filters.sortBy === opt.value && (
                    <Ionicons name="checkmark" size={20} color="#0d9488" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Toggles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('options') || 'Options'}</Text>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Verified Providers Only</Text>
                  <Text style={styles.toggleSubtext}>Show only background-checked professionals</Text>
                </View>
                <Switch
                  value={filters.onlyVerified}
                  onValueChange={v => updateFilter('onlyVerified', v)}
                  trackColor={{ false: '#e2e8f0', true: '#0d9488' }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Available Now</Text>
                  <Text style={styles.toggleSubtext}>Show providers ready to work today</Text>
                </View>
                <Switch
                  value={filters.availableNow}
                  onValueChange={v => updateFilter('availableNow', v)}
                  trackColor={{ false: '#e2e8f0', true: '#0d9488' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyText}>{t('applyFilters') || 'Apply Filters'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0d9488', flex: 1, textAlign: 'center' },
  resetButton: { padding: 8 },
  resetText: { fontSize: 16, color: '#ef4444', fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
  chipContainer: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  chipActive: { backgroundColor: '#f0fdfa', borderColor: '#0d9488' },
  chipText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  chipTextActive: { color: '#0f766e', fontWeight: '600' },
  inputGroup: { marginTop: 4 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1e293b',
  },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceInput: { flex: 1 },
  priceLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionRowActive: { borderColor: '#0d9488', backgroundColor: '#f0fdfa' },
  optionText: { fontSize: 16, color: '#1e293b' },
  optionTextActive: { color: '#0d9488', fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 16, fontWeight: '500', color: '#1e293b' },
  toggleSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
  applyButton: {
    backgroundColor: '#0d9488',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyText: { color: 'white', fontSize: 18, fontWeight: '600' },
});