import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useBasic } from '@basictech/expo';
import SettingsModal from '../components/SettingsModal';
import ClientModal from '../components/ClientModal';
import JobModal from '../components/JobModal';
import { Client, Job, JobItem } from '../types';

const HomeScreen: React.FC = () => {
  const { isSignedIn, login, db } = useBasic();
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [isJobModalVisible, setIsJobModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>(undefined);
  const [selectedJobItems, setSelectedJobItems] = useState<JobItem[]>([]);
  
  // State for clients and jobs
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobItems, setJobItems] = useState<JobItem[]>([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load data on mount and when db changes
  useEffect(() => {
    if (isSignedIn && db) {
      loadData();
    } else {
      setClients([]);
      setJobs([]);
      setJobItems([]);
      setIsLoading(false);
    }
  }, [isSignedIn, db]);
  
  // Load all data from the database
  const loadData = async () => {
    if (!db) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load clients
      const clientsData = await db.from('clients').getAll();
      console.log('Loaded clients:', clientsData);
      setClients(clientsData || []);
      
      // Load jobs
      const jobsData = await db.from('jobs').getAll();
      console.log('Loaded jobs:', jobsData);
      setJobs(jobsData || []);
      
      // Load job items
      const jobItemsData = await db.from('jobItems').getAll();
      console.log('Loaded job items:', jobItemsData);
      setJobItems(jobItemsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving a client
  const handleSaveClient = async (client: Client) => {
    if (!db) {
      Alert.alert('Error', 'Database not available. Please try again later.');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Saving client:', client);
      
      // Check if client exists
      const existingIndex = clients.findIndex(c => c.id === client.id);
      
      if (existingIndex >= 0) {
        // Update existing client
        console.log('Updating existing client with ID:', client.id);
        const updatedClient = await db.from('clients').update(client.id, client);
        console.log('Client updated successfully:', updatedClient);
        
        // Update local state
        const updatedClients = [...clients];
        updatedClients[existingIndex] = updatedClient;
        setClients(updatedClients);
        Alert.alert('Success', 'Client updated successfully');
      } else {
        // Add new client
        console.log('Adding new client');
        // Remove the id field for new clients to let Basic Tech generate one
        const { id, ...clientData } = client;
        const newClient = await db.from('clients').add(clientData);
        console.log('Client added successfully:', newClient);
        
        // Update local state
        setClients(prevClients => [...prevClients, newClient]);
        Alert.alert('Success', 'Client added successfully');
      }
      
      // Close the modal after successful save
      setIsClientModalVisible(false);
      setSelectedClient(undefined);
    } catch (err) {
      console.error('Error saving client:', err);
      Alert.alert('Error', 'Failed to save client. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle saving a job
  const handleSaveJob = async (job: Job, items: JobItem[]) => {
    if (!db) {
      Alert.alert('Error', 'Database not available. Please try again later.');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Saving job:', job);
      console.log('Job items:', items);
      
      // Check if job exists
      const existingIndex = jobs.findIndex(j => j.id === job.id);
      
      if (existingIndex >= 0) {
        // Update existing job
        console.log('Updating existing job with ID:', job.id);
        const updatedJob = await db.from('jobs').update(job.id, job);
        console.log('Job updated successfully:', updatedJob);
        
        // Update local state
        const updatedJobs = [...jobs];
        updatedJobs[existingIndex] = updatedJob;
        setJobs(updatedJobs);
        
        // Delete existing job items
        console.log('Deleting existing job items for job ID:', job.id);
        const existingItems = jobItems.filter(item => item.jobId === job.id);
        for (const item of existingItems) {
          if (item.id) {
            await db.from('jobItems').delete(item.id);
            console.log('Deleted job item with ID:', item.id);
          }
        }
      } else {
        // Add new job
        console.log('Adding new job');
        // Remove the id field for new jobs to let Basic Tech generate one
        const { id, ...jobData } = job;
        const newJob = await db.from('jobs').add({
          ...jobData,
          clientId: job.clientId
        });
        console.log('Job added successfully:', newJob);
        
        // Update job ID for items
        items = items.map(item => ({
          ...item,
          jobId: newJob.id
        }));
        
        // Update local state
        setJobs(prevJobs => [...prevJobs, newJob]);
      }
      
      // Add job items
      console.log('Adding job items');
      const newJobItems: JobItem[] = [];
      for (const item of items) {
        // Remove id field for new items
        const { id, ...itemData } = item;
        const newItem = await db.from('jobItems').add(itemData);
        console.log('Added job item:', newItem);
        newJobItems.push(newItem);
      }
      
      // Update local state
      setJobItems(prevItems => [
        ...prevItems.filter(item => item.jobId !== job.id),
        ...newJobItems
      ]);
      
      Alert.alert('Success', 'Job saved successfully');
      
      // Close the modal after successful save
      setIsJobModalVisible(false);
      setSelectedJob(undefined);
      setSelectedJobItems([]);
      setSelectedClient(undefined);
    } catch (err) {
      console.error('Error saving job:', err);
      Alert.alert('Error', 'Failed to save job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle editing a job
  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setSelectedJobItems(jobItems.filter(item => item.jobId === job.id));
    setSelectedClient(clients.find(client => client.id === job.clientId));
    setIsJobModalVisible(true);
  };
  
  // Handle deleting a job
  const handleDeleteJob = async (jobId: string) => {
    if (!db) {
      Alert.alert('Error', 'Database not available. Please try again later.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Delete job items first
      console.log('Deleting job items for job ID:', jobId);
      const itemsToDelete = jobItems.filter(item => item.jobId === jobId);
      for (const item of itemsToDelete) {
        if (item.id) {
          await db.from('jobItems').delete(item.id);
          console.log('Deleted job item with ID:', item.id);
        }
      }
      
      // Delete job
      console.log('Deleting job with ID:', jobId);
      await db.from('jobs').delete(jobId);
      console.log('Job deleted successfully');
      
      // Update local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      setJobItems(prevItems => prevItems.filter(item => item.jobId !== jobId));
      
      Alert.alert('Success', 'Job deleted successfully');
    } catch (err) {
      console.error('Error deleting job:', err);
      Alert.alert('Error', 'Failed to delete job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle editing a client
  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsClientModalVisible(true);
  };
  
  // Handle deleting a client
  const handleDeleteClient = async (clientId: string) => {
    if (!db) {
      Alert.alert('Error', 'Database not available. Please try again later.');
      return;
    }
    
    // Check if client has jobs
    const clientJobs = jobs.filter(job => job.clientId === clientId);
    if (clientJobs.length > 0) {
      Alert.alert('Cannot Delete', 'Cannot delete client with existing jobs. Please delete the jobs first.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Delete client
      console.log('Deleting client with ID:', clientId);
      await db.from('clients').delete(clientId);
      console.log('Client deleted successfully');
      
      // Update local state
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      
      Alert.alert('Success', 'Client deleted successfully');
    } catch (err) {
      console.error('Error deleting client:', err);
      Alert.alert('Error', 'Failed to delete client. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render client item
  const renderClientItem = ({ item }: { item: Client }) => (
    <View style={styles.clientCard}>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        {item.email && <Text style={styles.clientDetail}>{item.email}</Text>}
        {item.phone && <Text style={styles.clientDetail}>{item.phone}</Text>}
      </View>
      
      <View style={styles.clientActions}>
        <TouchableOpacity 
          style={styles.clientActionButton}
          onPress={() => {
            setSelectedClient(item);
            setSelectedJob(undefined);
            setSelectedJobItems([]);
            setIsJobModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color="#333" />
          <Text style={styles.clientActionText}>Add Job</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.clientActionButton}
          onPress={() => handleEditClient(item)}
        >
          <Ionicons name="create-outline" size={20} color="#333" />
          <Text style={styles.clientActionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.clientActionButton}
          onPress={() => handleDeleteClient(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#d9534f" />
          <Text style={[styles.clientActionText, { color: '#d9534f' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      {/* Client Jobs */}
      <View style={styles.jobsContainer}>
        <Text style={styles.jobsTitle}>Jobs</Text>
        
        {jobs.filter(job => job.clientId === item.id).length === 0 ? (
          <Text style={styles.noJobsText}>No jobs for this client</Text>
        ) : (
          jobs
            .filter(job => job.clientId === item.id)
            .map(job => {
              // Calculate job total
              const jobTotal = jobItems
                .filter(item => item.jobId === job.id)
                .reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);
              
              return (
                <View key={job.id} style={styles.jobItem}>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobDescription}>{job.description}</Text>
                    <Text style={styles.jobDate}>{job.date}</Text>
                  </View>
                  
                  <View style={styles.jobActions}>
                    <Text style={styles.jobTotal}>${jobTotal.toFixed(2)}</Text>
                    
                    <TouchableOpacity 
                      style={styles.jobActionButton}
                      onPress={() => handleEditJob(job)}
                    >
                      <Ionicons name="create-outline" size={18} color="#333" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.jobActionButton}
                      onPress={() => handleDeleteJob(job.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#d9534f" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
        )}
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Job History Tracker</Text>
        <Text style={styles.subtitle}>Track and manage job history for your clients</Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setIsSettingsModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerButton, styles.addButton]}
            onPress={() => {
              setSelectedClient(undefined);
              setIsClientModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Client</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        {!isSignedIn ? (
          <View style={styles.loginContainer}>
            <Text style={styles.message}>Please sign in to continue</Text>
            <TouchableOpacity style={styles.loginButton} onPress={login}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#333" />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={32} color="#d9534f" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No clients yet</Text>
            <Text style={styles.emptySubtext}>Add your first client to get started</Text>
            <TouchableOpacity 
              style={styles.emptyAddButton}
              onPress={() => {
                setSelectedClient(undefined);
                setIsClientModalVisible(true);
              }}
            >
              <Text style={styles.emptyAddButtonText}>Add Client</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={clients}
            renderItem={renderClientItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
      
      {/* Modals */}
      <SettingsModal 
        isVisible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
      />
      
      <ClientModal 
        isVisible={isClientModalVisible}
        onClose={() => {
          setIsClientModalVisible(false);
          setSelectedClient(undefined);
        }}
        onSave={handleSaveClient}
        existingClient={selectedClient}
      />
      
      <JobModal 
        isVisible={isJobModalVisible}
        onClose={() => {
          setIsJobModalVisible(false);
          setSelectedJob(undefined);
          setSelectedJobItems([]);
          setSelectedClient(undefined);
        }}
        onSave={handleSaveJob}
        client={selectedClient}
        existingJob={selectedJob}
        existingItems={selectedJobItems}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  headerButtons: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#333',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  clientCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clientInfo: {
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  clientActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 16,
  },
  clientActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  clientActionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  jobsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  jobsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noJobsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  jobItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  jobInfo: {
    flex: 1,
  },
  jobDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  jobDate: {
    fontSize: 12,
    color: '#666',
  },
  jobActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  jobActionButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default HomeScreen;