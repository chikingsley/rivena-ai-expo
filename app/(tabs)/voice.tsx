import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { 
  YStack, 
  Tabs, 
  Text, 
  Card,
  Separator,
  SizableText,
  XStack
} from 'tamagui';
import ProviderTester from '../../components/ProviderTester';

type VoiceProvider = 'openai' | 'hume';

export default function VoiceScreen() {
  const [selectedProvider, setSelectedProvider] = useState<VoiceProvider>('openai');
  const insets = useSafeAreaInsets();

  return (
    <YStack 
      flex={1} 
      padding="$4"
      paddingTop={insets.top}
      backgroundColor="$background"
    >
      <Text fontSize="$6" fontWeight="bold" textAlign="center" marginBottom="$4">
        Voice Provider Tester
      </Text>
      
      <Card elevate bordered padding="$4" marginBottom="$4">
        <Tabs
          defaultValue="openai"
          orientation="horizontal"
          flexDirection="column"
          value={selectedProvider}
          onValueChange={(value) => setSelectedProvider(value as VoiceProvider)}
        >
          <Tabs.List
            separator={<Separator vertical />}
            disablePassBorderRadius="bottom"
            backgroundColor="gray"
            borderRadius="$4"
          >
            <Tabs.Tab
              flex={1}
              value="openai"
              backgroundColor={selectedProvider === 'openai' ? 'blue' : 'transparent'}
            >
              <SizableText 
                fontFamily="$body"
                color={selectedProvider === 'openai' ? 'white' : '$color'}
              >
                OpenAI
              </SizableText>
            </Tabs.Tab>
            
            <Tabs.Tab
              flex={1}
              value="hume"
              backgroundColor={selectedProvider === 'hume' ? 'blue' : 'transparent'}
            >
              <SizableText 
                fontFamily="$body"
                color={selectedProvider === 'hume' ? 'white' : '$color'}
              >
                Hume AI
              </SizableText>
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        
        <XStack marginTop="$2" alignItems="center" justifyContent="center">
          <Text fontSize="$3" opacity={0.7}>
            Current selection: <Text fontWeight="bold">{selectedProvider}</Text>
          </Text>
        </XStack>
      </Card>
      
      <ProviderTester 
        providerType={selectedProvider} 
        uiConfig={{
          showSendAudioButton: false,
          useToggleButton: true,
        }}
      />
    </YStack>
  );
}