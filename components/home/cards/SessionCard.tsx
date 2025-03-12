import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SessionCardProps {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function SessionCard({ title, subtitle, iconName, onPress }: SessionCardProps) {
  const { theme } = useThemeStore();
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <Pressable 
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={styles.cardWrapper}
    >
      <Card 
        className={`flex-1 justify-center rounded-xl pt-8 pb-4 overflow-hidden ${isPressed ? 'shadow-xl shadow-foreground/30 -translate-y-1' : 'shadow-lg shadow-foreground/20'}`}
      >
        <CardContent className="p-6 flex-col items-center justify-center">
          <Text className="text-2xl font-bold mb-1 text-center">{title}</Text>
          <Text className="text-muted-foreground text-lg mb-4 px-4 text-center">{subtitle}</Text>
          <View style={styles.iconContainer}>
              <Ionicons 
                name={iconName} 
                size={36} 
                color={Colors[theme].primary} 
              />
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    marginHorizontal: 1, // Add slight margin to prevent shadow clipping
    marginVertical: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
