// components/ToolInvocationRenderer.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

interface ToolInvocationRendererProps {
  toolInvocation: any;
  addToolResult: (params: { toolCallId: string; result: any }) => void;
}

export const ToolInvocationRenderer: React.FC<ToolInvocationRendererProps> = ({
  toolInvocation,
  addToolResult,
}) => {
  const callId = toolInvocation.toolCallId;

  switch (toolInvocation.toolName) {
    case 'weather': {
      switch (toolInvocation.state) {
        case 'call':
          return (
            <View style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 8 }}>
              <Text>Getting weather for {toolInvocation.args.location}...</Text>
            </View>
          );
        case 'result':
          return (
            <View style={{ padding: 8, backgroundColor: '#e8f5e9', borderRadius: 8, marginTop: 8 }}>
              <Text>Weather in {toolInvocation.args.location}: {toolInvocation.result.temperature}°F</Text>
            </View>
          );
        default:
          return null;
      }
    }
    
    case 'convertFahrenheitToCelsius': {
      switch (toolInvocation.state) {
        case 'call':
          return (
            <View style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 8 }}>
              <Text>Converting {toolInvocation.args.temperature}°F to Celsius...</Text>
            </View>
          );
        case 'result':
          return (
            <View style={{ padding: 8, backgroundColor: '#e8f5e9', borderRadius: 8, marginTop: 8 }}>
              <Text>{toolInvocation.args.temperature}°F = {toolInvocation.result.celsius}°C</Text>
            </View>
          );
        default:
          return null;
      }
    }
    
    default:
      return (
        <View style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 8, marginTop: 8 }}>
          <Text>Unknown tool: {toolInvocation.toolName}</Text>
          <Text>{JSON.stringify(toolInvocation, null, 2)}</Text>
        </View>
      );
  }
};