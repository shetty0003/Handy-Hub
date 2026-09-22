import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { LanguagePicker } from "./components/LanguagePicker";
import { t } from "./i18n";
import {
  getDefaultCategories,
  getSearchSuggestions,
  searchProviders,
} from "./utils/searchHelpers";

interface ProviderResult {
  id: string;
  business_name: string;
  business_type: string;
  rating: number;
  total_jobs: number;
  service_categories: string[];
  service_areas: string[];
  hourly_rate: number | null;
  is_available: boolean;
  is_verified: boolean;
  distance?: number;
  profiles?:
    | { full_name: string; avatar_url: string }[]
    | { full_name: string; avatar_url: string }
    | null;
  services?: Array<{
    id: string;
    name: string;
    price: number;
    category_id: string;
    service_categories: { name: string } | null;
  }>;
}

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: "rating" | "price" | "distance" | "availability";
  radius: number;
  page?: number;
}

export default function SearchScreen() {
  const { query: initialQuery } = useLocalSearchParams<{ query?: string }>();
  const initialQueryText = Array.isArray(initialQuery)
    ? (initialQuery[0] ?? "")
    : (initialQuery ?? "");
  const { user } = useAuth();
  const [results, setResults] = useState<ProviderResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    location: "",
    minPrice: null,
    maxPrice: null,
    sortBy: "rating",
    radius: 25,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (initialQueryText) {
      setFilters((prev) => ({ ...prev, query: initialQueryText }));
      searchProvidersAPI({ ...filters, query: initialQueryText, page: 1 });
    }
  }, []);

  const searchProvidersAPI = async (params: SearchFilters, pageNum = 1) => {
    if (!params.query && !params.category && !params.location) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, total, error } = await searchProviders({
        query: params.query || undefined,
        category: params.category || undefined,
        location: params.location || undefined,
        minPrice: params.minPrice ?? undefined,
        maxPrice: params.maxPrice ?? undefined,
        radius: params.radius,
        sortBy: params.sortBy,
        page: pageNum,
        limit: 20,
      });
      if (error) throw new Error(error);

      if (pageNum === 1) {
        setResults(data);
      } else {
        setResults((prev) => [...prev, ...data]);
      }
      setTotalCount(total);
      setHasMore(data.length === 20);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, query: text }));
    setShowSuggestions(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const suggs = await getSearchSuggestions(text);
      setSuggestions(suggs);
    }, 300);
  }, []);

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    setPage(1);
    searchProvidersAPI(filters, 1);
  };

  const handleCategorySelect = (category: string) => {
    setFilters((prev) => ({ ...prev, category, page: 1 }));
    searchProvidersAPI({ ...filters, category }, 1);
  };

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    searchProvidersAPI(filters, nextPage);
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      location: "",
      minPrice: null,
      maxPrice: null,
      sortBy: "rating",
      radius: 25,
    });
    setResults([]);
    setTotalCount(0);
    setPage(1);
    setHasMore(true);
  };

  const renderProvider = ({ item }: { item: ProviderResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() =>
        router.push({ pathname: "/provider/[id]", params: { id: item.id } })
      }
      activeOpacity={0.7}
    >
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName} numberOfLines={1}>
            {item.business_name ||
              (Array.isArray(item.profiles)
                ? item.profiles[0]?.full_name
                : item.profiles?.full_name) ||
              "Provider"}
          </Text>
          <Text style={styles.providerType} numberOfLines={1}>
            {item.business_type || "Service Provider"}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.ratingText}>
            {item.rating?.toFixed(1) || "0.0"} ({item.total_jobs || 0})
          </Text>
        </View>
      </View>

      {item.service_categories && item.service_categories.length > 0 && (
        <View style={styles.categoriesRow}>
          {item.service_categories.slice(0, 3).map((cat, i) => (
            <View key={i} style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{cat}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.providerFooter}>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#64748b" />
          <Text style={styles.detailText}>
            {item.hourly_rate
              ? `$${item.hourly_rate}/hr`
              : "Contact for pricing"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.service_areas?.slice(0, 2).join(", ") || "Area not specified"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#f0fdfa", "#ecfdf5", "#f0fdfa"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#0d9488" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t("search") || "Search Services"}
          </Text>
          <LanguagePicker visible={false} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#64748b"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t("search") || "Search for services..."}
            placeholderTextColor="#94a3b8"
            value={filters.query}
            onChangeText={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            onSubmitEditing={handleSearchSubmit}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => router.push("/search/filters")}
          >
            <Ionicons name="options-outline" size={20} color="#0d9488" />
          </TouchableOpacity>
        </View>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((sugg, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionItem}
                onPress={() => {
                  setFilters((prev) => ({ ...prev, query: sugg }));
                  handleSearchSubmit();
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color="#64748b"
                  style={styles.suggIcon}
                />
                <Text style={styles.suggestionText}>{sugg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {getDefaultCategories().map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                filters.category === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => handleCategorySelect(cat.id)}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: cat.color }]}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={18}
                  color="white"
                />
              </View>
              <Text
                style={[
                  styles.categoryLabel,
                  filters.category === cat.id && styles.categoryLabelActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        <FlatList
          data={results}
          renderItem={renderProvider}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreText}>
                  {loading
                    ? t("loading")
                    : `Load More (${results.length}/${totalCount})`}
                </Text>
              </TouchableOpacity>
            ) : results.length > 0 ? (
              <Text style={styles.endText}>No more results</Text>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                  {filters.query
                    ? "Try a different search term"
                    : "Enter a search term or select a category"}
                </Text>
              </View>
            )
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshing={loading && page === 1}
          onRefresh={() => searchProvidersAPI(filters, 1)}
        />
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#0d9488",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#FFD700",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: "#1e293b" },
  filterButton: { padding: 8 },
  suggestionsContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  suggIcon: { marginRight: 12 },
  suggestionText: { fontSize: 16, color: "#1e293b", flex: 1 },
  categoriesScroll: { paddingHorizontal: 20, marginBottom: 16 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryChipActive: { backgroundColor: "#f0fdfa", borderColor: "#0d9488" },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  categoryLabel: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  categoryLabelActive: { color: "#0f766e" },
  resultsContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  resultCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 18, fontWeight: "600", color: "#1e293b" },
  providerType: { fontSize: 14, color: "#64748b", marginTop: 2 },
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 14, fontWeight: "600", color: "#92400e" },
  categoriesRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  categoryBadge: {
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: { fontSize: 12, color: "#0d9488", fontWeight: "500" },
  providerFooter: { flexDirection: "row", gap: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 13, color: "#64748b" },
  loadMoreButton: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  loadMoreText: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  endText: { textAlign: "center", color: "#94a3b8", marginTop: 16 },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
    textAlign: "center",
  },
});
