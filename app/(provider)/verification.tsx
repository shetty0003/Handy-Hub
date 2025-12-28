// app/(provider)/verification.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const DOCUMENT_TYPES = [
  { id: 'license', label: 'Professional License', required: true, icon: 'license' },
  { id: 'insurance', label: 'Insurance Certificate', required: true, icon: 'shield-checkmark' },
  { id: 'id_front', label: 'Government ID (Front)', required: true, icon: 'card' },
  { id: 'id_back', label: 'Government ID (Back)', required: true, icon: 'card' },
  { id: 'business_reg', label: 'Business Registration', required: false, icon: 'document-text' },
  { id: 'tax_id', label: 'Tax ID Document', required: false, icon: 'cash' },
];

export default function ProviderVerificationScreen() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, {
    uri: string;
    fileName: string;
    status: 'pending' | 'uploaded' | 'verified';
  }>>({});
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Load existing documents
      const { data: existingDocs } = await supabase
        .from('provider_documents')
        .select('*')
        .eq('provider_id', user?.id);

      if (existingDocs) {
        const docs: Record<string, any> = {};
        existingDocs.forEach(doc => {
          docs[doc.document_type] = {
            uri: doc.file_url,
            fileName: doc.file_name,
            status: doc.status === 'approved' ? 'verified' : 'uploaded'
          };
        });
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleDocumentUpload = async (docType: string) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    try {
      setUploading(docType);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const asset = result.assets?.[0] || result;
        // Upload to Supabase Storage
        const fileExt = (asset as any).name?.split('.').pop() || 'pdf';
        const fileName = `${user.id}_${docType}_${Date.now()}.${fileExt}`;
        
        const formData = new FormData();
        formData.append('file', {
          uri: (asset as any).uri,
          type: `application/${fileExt}`,
          name: fileName,
        } as any);

        const { error: uploadError } = await supabase.storage
          .from('provider-documents')
          .upload(fileName, formData);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('provider-documents')
          .getPublicUrl(fileName);

        // Save to database
        const { error: dbError } = await supabase
          .from('provider_documents')
          .upsert({
            provider_id: user.id,
            document_type: docType,
            file_name: fileName,
            file_url: publicUrl,
            status: 'pending_review'
          }, {
            onConflict: 'provider_id,document_type'
          });

        if (dbError) throw dbError;

        // Update local state
        setDocuments(prev => ({
          ...prev,
          [docType]: {
            uri: publicUrl,
            fileName: (asset as any).name || fileName,
            status: 'uploaded'
          }
        }));

        Alert.alert('Success', 'Document uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document: ' + error.message);
    } finally {
      setUploading(null);
    }
  };

  const handleTakePhoto = async (docType: string) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Camera access is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        handleImageUpload(docType, result.assets[0].uri, `photo_${Date.now()}.jpg`);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleImageUpload = async (docType: string, uri: string, fileName: string) => {
    if (!user) return;

    try {
      setUploading(docType);
      
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('provider-documents')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('provider-documents')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('provider_documents')
        .upsert({
          provider_id: user.id,
          document_type: docType,
          file_name: fileName,
          file_url: publicUrl,
          status: 'pending_review'
        }, {
          onConflict: 'provider_id,document_type'
        });

      if (dbError) throw dbError;

      setDocuments(prev => ({
        ...prev,
        [docType]: {
          uri: publicUrl,
          fileName: fileName,
          status: 'uploaded'
        }
      }));

      Alert.alert('Success', 'Photo uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(null);
    }
  };

  const getCompletionStatus = () => {
    const requiredDocs = DOCUMENT_TYPES.filter(doc => doc.required);
    const uploadedRequired = requiredDocs.filter(doc => documents[doc.id]?.status === 'uploaded' || documents[doc.id]?.status === 'verified');
    return {
      completed: uploadedRequired.length,
      total: requiredDocs.length,
      percentage: Math.round((uploadedRequired.length / requiredDocs.length) * 100)
    };
  };

  const completion = getCompletionStatus();

  return (
    <LinearGradient
      colors={['#f0fdfa', '#ecfdf5', '#ccfbf1']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0d9488" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Verification Progress</Text>
            <Text style={styles.progressPercentage}>{completion.percentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { flex: completion.percentage / 100 }
              ]} 
            />
            <View style={{ flex: (100 - completion.percentage) / 100 }} />
          </View>
          <Text style={styles.progressText}>
            {completion.completed} of {completion.total} required documents uploaded
          </Text>
          
          {completion.percentage === 100 ? (
            <View style={styles.completeBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.completeText}>Ready for review</Text>
            </View>
          ) : (
            <Text style={styles.verificationNote}>
              Complete all required documents to start verification process
            </Text>
          )}
        </View>

        {/* Documents List */}
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          
          {DOCUMENT_TYPES.filter(doc => doc.required).map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              document={documents[doc.id]}
              uploading={uploading === doc.id}
              onUpload={() => handleDocumentUpload(doc.id)}
              onTakePhoto={() => handleTakePhoto(doc.id)}
            />
          ))}

          <Text style={styles.sectionTitle}>Optional Documents</Text>
          
          {DOCUMENT_TYPES.filter(doc => !doc.required).map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              document={documents[doc.id]}
              uploading={uploading === doc.id}
              onUpload={() => handleDocumentUpload(doc.id)}
              onTakePhoto={() => handleTakePhoto(doc.id)}
            />
          ))}

          {/* Verification Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#0d9488" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Verification Process</Text>
              <Text style={styles.infoText}>
                • Upload all required documents{'\n'}
                • Our team will review within 3-5 business days{'\n'}
                • You'll receive email notifications{'\n'}
                • Verified providers get priority in search results
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const DocumentCard = ({ doc, document, uploading, onUpload, onTakePhoto }: any) => (
  <View style={styles.documentCard}>
    <View style={styles.documentHeader}>
      <View style={styles.documentIcon}>
        <Ionicons name={doc.icon as any} size={24} color="#0d9488" />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentLabel}>{doc.label}</Text>
        <Text style={[
          styles.documentStatus,
          document?.status === 'verified' ? styles.statusVerified :
          document?.status === 'uploaded' ? styles.statusUploaded :
          styles.statusRequired
        ]}>
          {document?.status === 'verified' ? 'Verified' : 
           document?.status === 'uploaded' ? 'Uploaded - Pending Review' : 
           doc.required ? 'Required' : 'Optional'}
        </Text>
        {document?.fileName && (
          <Text style={styles.documentName} numberOfLines={1}>
            {document.fileName}
          </Text>
        )}
      </View>
      {document?.status === 'verified' ? (
        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
      ) : uploading ? (
        <ActivityIndicator size="small" color="#0d9488" />
      ) : null}
    </View>

    {!document?.status && (
      <View style={styles.documentActions}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={onUpload}
          disabled={uploading}
        >
          <Ionicons name="cloud-upload" size={20} color="#0d9488" />
          <Text style={styles.uploadButtonText}>Upload File</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.photoButton}
          onPress={onTakePhoto}
          disabled={uploading}
        >
          <Ionicons name="camera" size={20} color="#0d9488" />
          <Text style={styles.photoButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d9488',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  progressCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0d9488',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0d9488',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  completeText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },
  verificationNote: {
    fontSize: 12,
    color: '#f59e0b',
    fontStyle: 'italic',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 16,
    marginTop: 8,
  },
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdfa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  documentStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  statusRequired: {
    color: '#ef4444',
  },
  statusUploaded: {
    color: '#f59e0b',
  },
  statusVerified: {
    color: '#10b981',
  },
  documentName: {
    fontSize: 11,
    color: '#64748b',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdfa',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#0d9488',
    fontWeight: '600',
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdfa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
});