import { createHumeVoiceProvider } from './hume-voice';
import { createOpenAIVoiceProvider } from './openai-voice';
import { VoiceProvider } from './base/VoiceProvider';

/**
 * Type for OpenAI voice provider configuration
 */
export interface OpenAIProviderConfig {
  type: 'openai';
  model: string;
  middlewareEndpoint: string;
}

/**
 * Type for Hume voice provider configuration
 */
export interface HumeProviderConfig {
  type: 'hume';
  configId: string;
}

/**
 * Union type for all supported provider configurations
 */
export type ProviderConfig = OpenAIProviderConfig | HumeProviderConfig;

/**
 * Registry for voice providers
 */
export class VoiceProviderRegistry {
  private static instance: VoiceProviderRegistry;
  private providers: Map<string, VoiceProvider> = new Map();

  /**
   * Get the singleton instance of the registry
   */
  public static getInstance(): VoiceProviderRegistry {
    if (!VoiceProviderRegistry.instance) {
      VoiceProviderRegistry.instance = new VoiceProviderRegistry();
    }
    return VoiceProviderRegistry.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Create a voice provider based on the provided configuration
   * 
   * @param config Provider configuration
   * @param id Optional unique identifier for the provider
   * @returns A voice provider instance
   */
  public createProvider(config: ProviderConfig, id?: string): VoiceProvider {
    const providerId = id || `provider-${Date.now()}`;
    
    let provider: VoiceProvider;
    
    switch (config.type) {
      case 'openai':
        provider = createOpenAIVoiceProvider({
          model: config.model,
          serverMiddlewareEndpoint: config.middlewareEndpoint,
        });
        break;
        
      case 'hume':
        provider = createHumeVoiceProvider({
          configId: config.configId,
        });
        break;
        
      default:
        throw new Error(`Unsupported provider type: ${(config as any).type}`);
    }
    
    this.providers.set(providerId, provider);
    return provider;
  }

  /**
   * Get a provider by its ID
   * 
   * @param id Provider ID
   * @returns The provider instance or undefined if not found
   */
  public getProvider(id: string): VoiceProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Remove a provider from the registry
   * 
   * @param id Provider ID
   * @returns True if the provider was removed, false otherwise
   */
  public removeProvider(id: string): boolean {
    return this.providers.delete(id);
  }

  /**
   * Get all registered providers
   * 
   * @returns A map of all providers
   */
  public getAllProviders(): Map<string, VoiceProvider> {
    return new Map(this.providers);
  }

  /**
   * Create a provider from environment variables
   * 
   * @param type Provider type ('openai' or 'hume')
   * @param id Optional unique identifier for the provider
   * @returns A voice provider instance
   */
  public createProviderFromEnv(type: 'openai' | 'hume', id?: string): VoiceProvider {
    switch (type) {
      case 'openai':
        const openaiModel = process.env.EXPO_PUBLIC_OPENAI_MODEL;
        const middlewareEndpoint = process.env.EXPO_PUBLIC_MIDDLEWARE_ENDPOINT;
        
        if (!openaiModel || !middlewareEndpoint) {
          throw new Error('Missing environment variables for OpenAI provider: EXPO_PUBLIC_OPENAI_MODEL, EXPO_PUBLIC_MIDDLEWARE_ENDPOINT');
        }
        
        return this.createProvider({
          type: 'openai',
          model: openaiModel,
          middlewareEndpoint: middlewareEndpoint,
        }, id);
        
      case 'hume':
        const humeConfigId = process.env.EXPO_PUBLIC_HUME_CONFIG_ID;
        
        if (!humeConfigId) {
          throw new Error('Missing environment variable for Hume provider: EXPO_PUBLIC_HUME_CONFIG_ID');
        }
        
        return this.createProvider({
          type: 'hume',
          configId: humeConfigId,
        }, id);
        
      default:
        throw new Error(`Unsupported provider type: ${type}`);
    }
  }
}

// Export a singleton instance for easy access
export const voiceProviderRegistry = VoiceProviderRegistry.getInstance();

// Helper function to create providers
export function createVoiceProvider(config: ProviderConfig, id?: string): VoiceProvider {
  return voiceProviderRegistry.createProvider(config, id);
}

// Helper function to create providers from environment variables
export function createVoiceProviderFromEnv(type: 'openai' | 'hume', id?: string): VoiceProvider {
  return voiceProviderRegistry.createProviderFromEnv(type, id);
}
