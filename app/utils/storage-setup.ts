import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

export const uploadDocument = async (
  userId: string,
  fileUri: string,
  documentType: string,
  fileName?: string
) => {
  try {
    // Read file as base64
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = fileName?.split('.').pop() || 'jpg';
    const uniqueFileName = `${documentType}_${timestamp}.${fileExtension}`;
    const filePath = `documents/${userId}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('provider-documents')
      .upload(filePath, decode(fileBase64), {
        contentType: getContentType(fileExtension),
        upsert: false
      });

    if (error) {
      return { path: null, error: error.message };
    }

    return { path: data.path, error: null };
  } catch (error) {
    return { path: null, error: (error as Error).message };
  }
};

export const uploadProfilePicture = async (
  userId: string,
  fileUri: string
) => {
  try {
    // Read file as base64
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    const timestamp = Date.now();
    const filePath = `profiles/${userId}/profile_${timestamp}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, decode(fileBase64), {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: (error as Error).message };
  }
};

// Helper function to decode base64
const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper function to get content type
const getContentType = (extension: string): string => {
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return types[extension.toLowerCase()] || 'application/octet-stream';
};