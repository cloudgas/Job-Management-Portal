
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Client, Job, JobItem } from '../types';

interface SummaryTabProps {
  job: Partial<Job>;
  items: JobItem[];
  client?: Client;
}

const SummaryTab: React.FC<SummaryTabProps> = ({ 
  job, 
  items,
  client
}) => {
  // Separate parts and labour
  const parts = items.filter(item => item.itemType === 'parts');
  const labour = items.filter(item => item.itemType === 'labour');
  
  // Calculate totals
  const calculateTotals = () => {
    const partTotal = parts.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0);
    
    const labourTotal = labour.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice) * item.quantity), 0);
    
    return {
      partTotal,
      labourTotal,
      total: partTotal + labourTotal
    };
  };
  
  const totals = calculateTotals();
  
  // Check if required fields are filled
  const isJobValid = !!job.description && !!job.date && !!job.clientId;
  
  // Render item
  const renderItem = ({ item }: { item: JobItem }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.unitPrice} × {item.quantity}</Text>
      </View>
      <Text style={styles.itemTotal}>
        ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
      </Text>
    </View>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Validation warning */}
      {!isJobValid && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#f0ad4e" />
          <Text style={styles.warningText}>
            Please fill in all required fields in the Job Details tab.
          </Text>
        </View>
      )}
      
      {/* Job Details Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Client:</Text>
          <Text style={styles.detailValue}>{client?.name || 'No client selected'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailValue}>{job.description || 'Not specified'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{job.date || 'Not specified'}</Text>
        </View>
        
        {job.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.notesText}>{job.notes}</Text>
          </View>
        )}
      </View>
      
      {/* Parts Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parts ({parts.length})</Text>
        
        {parts.length === 0 ? (
          <Text style={styles.emptyText}>No parts added</Text>
        ) : (
          <FlatList
            data={parts}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.itemId}-${item.itemType}`}
            scrollEnabled={false}
          />
        )}
        
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Parts Subtotal:</Text>
          <Text style={styles.subtotalValue}>${totals.partTotal.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* Labour Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Labour ({labour.length})</Text>
        
        {labour.length === 0 ? (
          <Text style={styles.emptyText}>No labour added</Text>
        ) : (
          <FlatList
            data={labour}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.itemId}-${item.itemType}`}
            scrollEnabled={false}
          />
        )}
        
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Labour Subtotal:</Text>
          <Text style={styles.subtotalValue}>${totals.labourTotal.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>${totals.total.toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    color: '#856404',
    flex: 1,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  subtotalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SummaryTab;
