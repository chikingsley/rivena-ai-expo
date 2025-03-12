import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const { theme } = useThemeStore();
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.profileCard}>
        <Image 
          source={{ uri: 'https://i.imgur.com/Ql4jRdI.png' }} 
          style={styles.avatar} 
        />
        <Text className="text-foreground font-bold text-xl mt-3">Rick Sanchez</Text>
        <Text className="text-muted-foreground">Scientist</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text className="text-muted-foreground text-sm">Dimension</Text>
            <Text className="text-foreground font-bold">C-137</Text>
          </View>
          <View style={styles.statItem}>
            <Text className="text-muted-foreground text-sm">Age</Text>
            <Text className="text-foreground font-bold">70</Text>
          </View>
          <View style={styles.statItem}>
            <Text className="text-muted-foreground text-sm">Species</Text>
            <Text className="text-foreground font-bold">Human</Text>
          </View>
        </View>
        
        <View style={styles.productivityContainer}>
          <Text className="text-muted-foreground text-sm mb-1">Productivity:</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBar, { width: '78%', backgroundColor: Colors[theme].primary }]} />
          </View>
          <Text className="text-primary font-medium text-sm mt-1">78%</Text>
        </View>
        
        <Pressable 
          style={[styles.updateButton, { backgroundColor: Colors[theme].card }]}
          className="shadow-sm"
        >
          <Text className="text-foreground font-medium">Update</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    width: '90%',
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    // Neomorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  productivityContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  updateButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    // Neomorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});