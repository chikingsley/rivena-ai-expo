import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ProviderTester from '../components/ProviderTester';

type VoiceProvider = 'openai' | 'hume';

export default function VoiceScreen() {
  const [selectedProvider, setSelectedProvider] = useState<VoiceProvider>('openai');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Provider Tester</Text>
      
      <View style={styles.providerSelector}>
        <TouchableOpacity
          style={[
            styles.providerButton,
            selectedProvider === 'openai' && styles.selectedProvider
          ]}
          onPress={() => setSelectedProvider('openai')}
        >
          <Text style={styles.providerButtonText}>OpenAI</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.providerButton,
            selectedProvider === 'hume' && styles.selectedProvider
          ]}
          onPress={() => setSelectedProvider('hume')}
        >
          <Text style={styles.providerButtonText}>Hume AI</Text>
        </TouchableOpacity>
      </View>
      
      <ProviderTester providerType={selectedProvider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  providerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  providerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    minWidth: 120,
    alignItems: 'center',
  },
  selectedProvider: {
    backgroundColor: '#007bff',
  },
  providerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  }
}); 