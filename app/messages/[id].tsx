import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { getMessages, sendMessage } from '../utils/messageHelpers';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function ChatScreen() {
  const { id: receiverId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    loadMessages();
    const unsubscribe = subscribeToMessages();
    return unsubscribe;
  }, []);

  const loadMessages = async () => {
    if (!user?.id || !receiverId) return;
    try {
      const data = await getMessages(user.id, receiverId);
      setMessages(data);
      scrollToBottom();
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!user?.id) return () => {};
    const channel = supabase.channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
      }, (payload) => {
        if (payload.new.receiver_id === user.id || payload.new.sender_id === user.id) {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id || !receiverId) return;
    const content = newMessage.trim();
    setNewMessage('');
    await sendMessage(user.id, receiverId, content);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <LinearGradient colors={['#f0fdfa', '#ecfdf5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={100}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0d9488" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#0d9488" />
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation</Text>
              </View>
            ) : (
              messages.map((msg) => (
                <View key={msg.id} style={[
                  styles.messageBubble,
                  msg.sender_id === user?.id ? styles.ownMessage : styles.otherMessage
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.sender_id === user?.id ? styles.ownMessageText : styles.otherMessageText
                  ]}>
                    {msg.content}
                  </Text>
                  <Text style={styles.messageTime}>
                    {new Date(msg.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={handleSend}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!newMessage.trim()}>
              <Ionicons name="send" size={24} color="#0d9488" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d9488',
    textAlign: 'center',
  },
  messagesContainer: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingBottom: 20 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0d9488',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: { color: 'white' },
  otherMessageText: { color: '#1e293b' },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
});
