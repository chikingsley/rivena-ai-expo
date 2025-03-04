// types/livekit.ts
import type { 
    Participant, 
    Room, 
    Track, 
    ConnectionState, 
    DisconnectReason,
    TrackPublication as LKTrackPublication,
    LocalParticipant as LKLocalParticipant
  } from 'livekit-client';
  
  // LiveKit Room Context
  export interface RoomState {
    connect: boolean;
    room?: Room;
  }
  
  // Local Participant
  export interface LocalParticipantState {
    localParticipant?: LocalParticipant;
  }
  
  // Extended Participant interface with React Native specific properties
  export interface LiveKitParticipant extends Participant {
    audioLevel: number;
    isSpeaking: boolean;
  }
  
  // Use the actual LiveKit LocalParticipant and extend it
  export interface LocalParticipant extends LKLocalParticipant {
    audioLevel: number;
    isSpeaking: boolean;
  }
  
  // LiveKit Room event types
  export interface RoomEventCallbacks {
    audioLevelChanged: (levels: Map<string, number>) => void;
  }
  
  // Extend Room with a more compatible approach
  export interface ExtendedRoom extends Omit<Room, 'on' | 'off'> {
    // Define the methods with compatible signatures
    on(
      event: string,
      listener: (...args: any[]) => void
    ): { dispose: () => void } | any;
    
    off(
      event: string,
      listener: (...args: any[]) => void
    ): Room;
  }
  
  // LiveKit hook return types
  export interface UseLocalParticipantResult {
    localParticipant: LocalParticipant;
  }
  
  export interface UseRoomContextResult extends ExtendedRoom {}
  
  // Properties for the AudioLevelMonitor component
  export interface AudioLevelMonitorProps {
    setAudioLevel: React.Dispatch<React.SetStateAction<number>>;
  }
  
  // LiveKit Room component props
  export interface LiveKitRoomProps {
    serverUrl: string;
    token: string;
    connect: boolean;
    options?: {
      adaptiveStream?: {
        pixelDensity?: 'screen' | 'logical';
      };
      audioCaptureDefaults?: {
        echoCancellation?: boolean;
        noiseSuppression?: boolean;
        autoGainControl?: boolean;
      };
    };
    audio?: boolean;
    video?: boolean;
    onConnected?: (room: Room) => void;
    onDisconnected?: (reason?: DisconnectReason) => void;
    onError?: (error: Error) => void;
    children?: React.ReactNode;
  }
  
  // Audio session type
  export interface AudioSessionType {
    startAudioSession: () => Promise<void>;
    stopAudioSession: () => void;
    requestPermissions?: () => Promise<boolean>;
  }