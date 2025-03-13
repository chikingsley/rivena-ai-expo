import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { Text } from '@/components/ui/text';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const { theme, toggleTheme, useSystemTheme, setUseSystemTheme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [isPro, setIsPro] = useState(true);

  // Toggle haptic feedback
  const toggleHapticFeedback = () => {
    setHapticFeedback(!hapticFeedback);
    // Here you would typically save this preference to storage
  };

  // Toggle subscription status (for demo purposes)
  const toggleSubscription = () => {
    setIsPro(!isPro);
    // In a real app, this would navigate to subscription management
  };

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out...');
    // Here you would implement actual logout functionality
  };

  // Menu item component
  const MenuItem = ({ icon, label, onPress, rightElement }: {
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={24} color={Colors[theme].foreground} />
        <Text className="text-xl ml-4" style={{ color: Colors[theme].foreground }}>{label}</Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  // Toggle switch component
  const ToggleSwitch = ({ value, onToggle }: { value: boolean, onToggle: () => void }) => (
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{
        false: Colors[theme].muted,
        true: isPro ? Colors[theme].accent : Colors[theme].primary
      }}
      thumbColor={Colors[theme].background}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* Safe area padding for top */}
      <View style={{ height: insets.top }} />

      {/* Header */}
      <View style={styles.header}>
        <Text className="font-bold text-2xl" style={{ color: Colors[theme].foreground }}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Email with Pro/Free Badge */}
        <TouchableOpacity
          style={[styles.emailContainer, {
            borderColor: isPro ? Colors[theme].accent : Colors[theme].primary
          }]}
          onPress={toggleSubscription}
        >
          <View>
            <Text className="" style={{ color: Colors[theme].mutedForeground }}>Email</Text>
            <Text
              style={{ color: isPro ? Colors[theme].accent : Colors[theme].primary }}
              className="text-xl"
            >
              user@example.com
            </Text>
          </View>
          <View style={[styles.badge, {
            backgroundColor: isPro ? Colors[theme].accent : Colors[theme].primary
          }]}>
            <Text className="font-bold" style={{ color: '#ffffff' }}>{isPro ? 'Pro' : 'Free'}</Text>
          </View>
        </TouchableOpacity>

        {/* Speech Input Language */}
        <View style={[styles.languageContainer, { borderColor: Colors[theme].border }]}>
          <Text className="" style={{ color: Colors[theme].mutedForeground }}>Speech Input Language</Text>
          <View style={styles.languageSelector}>
            <Text className="text-xl" style={{ color: Colors[theme].foreground }}>
              English
            </Text>
            <Ionicons name="chevron-forward" size={24} color={Colors[theme].foreground} />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <MenuItem
            icon="person-outline"
            label="Profile"
            onPress={() => console.log('Profile pressed')}
          />

          <MenuItem
            icon="construct-outline"
            label="Tools"
            onPress={() => console.log('Tools pressed')}
          />

          <MenuItem
            icon="flash-outline"
            label="Haptic Feedback"
            rightElement={<ToggleSwitch value={hapticFeedback} onToggle={toggleHapticFeedback} />}
          />

          <MenuItem
            icon="moon-outline"
            label="Dark Mode"
            rightElement={<ToggleSwitch value={theme === 'dark'} onToggle={toggleTheme} />}
          />

          <MenuItem
            icon="sync-outline"
            label="Use System Theme"
            rightElement={<ToggleSwitch value={useSystemTheme} onToggle={() => setUseSystemTheme(!useSystemTheme)} />}
          />

          <MenuItem
            icon="card-outline"
            label="Billing"
            onPress={() => console.log('Billing pressed')}
          />
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Colors[theme].destructive} />
          <Text className="text-xl ml-4" style={{ color: Colors[theme].destructive }}>Log out</Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Safe area padding for bottom */}
      <View style={{ height: insets.bottom }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emailContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
  },
  languageContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  menuContainer: {
    marginVertical: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
});
