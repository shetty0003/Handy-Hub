import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { handleError } from "../../utils/errorHandler";
import {
  createService,
  deleteService,
  getProviderServices,
  updateService,
} from "../utils/serviceHelpers";

const serviceCategorySchema = z.object({
  name: z.string().min(1, "Service name is required").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0, "Price must be non-negative"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
});

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  is_active: boolean;
}

export default function ProviderServicesScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: "",
    description: "",
    price: 0,
    duration: 60,
    category: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    if (!user?.id) return;
    try {
      const { services: fetchedServices, error } = await getProviderServices(
        user.id,
      );
      if (error) {
        Alert.alert("Error", error);
      } else {
        setServices(
          fetchedServices.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            price: s.price,
            duration: s.duration,
            category: s.category_id || "",
            is_active: s.is_active,
          })),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      Alert.alert("Error", "Please fill in service name and price");
      return;
    }

    const validation = serviceCategorySchema.safeParse({
      name: newService.name,
      description: newService.description,
      price: newService.price,
      duration: newService.duration || 60,
    });

    if (!validation.success) {
      Alert.alert("Error", validation.error.issues[0]?.message || "Invalid service details");
      return;
    }

    try {
      const result = await createService(user!.id, validation.data);
      if (result.success) {
        Alert.alert("Success", "Service added successfully");
        setNewService({
          name: "",
          description: "",
          price: 0,
          duration: 60,
          category: "",
        });
        fetchServices();
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      const { userMessage } = handleError(error, "handleAddService");
      Alert.alert("Error", userMessage);
    }
  };

  const handleDeleteService = async (id: string) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteService(id);
              if (result.success) {
                setServices(services.filter((s) => s.id !== id));
              } else {
                Alert.alert("Error", result.error);
              }
            } catch (error) {
              const { userMessage } = handleError(error, "handleDeleteService");
              Alert.alert("Error", userMessage);
            }
          },
        },
      ],
    );
  };

  const handleEditService = (service: Service) => {
    setEditingId(service.id);
    setNewService({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
    });
  };

  const handleUpdateService = async () => {
    if (!editingId || !newService.name || !newService.price) return;

    try {
      const result = await updateService(editingId, {
        name: newService.name,
        description: newService.description,
        price: newService.price,
        duration: parseInt(newService.duration?.toString() || "60"),
      });

      if (result.success) {
        Alert.alert("Success", "Service updated successfully");
        setEditingId(null);
        setNewService({
          name: "",
          description: "",
          price: 0,
          duration: 60,
          category: "",
        });
        fetchServices();
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      const { userMessage } = handleError(error, "handleUpdateService");
      Alert.alert("Error", userMessage);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceCategory}>
            {item.category || "General"}
          </Text>
        </View>
        <Text style={styles.servicePrice}>${item.price}</Text>
      </View>

      <Text style={styles.serviceDescription}>{item.description}</Text>

      <View style={styles.serviceFooter}>
        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={14} color="#0d9488" />
          <Text style={styles.durationText}>{item.duration} min</Text>
        </View>

        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditService(item)}
          >
            <Ionicons name="create-outline" size={18} color="#0d9488" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteService(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#f0fdfa", "#ecfdf5"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0d9488" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Services</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Add/Edit Service Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingId ? "Edit Service" : "Add New Service"}
          </Text>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Service Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Plumbing Repair"
              value={newService.name}
              onChangeText={(text) =>
                setNewService({ ...newService, name: text })
              }
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your service..."
              value={newService.description}
              onChangeText={(text) =>
                setNewService({ ...newService, description: text })
              }
              multiline
              numberOfLines={3}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Price ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={newService.price?.toString()}
                  onChangeText={(text) =>
                    setNewService({
                      ...newService,
                      price: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="60"
                  value={newService.duration?.toString()}
                  onChangeText={(text) =>
                    setNewService({
                      ...newService,
                      duration: parseInt(text) || 60,
                    })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Plumbing, Electrical"
              value={newService.category}
              onChangeText={(text) =>
                setNewService({ ...newService, category: text })
              }
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={editingId ? handleUpdateService : handleAddService}
            >
              <LinearGradient
                colors={["#0d9488", "#0f766e"]}
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>
                  {editingId ? "Update Service" : "Add Service"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditingId(null);
                  setNewService({
                    name: "",
                    description: "",
                    price: 0,
                    duration: 60,
                    category: "",
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Services List */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>
            My Services ({services.length})
          </Text>
          <FlatList
            data={services}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.servicesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#0d9488",
    textAlign: "center",
    marginHorizontal: 12,
  },
  headerRight: { width: 44 },
  formCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d9488",
    marginBottom: 16,
  },
  form: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },
  addButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  servicesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d9488",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  servicesList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 12,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d9488",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: "#0d9488",
    fontWeight: "500",
  },
  serviceActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0fdfa",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
  },
});
