import React from 'react';
import { Card, Text, Paragraph, YStack, XStack, Theme, Avatar } from 'tamagui';

type MessageRole = 'user' | 'assistant' | 'system';

interface MessageProps {
  id: string;
  role: MessageRole;
  content: string;
  toolInvocations?: any;
}

export const MessageBubble = ({ id, role, content, toolInvocations }: MessageProps) => {
  // Determine color and alignment based on role
  const isUser = role === 'user';
  
  const getRoleTheme = (): string => {
    switch (role) {
      case 'user':
        return 'blue';
      case 'assistant':
        return 'green';
      case 'system':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const themeColor = getRoleTheme();
  
  // Get initials for avatar
  const getInitials = (): string => {
    switch (role) {
      case 'user':
        return 'U';
      case 'assistant':
        return 'AI';
      case 'system':
        return 'S';
      default:
        return '?';
    }
  };

  return (
    <XStack 
      key={id}
      width="100%"
      px="$2"
    >
      <Theme name={isUser ? 'blue' : 'green'}>
        <XStack 
          width="85%"
          gap="$2"
          flexDirection={isUser ? 'row-reverse' : 'row'}
        >
          {/* Avatar */}
          <Avatar 
            circular 
            size="$3"
          >
            <Avatar.Fallback delayMs={600}>
              <Text color="white" fontSize="$2">{getInitials()}</Text>
            </Avatar.Fallback>
          </Avatar>
          
          {/* Message Card */}
          <Card
            elevate
            size="$4"
            bordered
            animation="quick"
            backgroundColor="red"
            borderColor="blue"
            borderRadius="$4"
            borderTopRightRadius={isUser ? '$1' : '$4'}
            borderTopLeftRadius={isUser ? '$4' : '$1'}
          >
            <Card.Header px="$3" pt="$2" pb="$1">
              <Text 
                textTransform="capitalize" 
                color="white"
                fontWeight="bold"
                fontSize="$2"
              >
                {role}
              </Text>
            </Card.Header>
            
            <Card.Footer px="$3" pt="$1" pb="$3">
              {toolInvocations ? (
                <Paragraph fontFamily="$body" size="$3" lineHeight="$1">
                  {JSON.stringify(toolInvocations, null, 2)}
                </Paragraph>
              ) : (
                <Paragraph fontFamily="$body" size="$3" lineHeight="$1">
                  {content}
                </Paragraph>
              )}
            </Card.Footer>
          </Card>
        </XStack>
      </Theme>
    </XStack>
  );
};
