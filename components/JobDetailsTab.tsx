
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Client, Job } from '../types';

interface JobDetailsTabProps {
  job: Partial<Job>;
  onUpdateJob: (job: Partial<Job>) => void;
  client?: Client;
}

const JobDetailsTab: React.FC<JobDetailsTabProps> = ({ 
  job, 
  onUpdateJob,
  client
}) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Client Information (read-only) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client</Text>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client?.name || 'No client selected'}</Text>
          {client?.email && <Text style={styles.clientDetail}>{client.email}</Text>}
          {client?.phone && <Text style={styles.clientDetail}>{client.phone}</Text>}
        </View>
      </View>
      
      {/* Job Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={job.description}
            onChangeText={(text) => onUpdateJob({ description: text })}
            placeholder="Brief description of the job"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={job.date}
            onChangeText={(text) => onUpdateJob({ date: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={job.notes}
            onChangeText={(text) => onUpdateJob({ notes: text })}
            placeholder="Additional notes about the job"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
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
  section: {
    marginBottom: 20,
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
  clientInfo: {
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  textArea: {
    minHeight: 80,
  },
});

export default JobDetailsTab;
