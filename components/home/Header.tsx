import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

interface HeaderProps {
  username?: string;
  profileImage?: string;
  streak?: number;
  onProfilePress?: () => void;
}

export function Header({ 
  username = 'User', 
  profileImage,
  streak = 0,
  onProfilePress
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
  
  // Get current day name
  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };
  
  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      {/* Left side - Streak */}
      <View style={styles.streakContainer}>
        <View style={[styles.streakBadge, { backgroundColor: Colors[theme].accent }]}>
          <Ionicons 
            name="flame" 
            size={18} 
            color="white" 
          />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>
      
      {/* Middle - Greeting and Day */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: Colors[theme].foreground }]}>
          {getGreeting()}
        </Text>
        <Text style={[styles.dayText, { color: Colors[theme].muted }]}>
          {getDayName()}
        </Text>
      </View>
      
      {/* Right side - Profile Image */}
      <TouchableOpacity 
        style={styles.profileContainer}
        onPress={onProfilePress}
      >
        <View style={[styles.profileCircle, { borderColor: Colors[theme].primary }]}>
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: Colors[theme].primaryLight }]}>
              <Text style={[styles.profileInitial, { color: Colors[theme].primary }]}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
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
  profileContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  greetingContainer: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dayText: {
    fontSize: 14,
  },
  streakContainer: {
    width: 60,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
