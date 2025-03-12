import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutDown, LayoutAnimationConfig } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { WeeklyCalendar } from '@/components/home/WeeklyCalendar';
import { Header } from '@/components/home/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const GITHUB_AVATAR_URI =
  'https://i.pinimg.com/originals/ef/a2/8d/efa28d18a04e7fa40ed49eeb0ab660db.jpg';

export default function Screen() {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = React.useState(78);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  function updateProgressValue() {
    setProgress(Math.floor(Math.random() * 100));
  }
  
  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log('Selected date:', date.toDateString());
    // Here you would typically fetch data for the selected date
  };
  
  // Handle settings button press
  const handleSettingsPress = () => {
    console.log('Settings pressed');
    // Navigate to settings or open settings modal
  };
  
  // Handle notifications button press
  const handleNotificationsPress = () => {
    console.log('Notifications pressed');
    // Navigate to notifications or open notifications modal
  };
  return (
    <ScrollView style={styles.container}>
      {/* Safe area padding for top */}
      <View style={{ height: insets.top }} />
      
      {/* Header */}
      <Header 
        username="Rick Sanchez"
        streak={7}
        onProfilePress={() => console.log('Profile pressed')}
      />
      
      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <WeeklyCalendar 
          onDateSelect={handleDateSelect}
          initialDate={selectedDate}
        />
      </View>
      
      {/* Card Content */}
      <View style={styles.cardContainer}>
      <Card className='w-full max-w-sm p-6 rounded-2xl'>
        <CardHeader className='items-center'>
          <Avatar alt="Rick Sanchez's Avatar" className='w-24 h-24'>
            <AvatarImage source={{ uri: GITHUB_AVATAR_URI }} />
            <AvatarFallback>
              <Text>RS</Text>
            </AvatarFallback>
          </Avatar>
          <View className='p-3' />
          <CardTitle className='pb-2 text-center'>Rick Sanchez</CardTitle>
          <View className='flex-row'>
            <CardDescription className='text-base font-semibold'>Scientist</CardDescription>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className='px-2 pb-0.5 active:opacity-50'>
                <Ionicons name="information-circle" size={14} className='w-4 h-4 text-foreground/70' />
              </TooltipTrigger>
              <TooltipContent className='py-2 px-4 shadow'>
                <Text className='native:text-lg'>Freelance</Text>
              </TooltipContent>
            </Tooltip>
          </View>
        </CardHeader>
        <CardContent>
          <View className='flex-row justify-around gap-3'>
            <View className='items-center'>
              <Text className='text-sm text-muted-foreground'>Dimension</Text>
              <Text className='text-xl font-semibold'>C-137</Text>
            </View>
            <View className='items-center'>
              <Text className='text-sm text-muted-foreground'>Age</Text>
              <Text className='text-xl font-semibold'>70</Text>
            </View>
            <View className='items-center'>
              <Text className='text-sm text-muted-foreground'>Species</Text>
              <Text className='text-xl font-semibold'>Human</Text>
            </View>
          </View>
        </CardContent>
        <CardFooter className='flex-col gap-3 pb-0'>
          <View className='flex-row items-center overflow-hidden'>
            <Text className='text-sm text-muted-foreground'>Productivity:</Text>
            <LayoutAnimationConfig skipEntering>
              <Animated.View
                key={progress}
                entering={FadeInUp}
                exiting={FadeOutDown}
                className='w-11 items-center'
              >
                <Text className='text-sm font-bold text-sky-600'>{progress}%</Text>
              </Animated.View>
            </LayoutAnimationConfig>
          </View>
          <Progress value={progress} className='h-2' indicatorClassName='bg-sky-600' />
          <View />
          <Button
            variant='outline'
            className='shadow shadow-foreground/5'
            onPress={updateProgressValue}
          >
            <Text>Update</Text>
          </Button>
        </CardFooter>
      </Card>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  calendarSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 24,
    backgroundColor: Colors.light.secondary + '4D', // 30% opacity
  },
});
