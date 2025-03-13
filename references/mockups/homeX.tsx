import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VoiceChat from '../../components/session/VoiceChat';

export default function Voice2Screen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Voice Chat Demo</Text>
        <Text style={styles.subheaderText}>Using Provider Registry and Audio Processor</Text>
      </View>
      <VoiceChat initialProviderId="openai" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#343a40',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subheaderText: {
    fontSize: 14,
    color: '#ced4da',
    marginTop: 4,
  },
});