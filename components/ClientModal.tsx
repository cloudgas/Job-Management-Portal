import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Client } from '../types';

interface ClientModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  existingClient?: Client;
}

const ClientModal: React.FC<ClientModalProps> = ({ 
  isVisible, 
  onClose, 
  onSave,
  existingClient
}) => {
  // Initialize client state
  const [client, setClient] = useState<Partial<Client>>(existingClient || {
    name: '',
    email: '',
    phone: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  
  // Handle input change
  const handleChange = (field: keyof Client, value: string) => {
    setClient(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
    } = {};
    
    // Validate name
    if (!client.name || client.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    
    // Validate email (if provided)
    if (client.email && !/^\S+@\S+\.\S+$/.test(client.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Validate phone (if provided)
    if (client.phone && !/^[0-9+\-\s()]{7,15}$/.test(client.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      try {
        // Create client object
        const newClient: Client = {
          id: existingClient?.id || `client-${Date.now()}`,
          name: client.name!,
          email: client.email,
          phone: client.phone
        };
        
        console.log('Saving client from modal:', newClient);
        onSave(newClient);
      } catch (error) {
        console.error('Error in client modal save:', error);
        Alert.alert('Error', 'An error occurred while saving the client.');
      }
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
                  {existingClient ? 'Edit Client' : 'New Client'}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              {/* Content */}
              <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    value={client.name}
                    onChangeText={(text) => handleChange('name', text)}
                    placeholder="Client name"
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    value={client.email}
                    onChangeText={(text) => handleChange('email', text)}
                    placeholder="Email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    value={client.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                  />
                  {errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>
              </ScrollView>
              
              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save Client</Text>
                </TouchableOpacity>
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
    maxWidth: 500,
    maxHeight: '80%',
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
  contentContainer: {
    padding: 16,
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
  inputError: {
    borderColor: '#d9534f',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#666',
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

export default ClientModal;