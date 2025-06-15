
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Item, JobItem } from '../types';
import { useFetchParts, useFetchLabour } from '../services/api';

interface PartsLabourTabProps {
  selectedItems: JobItem[];
  onAddItem: (item: JobItem) => void;
  onUpdateItem: (item: JobItem) => void;
  onRemoveItem: (itemId: string, itemType: 'part' | 'labour') => void;
}

const PartsLabourTab: React.FC<PartsLabourTabProps> = ({ 
  selectedItems,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}) => {
  // State for tab selection (parts or labour)
  const [activeTab, setActiveTab] = useState<'parts' | 'labour'>('parts');
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch parts and labour
  const { fetchParts } = useFetchParts();
  const { fetchLabour } = useFetchLabour();
  
  // State for parts and labour data
  const [parts, setParts] = useState<Item[]>([]);
  const [labour, setLabour] = useState<Item[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch parts
        const partsResult = await fetchParts();
        setParts(partsResult.data);
        
        // Fetch labour
        const labourResult = await fetchLabour();
        setLabour(labourResult.data);
        
        // Check for errors
        if (partsResult.error || labourResult.error) {
          setError(partsResult.error || labourResult.error);
        }
      } catch (err) {
        console.error('Error loading parts and labour:', err);
        setError('Failed to load parts and labour data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter items based on search query
  const filteredItems = activeTab === 'parts' 
    ? parts.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : labour.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  // Check if an item is selected
  const isItemSelected = (id: string, type: 'part' | 'labour') => {
    return selectedItems.some(item => item.itemId === id && item.itemType === type);
  };
  
  // Get quantity of selected item
  const getSelectedItemQuantity = (id: string, type: 'part' | 'labour') => {
    const item = selectedItems.find(item => item.itemId === id && item.itemType === type);
    return item ? item.quantity : 0;
  };
  
  // Handle adding an item
  const handleAddItem = (item: Item) => {
    const jobItem: JobItem = {
      jobId: '',
      itemId: item.id,
      itemType: activeTab,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: 1,
      category: item.category
    };
    
    onAddItem(jobItem);
  };
  
  // Handle updating item quantity
  const handleUpdateQuantity = (id: string, type: 'part' | 'labour', quantity: number) => {
    const item = selectedItems.find(item => item.itemId === id && item.itemType === type);
    
    if (item) {
      if (quantity <= 0) {
        onRemoveItem(id, type);
      } else {
        onUpdateItem({ ...item, quantity });
      }
    }
  };
  
  // Render item
  const renderItem = ({ item }: { item: Item }) => {
    const isSelected = isItemSelected(item.id, activeTab);
    const quantity = getSelectedItemQuantity(item.id, activeTab);
    
    return (
      <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.category && (
            <Text style={styles.itemCategory}>{item.category}</Text>
          )}
          <Text style={styles.itemPrice}>${item.unitPrice}</Text>
        </View>
        
        {isSelected ? (
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, activeTab, quantity - 1)}
            >
              <Ionicons name="remove" size={16} color="#333" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.quantityInput}
              value={quantity.toString()}
              onChangeText={(text) => {
                const newQuantity = parseInt(text) || 0;
                handleUpdateQuantity(item.id, activeTab, newQuantity);
              }}
              keyboardType="number-pad"
            />
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, activeTab, quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddItem(item)}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const partItems = selectedItems.filter(item => item.itemType === 'parts');
    const labourItems = selectedItems.filter(item => item.itemType === 'labour');
    
    const partTotal = partItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0);
    
    const labourTotal = labourItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0);
    
    return {
      partCount: partItems.length,
      labourCount: labourItems.length,
      partTotal,
      labourTotal,
      total: partTotal + labourTotal
    };
  };
  
  const totals = calculateTotals();
  
  return (
    <View style={styles.container}>
      {/* Tab selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'parts' && styles.activeTabButton]}
          onPress={() => setActiveTab('parts')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'parts' && styles.activeTabButtonText]}>
            Parts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'labour' && styles.activeTabButton]}
          onPress={() => setActiveTab('labour')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'labour' && styles.activeTabButtonText]}>
            Labour
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          Selected: {totals.partCount} parts, {totals.labourCount} labour items
        </Text>
        <Text style={styles.summaryTotal}>
          Total: ${totals.total.toFixed(2)}
        </Text>
      </View>
      
      {/* Items list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loadingText}>Loading {activeTab}...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#d9534f" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 
                  ? `No ${activeTab} found matching "${searchQuery}"`
                  : `No ${activeTab} available`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  activeTabButton: {
    backgroundColor: '#f0f0f0',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  summaryText: {
    fontSize: 13,
    color: '#666',
  },
  summaryTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedItem: {
    borderColor: '#333',
    backgroundColor: '#f9f9f9',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#333',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#d9534f',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default PartsLabourTab;
