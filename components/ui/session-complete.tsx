import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './text';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface EmojiButtonProps {
  emoji: string;
  selected?: boolean;
  onPress: () => void;
}

function EmojiButton({ emoji, selected = false, onPress }: EmojiButtonProps) {
  return (
    <Pressable 
      onPress={onPress}
      className={`w-10 h-10 rounded-full items-center justify-center ${selected ? 'bg-primary/20' : ''}`}
    >
      <Text className="text-xl">{emoji}</Text>
    </Pressable>
  );
}

interface SessionCompleteProps {
  title?: string;
  duration?: string;
  onSaveSession?: () => void;
  onNewSession?: () => void;
}

export function SessionComplete({
  title = "Session Done!",
  duration = "10:00",
  onSaveSession,
  onNewSession
}: SessionCompleteProps) {
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null);
  
  const emojis = ["😊", "😌", "😔", "😢", "😡"];
  
  return (
    <Animated.View 
      entering={FadeInDown.duration(500).springify()}
      className="flex-1 justify-center items-center p-6"
    >
      <Card className="w-full max-w-sm rounded-3xl bg-card/95 backdrop-blur-md">
        <CardHeader className="items-center pt-8 pb-4">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Ionicons name="checkmark" size={32} className="text-primary" />
          </View>
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          <Text className="text-muted-foreground text-center mt-1">
            Congrats! You've finished your session
          </Text>
        </CardHeader>
        
        <CardContent className="items-center pb-4">
          <Text className="text-4xl font-bold text-primary">{duration}</Text>
          
          <View className="w-full mt-6">
            <Text className="text-sm text-muted-foreground text-center mb-3">
              How are you feeling now?
            </Text>
            <View className="flex-row justify-center space-x-2">
              {emojis.map((emoji) => (
                <EmojiButton 
                  key={emoji}
                  emoji={emoji}
                  selected={selectedEmoji === emoji}
                  onPress={() => setSelectedEmoji(emoji)}
                />
              ))}
            </View>
          </View>
        </CardContent>
        
        <CardFooter className="flex-col space-y-3 p-6 pt-2">
          <Button 
            className="w-full rounded-full bg-primary"
            onPress={onSaveSession}
          >
            <Text className="text-primary-foreground font-medium">Save Session</Text>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full rounded-full border-primary/20"
            onPress={onNewSession}
          >
            <Text className="text-primary font-medium">New Session</Text>
          </Button>
        </CardFooter>
      </Card>
    </Animated.View>
  );
}
