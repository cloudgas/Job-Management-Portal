
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TabView from './TabView';
import JobDetailsTab from './JobDetailsTab';
import PartsLabourTab from './PartsLabourTab';
import SummaryTab from './SummaryTab';
import { Client, Job, JobItem, TabRoute } from '../types';

interface JobModalProps {
  isVisible: boolean;
  onClose: () => void;
  client?: Client;
  onSave: (job: Job, items: JobItem[]) => void;
  existingJob?: Job;
  existingItems?: JobItem[];
}

const JobModal: React.FC<JobModalProps> = ({ 
  isVisible, 
  onClose, 
  client,
  onSave,
  existingJob,
  existingItems = []
}) => {
  // Initialize job state
  const [job, setJob] = useState<Partial<Job>>(existingJob || {
    clientId: client?.id || '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  // Initialize selected items
  const [selectedItems, setSelectedItems] = useState<JobItem[]>(existingItems);
  
  // Tab routes
  const routes: TabRoute[] = [
    { key: 'details', title: 'Job Details' },
    { key: 'parts-labour', title: 'Parts & Labour' },
    { key: 'summary', title: 'Summary' }
  ];
  
  // Current tab index
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  
  // Handle job details update
  const handleJobUpdate = (updatedJob: Partial<Job>) => {
    setJob({ ...job, ...updatedJob });
  };
  
  // Handle adding an item
  const handleAddItem = (item: JobItem) => {
    // Check if item already exists
    const existingIndex = selectedItems.findIndex(
      i => i.itemId === item.itemId && i.itemType === item.itemType
    );
    
    if (existingIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...selectedItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1
      };
      setSelectedItems(updatedItems);
    } else {
      // Add new item
      setSelectedItems([...selectedItems, item]);
    }
  };
  
  // Handle updating an item
  const handleUpdateItem = (updatedItem: JobItem) => {
    const updatedItems = selectedItems.map(item => 
      (item.itemId === updatedItem.itemId && item.itemType === updatedItem.itemType) 
        ? updatedItem 
        : item
    );
    setSelectedItems(updatedItems);
  };
  
  // Handle removing an item
  const handleRemoveItem = (itemId: string, itemType: 'part' | 'labour') => {
    setSelectedItems(selectedItems.filter(
      item => !(item.itemId === itemId && item.itemType === itemType)
    ));
  };
  
  // Handle save
  const handleSave = () => {
    // Validate required fields
    if (!job.description || !job.date || !job.clientId) {
      // Show validation error
      alert('Please fill in all required fields in Job Details');
      setCurrentTabIndex(0); // Switch to details tab
      return;
    }
    
    // Create job object
    const newJob: Job = {
      id: existingJob?.id || `job-${Date.now()}`,
      clientId: job.clientId!,
      description: job.description!,
      date: job.date!,
      notes: job.notes || ''
    };
    
    // Add jobId to all items
    const jobItems = selectedItems.map(item => ({
      ...item,
      jobId: newJob.id
    }));
    
    // Call onSave
    onSave(newJob, jobItems);
    onClose();
  };
  
  // Render tab scenes
  const renderScene = (route: TabRoute) => {
    switch (route.key) {
      case 'details':
        return (
          <JobDetailsTab 
            job={job} 
            onUpdateJob={handleJobUpdate}
            client={client}
          />
        );
      case 'parts-labour':
        return (
          <PartsLabourTab 
            selectedItems={selectedItems}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
        );
      case 'summary':
        return (
          <SummaryTab 
            job={job}
            items={selectedItems}
            client={client}
          />
        );
      default:
        return null;
    }
  };
  
  // Calculate if we can proceed to next tab
  const canProceedToNext = () => {
    if (currentTabIndex === 0) {
      return !!job.description && !!job.date && !!job.clientId;
    }
    return true;
  };
  
  // Handle next tab
  const handleNextTab = () => {
    if (currentTabIndex < routes.length - 1 && canProceedToNext()) {
      setCurrentTabIndex(currentTabIndex + 1);
    }
  };
  
  // Handle previous tab
  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setCurrentTabIndex(currentTabIndex - 1);
    }
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContainer}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>
                  {existingJob ? 'Edit Job' : 'New Job'}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              {/* Content */}
              <View style={styles.content}>
                <TabView 
                  routes={routes} 
                  renderScene={renderScene}
                  initialIndex={currentTabIndex}
                  onIndexChange={setCurrentTabIndex}
                />
              </View>
              
              {/* Footer */}
              <View style={styles.footer}>
                {currentTabIndex > 0 && (
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handlePrevTab}
                  >
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                )}
                
                {currentTabIndex < routes.length - 1 ? (
                  <TouchableOpacity 
                    style={[
                      styles.nextButton,
                      !canProceedToNext() && styles.disabledButton
                    ]}
                    onPress={handleNextTab}
                    disabled={!canProceedToNext()}
                  >
                    <Text style={styles.nextButtonText}>Next</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Save Job</Text>
                  </TouchableOpacity>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 600,
    height: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default JobModal;
