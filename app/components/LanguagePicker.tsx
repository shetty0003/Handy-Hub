import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { LANGUAGE_NAMES, type LanguageCode, setLanguage, getLanguage, t } from '../i18n';

interface Props {
  onSelect?: (lang: LanguageCode) => void;
  visible?: boolean;
  onClose?: () => void;
}

export function LanguagePicker({ onSelect, visible = false, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(visible);
  const [selectedLang] = useState<LanguageCode>(getLanguage());

  const handleSelect = (lang: LanguageCode) => {
    setLanguage(lang);
    onSelect?.(lang);
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible && !visible) return null;

  return (
    <Modal visible={isVisible || visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('language')}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {(Object.entries(LANGUAGE_NAMES) as [LanguageCode, string][]).map(([code, name]) => (
                <TouchableOpacity
                  key={code}
                  style={[
                    styles.item,
                    selectedLang === code && styles.itemSelected
                  ]}
                  onPress={() => handleSelect(code)}
                >
                  <Text style={[
                    styles.itemText,
                    selectedLang === code && styles.itemTextSelected
                  ]}>
                    {name}
                  </Text>
                  {selectedLang === code && (
                    <Ionicons name="checkmark" size={20} color="#0d9488" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  closeButton: { padding: 8 },
  list: { maxHeight: 300 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemSelected: { backgroundColor: '#f0fdfa' },
  itemText: { fontSize: 16, color: '#1e293b' },
  itemTextSelected: { color: '#0d9488', fontWeight: '600' },
  checkIcon: { marginLeft: 12 },
});