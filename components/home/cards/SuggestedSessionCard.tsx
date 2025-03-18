import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';

interface SuggestedSessionCardProps {
  title: string;
  description: string;
  duration: string;
  type: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
}

export function SuggestedSessionCard({ 
  title, 
  description, 
  duration, 
  type, 
  iconName, 
  iconColor,
  onPress 
}: SuggestedSessionCardProps) {
  const { theme } = useThemeStore();
  const [isPressed, setIsPressed] = useState(false);
  
  // Use provided color or default to primary
  const color = iconColor || Colors[theme].primary;
  
  return (
    <Pressable 
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={styles.cardWrapper}
    >
      <Card 
        className={`rounded-xl overflow-hidden w-full ${isPressed ? 'shadow-xl shadow-foreground/30 -translate-y-1' : 'shadow-lg shadow-foreground/20'}`}
        style={{ backgroundColor: Colors[theme].card }}
      >
        <CardContent className="p-4">
          <View style={styles.contentContainer}>
            <View style={[
              styles.iconCircle, 
              { backgroundColor: `${color}20` } // 20% opacity
            ]}>
              <Ionicons 
                name={iconName} 
                size={20} 
                color={color} 
              />
            </View>
            
            <View style={styles.textContainer}>
              <Text 
                className="text-sm text-muted-foreground"
                style={{ color: Colors[theme].mutedForeground }}
              >
                {description}
              </Text>
              <Text 
                className="text-base font-semibold mb-1"
                style={{ color: Colors[theme].text }}
              >
                {title}
              </Text>
              <Text 
                className="text-sm text-muted-foreground"
                style={{ color: Colors[theme].mutedForeground }}
              >
                {duration} • {type}
              </Text>
            </View>
            
            <View style={[
              styles.arrowCircle, 
              { backgroundColor: Colors[theme].primary }
            ]}>
              <Ionicons 
                name="arrow-forward" 
                size={18} 
                color="white" 
              />
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    marginBottom: 12,
    marginHorizontal: 2, // Add slight margin to prevent shadow clipping
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
