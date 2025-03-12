import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

interface HeaderProps {
  username?: string;
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
}

export function Header({ 
  username = 'User', 
  onSettingsPress, 
  onNotificationsPress 
}: HeaderProps) {
  const { theme } = useThemeStore();
  
  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* Left side - Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: Colors[theme].muted }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.username, { color: Colors[theme].foreground }]}>
          {username}
        </Text>
      </View>
      
      {/* Right side - Icons */}
      <View style={styles.iconsContainer}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={onNotificationsPress}
        >
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color={Colors[theme].foreground} 
          />
          {/* Notification badge - can be conditionally rendered */}
          <View style={[styles.badge, { backgroundColor: Colors[theme].primary }]}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={onSettingsPress}
        >
          <Ionicons 
            name="settings-outline" 
            size={24} 
            color={Colors[theme].foreground} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
